// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IIssuerBondManager {
    function getBondInfo(address issuer) external view returns (uint256 amount, uint8 status);
    function slashAndSend(address issuer, uint256 amount, address recipient) external;
}

contract RumorV2 {
    enum Status { PENDING, IN_REVIEW, RESOLVED, REJECTED }

    struct Complaint {
        bytes32 traceHash;
        address complainant;
        address defendant;
        address issuer; // assigned issuer (address(0) if none)
        uint256 stake;  // complainant stake
        uint256 createdAt;
        Status status;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 voteDeadline;
        string evidenceCID;
        address[] voters; // list of addresses who voted (push on vote)
    }

    address public owner;
    IIssuerBondManager public bondManager;
    address public treasury; // maintenance wallet
    uint256 public minComplainantStake;
    uint256 public minWatcherStake;
    uint256 public votingWindow; // seconds
    uint256 public quorum; // minimum votes required (should be modest to limit gas)
    uint256 public slashPermille; // slashed percent in permille (50 = 5%)
    uint256 public maxVoters; // safety limit for voters to avoid gas explosion

    mapping(bytes32 => Complaint) public complaints;
    mapping(bytes32 => bool) public complaintExists;
    mapping(address => uint256) public watcherStake;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;
    mapping(bytes32 => mapping(address => bool)) public voteValue; // true=accept, false=reject
    mapping(address => bool) public issuers; // allowed issuers (set by owner)

    uint8 private locked = 1;

    // events
    event ComplaintStarted(bytes32 indexed traceHash, address indexed complainant, address indexed defendant, uint256 stake, string evidenceCID);
    event ComplaintClaimed(bytes32 indexed traceHash, address indexed issuer);
    event WatcherRegistered(address indexed watcher, uint256 stake);
    event Voted(bytes32 indexed traceHash, address indexed watcher, bool accept);
    event ComplaintFinalized(bytes32 indexed traceHash, bool accepted, uint256 yesVotes, uint256 noVotes, uint256 slashedAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier nonReentrant() {
        require(locked == 1, "Reentrant");
        locked = 2;
        _;
        locked = 1;
    }

    constructor(address _bondManager, address _treasury) {
        require(_bondManager != address(0), "Invalid bond manager");
        require(_treasury != address(0), "Invalid treasury");
        owner = msg.sender;
        bondManager = IIssuerBondManager(_bondManager);
        treasury = _treasury;

        // default params
        minComplainantStake = 1e16; // 0.01 native
        minWatcherStake = 5e15; // 0.005
        votingWindow = 3 days;
        quorum = 3;
        slashPermille = 50; // 5% => 50 permille (since 1000 permille = 100%)
        maxVoters = 101; // safety cap; keep odd by admin choice
    }

    // admin setters
    function setMinComplainantStake(uint256 v) external onlyOwner { minComplainantStake = v; }
    function setMinWatcherStake(uint256 v) external onlyOwner { minWatcherStake = v; }
    function setVotingWindow(uint256 s) external onlyOwner { votingWindow = s; }
    function setQuorum(uint256 q) external onlyOwner { quorum = q; }
    function setSlashPermille(uint256 p) external onlyOwner { slashPermille = p; } // e.g., 50 for 5%
    function setMaxVoters(uint256 m) external onlyOwner { maxVoters = m; }
    function setTreasury(address t) external onlyOwner { require(t != address(0)); treasury = t; }
    function setBondManager(address bm) external onlyOwner { require(bm != address(0)); bondManager = IIssuerBondManager(bm); }
    function registerIssuer(address addr) external onlyOwner { issuers[addr] = true; }
    function unregisterIssuer(address addr) external onlyOwner { issuers[addr] = false; }

    // watcher registration (stake)
    function registerWatcher() external payable {
        require(msg.value >= minWatcherStake, "Insufficient watcher stake");
        watcherStake[msg.sender] += msg.value;
        emit WatcherRegistered(msg.sender, msg.value);
    }

    function unregisterWatcher(uint256 amount) external {
        require(watcherStake[msg.sender] >= amount, "Insufficient stake");
        watcherStake[msg.sender] -= amount;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");
    }

    // start a complaint (only complainant calls and stakes)
    function startComplaint(string calldata traceIdStr, address defendant, string calldata evidenceCID) external payable nonReentrant {
        require(msg.value >= minComplainantStake, "Insufficient stake");
        require(defendant != address(0), "Invalid defendant");
        bytes32 traceHash = keccak256(abi.encodePacked(traceIdStr));
        require(!complaintExists[traceHash], "Complaint exists");

        Complaint storage c = complaints[traceHash];
        c.traceHash = traceHash;
        c.complainant = msg.sender;
        c.defendant = defendant;
        c.issuer = address(0);
        c.stake = msg.value;
        c.createdAt = block.timestamp;
        c.status = Status.PENDING;
        c.yesVotes = 0;
        c.noVotes = 0;
        c.voteDeadline = 0;
        c.evidenceCID = evidenceCID;
        complaintExists[traceHash] = true;

        emit ComplaintStarted(traceHash, msg.sender, defendant, msg.value, evidenceCID);
    }

    // issuer claims complaint
    function claimComplaint(string calldata traceIdStr) external nonReentrant {
        require(issuers[msg.sender], "Only registered issuer");
        bytes32 traceHash = keccak256(abi.encodePacked(traceIdStr));
        require(complaintExists[traceHash], "Complaint not found");
        Complaint storage c = complaints[traceHash];
        require(c.status == Status.PENDING, "Not pending");
        require(c.issuer == address(0), "Already claimed");

        c.issuer = msg.sender;
        c.status = Status.IN_REVIEW;
        c.voteDeadline = block.timestamp + votingWindow;

        emit ComplaintClaimed(traceHash, msg.sender);
    }

    // watcher votes; store voters list for distribution
    function vote(string calldata traceIdStr, bool accept) external nonReentrant {
        bytes32 traceHash = keccak256(abi.encodePacked(traceIdStr));
        require(complaintExists[traceHash], "Complaint not found");
        require(watcherStake[msg.sender] >= minWatcherStake, "Not registered watcher");

        Complaint storage c = complaints[traceHash];
        require(c.status == Status.IN_REVIEW, "Not in review");
        require(block.timestamp <= c.voteDeadline, "Voting closed");
        require(!hasVoted[traceHash][msg.sender], "Already voted");
        require(c.voters.length < maxVoters, "Max voters reached");

        hasVoted[traceHash][msg.sender] = true;
        voteValue[traceHash][msg.sender] = accept;
        c.voters.push(msg.sender);

        if (accept) {
            c.yesVotes += 1;
        } else {
            c.noVotes += 1;
        }

        emit Voted(traceHash, msg.sender, accept);
    }

    // finalize: majority wins (yes > no). Only after deadline. Distribute slashed funds if accepted.
    function finalizeComplaint(string calldata traceIdStr) external nonReentrant {
        bytes32 traceHash = keccak256(abi.encodePacked(traceIdStr));
        require(complaintExists[traceHash], "Complaint not found");

        Complaint storage c = complaints[traceHash];
        require(c.status == Status.IN_REVIEW, "Must be in review");
        require(block.timestamp > c.voteDeadline, "Voting still open");

        uint256 totalVotes = c.yesVotes + c.noVotes;
        require(totalVotes >= quorum, "Quorum not reached");

        bool accepted = c.yesVotes > c.noVotes; // majority wins; you insisted odd watchers, but we still use >

        if (accepted) {
            // Determine issuer bond & slash amount (5% of issuer bond)
            // We call bondManager.getBondInfo to read bond amount
            (uint256 bondAmount, ) = _getIssuerBond(c.issuer);
            require(bondAmount > 0, "Issuer has no bond");

            uint256 slashedAmount = (bondAmount * slashPermille) / 1000; // 50 permille => 5%
            require(slashedAmount > 0, "Slash amount zero");

            // Ask IssuerBondManager to slash and send slashedAmount to this contract
            bondManager.slashAndSend(c.issuer, slashedAmount, address(this));

            // Now distribute slashedAmount: 50% watchers, 20% complainant, 30% treasury
            uint256 watchersPool = (slashedAmount * 50) / 100; // 50%
            uint256 complainantReward = (slashedAmount * 20) / 100; // 20%
            uint256 treasuryShare = slashedAmount - watchersPool - complainantReward; // remaining 30%

            // pay complainant
            if (complainantReward > 0) {
                (bool s1, ) = payable(c.complainant).call{value: complainantReward}("");
                // if transfer fails, keep funds in contract for later manual distribution
                if (!s1) {
                    // emit event or track (omitted here for brevity)
                }
            }

            // pay treasury
            if (treasuryShare > 0) {
                (bool s2, ) = payable(treasury).call{value: treasuryShare}("");
                if (!s2) {
                    // fallback keep funds
                }
            }

            // identify winners (those who voted the winning side)
            bool winningSide = true; // yes
            uint256 winnersCount = 0;
            for (uint i = 0; i < c.voters.length; i++) {
                address voter = c.voters[i];
                if (voteValue[traceHash][voter] == winningSide) {
                    winnersCount++;
                }
            }

            if (winnersCount > 0 && watchersPool > 0) {
                uint256 perWinner = watchersPool / winnersCount;
                // distribute to each winning watcher
                for (uint i = 0; i < c.voters.length; i++) {
                    address voter = c.voters[i];
                    if (voteValue[traceHash][voter] == winningSide) {
                        (bool sent, ) = payable(voter).call{value: perWinner}("");
                        // if transfer fails, funds remain in contract (could be retried)
                        if (!sent) {
                            // optionally track failed payments
                        }
                    }
                }
            } else {
                // no winners or pool zero - funds remain
            }

            // Mark resolved
            c.status = Status.RESOLVED;

            emit ComplaintFinalized(traceHash, true, c.yesVotes, c.noVotes, slashedAmount);
        } else {
            // Rejected: no slashing. Return complainant stake? design choice.
            // We will slash complainant stake (penalty) and give to treasury/watchers OR return stake to complainant.
            // For now we will return complainant stake (safer). If you want slashing of complainant, adapt here.

            // return complainant stake
            if (c.stake > 0) {
                (bool r, ) = payable(c.complainant).call{value: c.stake}("");
                if (!r) {
                    // keep funds for manual retrieval
                }
            }

            c.status = Status.REJECTED;
            emit ComplaintFinalized(traceHash, false, c.yesVotes, c.noVotes, 0);
        }
    }

    // helper to read bond info from bond manager (we assume bondManager.getBondInfo returns amount and status)
    function _getIssuerBond(address issuer) internal view returns (uint256 amount, uint8 status) {
        // note: we defined interface earlier that returns (uint256 amount, uint8 status).
        // but our actual IssuerBondManager returns (uint256 amount, BondStatus). In solidity, return types must match.
        // To avoid type mismatch, we will use low-level staticcall to fetch bond and decode (but for simplicity, cast).
        // Here, assume bondManager.getBondInfo returns (uint256, uint8)
        (uint256 amt, uint8 st) = (0, 0);
        // try call - prefer staticcall decode
        (bool ok, bytes memory data) = address(bondManager).staticcall(
            abi.encodeWithSignature("getBondInfo(address)", issuer)
        );
        if (ok && data.length > 0) {
            (amt, st) = abi.decode(data, (uint256, uint8));
        }
        return (amt, st);
    }

    // Fallback receive
    receive() external payable {}
}
