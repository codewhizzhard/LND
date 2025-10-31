// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IssuerBondManager
/// @notice Manage issuer global bonds; supports locking, requesting withdrawal and authorized slashing.
/// @dev ComplaintLifecycle will be authorized to call `slashAndSend`.
contract IssuerBondManager {
    enum BondStatus { None, Locked, PendingWithdrawal, Released, Slashed }

    struct Bond {
        uint256 amount;
        BondStatus status;
    }

    address public admin;
    address public maintenanceWallet;
    mapping(address => Bond) public bonds;

    // Authorized contract (ComplaintLifecycle) that may request slashing
    address public authorizedSlashCaller;

    event BondLocked(address indexed issuer, uint256 amount);
    event WithdrawalRequested(address indexed issuer);
    event BondReleased(address indexed issuer, uint256 amount);
    event BondSlashed(address indexed issuer, uint256 amount, address indexed to);
    event MaintenanceWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event AuthorizedSlashCallerUpdated(address indexed oldCaller, address indexed newCaller);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAuthorizedSlashCaller() {
        require(msg.sender == authorizedSlashCaller, "Only authorized caller");
        _;
    }

    constructor(address _maintenanceWallet) {
        require(_maintenanceWallet != address(0), "Invalid maintenance wallet");
        admin = msg.sender;
        maintenanceWallet = _maintenanceWallet;
    }

    /**
     * @notice Lock bond (send native currency to contract)
     */
    function lockBond() external payable {
        require(msg.value > 0, "No bond sent");
        Bond storage b = bonds[msg.sender];
        require(b.status == BondStatus.None || b.status == BondStatus.Released, "Active bond exists");

        b.amount = msg.value;
        b.status = BondStatus.Locked;

        emit BondLocked(msg.sender, msg.value);
    }

    /**
     * @notice Request withdrawal (admin must approve)
     */
    function requestWithdrawal() external {
        Bond storage b = bonds[msg.sender];
        require(b.status == BondStatus.Locked, "Bond not locked or invalid");
        b.status = BondStatus.PendingWithdrawal;
        emit WithdrawalRequested(msg.sender);
    }

    /**
     * @notice Admin releases bond after approval
     */
    function releaseBond(address issuer) external onlyAdmin {
        Bond storage b = bonds[issuer];
        require(b.status == BondStatus.PendingWithdrawal, "Not pending release");
        uint256 amount = b.amount;
        require(amount > 0, "Nothing to release");
        b.status = BondStatus.Released;
        b.amount = 0;
        (bool sent, ) = payable(issuer).call{value: amount}("");
        require(sent, "Release transfer failed");
        emit BondReleased(issuer, amount);
    }

    /**
     * @notice Admin slashes issuer's bond and sends to maintenance wallet
     */
    function slashBondAdmin(address issuer) external onlyAdmin {
        Bond storage b = bonds[issuer];
        require(b.status == BondStatus.Locked || b.status == BondStatus.PendingWithdrawal, "Invalid state for slashing");
        uint256 amount = b.amount;
        require(amount > 0, "No funds to slash");
        b.status = BondStatus.Slashed;
        b.amount = 0;
        (bool sent, ) = payable(maintenanceWallet).call{value: amount}("");
        require(sent, "Slash transfer failed");
        emit BondSlashed(issuer, amount, maintenanceWallet);
    }

    /**
     * @notice Authorize the complaint contract to call slashAndSend
     */
    function setAuthorizedSlashCaller(address _caller) external onlyAdmin {
        address old = authorizedSlashCaller;
        authorizedSlashCaller = _caller;
        emit AuthorizedSlashCallerUpdated(old, _caller);
    }

    /**
     * @notice Slash a portion of the issuer bond and send to `recipient` (only callable by authorized contract)
     * @param issuer address whose bond will be slashed
     * @param amount amount to slash (wei / tinybars)
     * @param recipient recipient to which slashed funds will be transferred (e.g., ComplaintLifecycle)
     */
    function slashAndSend(address issuer, uint256 amount, address recipient) external onlyAuthorizedSlashCaller {
        require(recipient != address(0), "Invalid recipient");
        Bond storage b = bonds[issuer];
        require(b.amount >= amount, "Insufficient bond for slash");
        require(b.status == BondStatus.Locked || b.status == BondStatus.PendingWithdrawal, "Invalid bond state");

        // deduct
        b.amount -= amount;
        // if bond becomes zero, mark as released/slashed
        if (b.amount == 0) {
            b.status = BondStatus.Slashed;
        }

        // send funds to recipient
        (bool sent, ) = payable(recipient).call{value: amount}("");
        require(sent, "Transfer to recipient failed");

        emit BondSlashed(issuer, amount, recipient);
    }

    /**
     * @notice Update maintenance wallet (admin only)
     */
    function updateMaintenanceWallet(address newWallet) external onlyAdmin {
        require(newWallet != address(0), "Invalid address");
        address old = maintenanceWallet;
        maintenanceWallet = newWallet;
        emit MaintenanceWalletUpdated(old, newWallet);
    }

    /**
     * @notice Get bond info
     */
    function getBondInfo(address issuer) external view returns (uint256 amount, BondStatus status) {
        Bond memory b = bonds[issuer];
        return (b.amount, b.status);
    }

    receive() external payable {}
    fallback() external payable {}
}
