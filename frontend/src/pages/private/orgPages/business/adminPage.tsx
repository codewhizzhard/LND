import { useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileCheck,
  AlertCircle,
  Building2,
  BadgeCheck,
} from "lucide-react";
import { CustomDialog } from "./modal"; // Reusable modal component
import sdk from "../../../../sdk";
import { Unauthorized } from "../unauthorized";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";


interface RumorStats {
  in_review: number;
  rejected: number;
  resolved: number;
  rumor: number;
  total: number;
}

export const BusinessAdminPage = () => {
let creator: any = {}; // initialize to avoid "used before assigned"

const creatorString = localStorage.getItem("creator");
if (creatorString) {
  try {
    creator = JSON.parse(creatorString);
  } catch (err) {
    console.error("Failed to parse creator from localStorage:", err);
    creator = {};
  }
}
  const [overviewOpen, setOverviewOpen] = useState(true);
  // Modal states
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [workerDID, setWorkerDID] = useState("");
  const [workerRole, setWorkerRole] = useState<"worker" | "admin">("worker");



const [loadingAddWorker, setLoadingAddWorker] = useState(false);
  const [viewWorkersOpen, setViewWorkersOpen] = useState(false);
  const [createWorkOpen, setCreateWorkOpen] = useState(false);
  const [viewWorkOpen, setViewWorkOpen] = useState(false);
  const [viewComplaintsOpen, setViewComplaintsOpen] = useState(false);
  const [requestReviewOpen, setRequestReviewOpen] = useState(false);

    const [business, setBusiness] = useState<any>(null);
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [workerStats, setWorkerStats] = useState();
    const [rumors, setRumors] = useState<any[]>([]);
    const [rumorStats, setRumorStats] = useState<RumorStats>({
        in_review: 0,
        rejected: 0,
        resolved: 0,
        rumor: 0,
        total: 0,
});
  const [showIssuers, setShowIssuers] = useState(false)
    const [issuers, setIssuers] = useState<any[]>([]);
  const [loadingIssuers, setLoadingIssuers] = useState(false);
  const [issuerFilters, setIssuerFilters] = useState<{ name?: string; sector?: string }>({});
  const [requestLoading, setRequestLoading] = useState<{ [key: string]: boolean }>({});


    const navigate = useNavigate();
useEffect(() => {
  if (!creator) {
    toast.error("Login to get your data back");
    setLoading(false);
    return;
  }

  const fetchBusinessWorkersRumors = async () => {
    if (!creator?.role) {
      setBusiness(null);
      setWorkers([]);
      setRumors([]); // clear rumors
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Map creator.role to SDK role
    const role = creator.role === "organization" ? "business" : "worker";

    try {
      // 1️⃣ Fetch business
      const resBusiness = await sdk.orgGetBusiness(role);
      console.log("busi:", resBusiness);

      if (!resBusiness.success) {
        setError(resBusiness.error ?? null);
        toast.error(resBusiness.error);
        setBusiness(null);
        setWorkers([]);
        setRumors([]);
        return;
      }

      const businessData = resBusiness.data?.business;
      setBusiness(businessData);

      // 2️⃣ Fetch workers using orgDID
      if (businessData?.orgDID) {
        const resWorkers = await sdk.orgGetWorkers(businessData.orgDID);
        console.log("res:", resWorkers);
        if (resWorkers.success) {
          setWorkerStats(resWorkers.data.total);
          setWorkers(resWorkers.data.workers || []);
        } else {
          toast.error(resWorkers.error || "Failed to fetch workers");
          setWorkers([]);
        }

        // 3️⃣ Fetch rumors for this business
        const resRumors = await sdk.orgBusinessRumors(businessData.orgDID);
        console.log("rumors:", resRumors);
        if (resRumors.success) {
          setRumors(resRumors.data.data.rumors || []);
          setRumorStats(resRumors.data.data.stats)
        } else {
          toast.error(resRumors.error || "Failed to fetch rumors");
          setRumors([]);
        }
      } else {
        setWorkers([]);
        setRumors([]);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      toast.error("An error occurred while fetching data.");
      setBusiness(null);
      setWorkers([]);
      setRumors([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBusinessWorkersRumors();
}, []);


  const toggleStyle = useSpring({
    transform: overviewOpen
      ? "rotateY(180deg) scale(1.2)"
      : "rotateY(0deg) scale(1)",
    config: { tension: 300, friction: 20 },
  });



// fetch function
const fetchIssuers = async () => {
  setLoadingIssuers(true);
  try {
    const res = await sdk.orgIssuers(issuerFilters.sector, issuerFilters.name);
    console.log("issuer:", res)
    if (res.success) {
      setIssuers(res.data?.data || []);
    } else {
      toast.error(res.error || "Failed to fetch issuers");
      setIssuers([]);
    }
  } catch (err: any) {
    console.error("Error fetching issuers:", err);
    toast.error("An error occurred while fetching issuers.");
    setIssuers([]);
  } finally {
    setLoadingIssuers(false);
  }
};



// handle filter input
const handleFilterChange = (key: "name" | "sector", value: string) => {
  setIssuerFilters(prev => ({ ...prev, [key]: value }));
};


// state to track loading per issuer


const requestTrust = async (issuerDID: string) => {
  if (!issuerDID) {
    toast.error("Pick a valid user");
    return;
  }

  try {
    // set loading for this issuer
    setRequestLoading(prev => ({ ...prev, [issuerDID]: true }));

    const res = await sdk.orgRequestIssuerTrust(issuerDID);

    if (res.success) {
      toast.success("Trust request sent successfully");
    } else {
      toast.error(res.error || "Failed to request trust");
    }
  } catch (err: any) {
    console.error("Error requesting trust:", err);
    toast.error("An error occurred while requesting trust");
  } finally {
    // reset loading for this issuer
    setRequestLoading(prev => ({ ...prev, [issuerDID]: false }));
  }
};




  /* add worker */
  const handleAddWorker = async () => {
  if (!business?.orgDID) {
    toast.error("Business DID not found");
    return;
  }

  if (!workerName || !workerDID) {
    toast.error("All fields are required");
    return;
  }

  try {
    setLoadingAddWorker(true);

    const res = await sdk.orgAddWorker(
      business.orgDID,
      workerName,
      workerDID,
      workerRole,
    );

    if (!res?.success) {
      toast.error(res?.error || "Unable to add worker");
      return;
    }

    toast.success("Worker added successfully!");

    // Clear fields
    setWorkerName("");
    setWorkerDID("");
    setWorkerRole("worker");

    // close dialog
    setAddWorkerOpen(false);

    // Reload workers
  
  } catch (error: any) {
    toast.error(error?.message || "Unexpected error");
  } finally {
    setLoadingAddWorker(false);
  }
};


// Loading state
if (loading) {
  return (
    <div className="h-screen flex items-center justify-center text-lg font-medium">
      Checking Authorization...
    </div>
  );
}

// Unauthorized
if (!loading && (!business || business.length === 0)) {
  return <Unauthorized />;
}



/// Status review

const isPending = business?.status === "PENDING";
const isRevoked = business?.status === "REVOKED";
const isActive = business?.status === "ACTIVE";

const renderBusinessContent = () => {
  return (
    <>

      {/* PENDING STATE */}
      {isPending && (
        <Card className="mt-4 border-yellow-300 shadow-md">
          <CardHeader>
            <CardTitle className="text-yellow-700">
              Begin Your Verification Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              Your business is currently under review. To activate your account,
              you must find a trusted <span className="font-semibold">Issuer</span> who will verify your authenticity and credibility.
            </p>
            <p>
              Be transparent, cooperative, and provide accurate information during verification.
              Issuers act as guarantors — and their reputation is tied to yours.
            </p>
            <p className="text-red-600 font-semibold">
              Any dishonesty, fraud, or suspicious behavior may lead to rejection or delayed approval.
            </p>
            <p>
              Once verified, your business will gain access to on-chain interactions, trust-based visibility, and earning opportunities.
            </p>

                <button className="bg-green-400 p-2 rounded-sm text-center w-full cursor-pointer" onClick={() => {
                setShowIssuers(true);
                fetchIssuers();
                }}>View Issuers</button>
          </CardContent>
        </Card>
      )}

      {/* REVOKED STATE */}
      {isRevoked && (
        <Card className="mt-4 border-red-300 shadow-md">
          <CardHeader>
            <CardTitle className="text-red-700">
              Verification Revoked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              Your business has lost its verified status due to trust-breaking behavior or unresolved complaints.
              A visible <span className="text-red-600 font-semibold">Broken Trust Badge</span> is now displayed on your profile.
            </p>
            <p className="text-red-600 font-semibold">
              All on-chain transactions and business activities are temporarily disabled.
            </p>
            <p>
              Depending on the severity and number of reports, penalties or financial deductions may apply.
              The Watchers will conduct a review to determine if your account may be reinstated.
            </p>
            <p>
              To restore your status, cooperate fully, demonstrate accountability, and rebuild trust through dispute resolution.
            </p>

            <Button variant="secondary" onClick={() => setRequestReviewOpen(true)}>
              Request Re-Evaluation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ACTIVE STATE */}
      {isActive && (
        <Card className="mt-4 border-green-300 shadow-md">
          <CardHeader>
            <CardTitle className="text-green-700">
              Verified & Trusted Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              Your business is fully verified and trusted on the network. You can now transact, interact,
              and grow with confidence — backed by on-chain proof of your credibility.
            </p>
            <p>
              Maintain this trust by delivering excellent service, being transparent, and ensuring all interactions stay within the platform
              for proper monitoring and traceability.
            </p>
            <p className="text-green-600 font-semibold">
              A positive trust record attracts more customers, increases transaction volume, and boosts your earning potential.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
};




 

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* ===== Fixed Business Overview ===== */}
      <div className="hidden lg:block fixed top-6 left-6 z-50 transition-all duration-300">
        <Card
          className={`border-blue-300 shadow-lg rounded-lg overflow-hidden transition-all duration-500 ${
            overviewOpen ? "w-72" : "w-12"
          }`}
        >
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              ← Back
            </button>
            <CardHeader className="flex justify-between items-center px-3 py-2">
            {overviewOpen && (
              <CardTitle className="flex items-center gap-3 text-blue-700 text-base">
                <Building2 className="w-6 h-6" />
                Business Overview
              </CardTitle>
            )}

            {/* Toggle Button */}
            <Button
              size="sm"
              variant="ghost"
              className="p-2"
              onClick={() => setOverviewOpen(!overviewOpen)}
            >
              <animated.div
                style={toggleStyle}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg shadow-lg cursor-pointer text-lg font-bold"
              >
                {overviewOpen ? "<" : ">"}
              </animated.div>
            </Button>
          </CardHeader>

          {overviewOpen && (
            <CardContent className="space-y-3 text-sm px-3 pb-3">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="font-semibold text-gray-600">Name</p>
                  <p className="text-gray-800">{business?.name?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Account ID</p>
                  <p className="text-gray-800">{business?.accountId}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Account DID</p>
                  <p className="text-gray-800">{`${business?.orgDID.slice(0, 18)}...${business?.orgDID.slice(-11)}`}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Verified By</p>
                  {business?.status === "PENDING" ? <p className="text-red-600">!NOT YET VERIFIED</p> : 
                   <p className="text-gray-800">{business?.issuerDID}</p>
                  }
                  
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* ===== Scrollable Right Column ===== */}
      <div
  className={`px-6 py-8 flex flex-col gap-3 transition-all duration-300 ${
    overviewOpen ? "lg:ml-80" : "lg:ml-16"
  }`}
>
  {/* Quick Stats - Fixed Higher */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sticky top-4 bg-white z-50 p-4 shadow-md rounded-md">
    <Card className="border-green-300 shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Status</p>
      <span className="mt-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
        {business?.status}
      </span>
    </Card>

    <Card className="border-red-300 shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Rumors</p>
      <span className="mt-1 px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-sm">
        {rumorStats?.total} Unresolved
      </span>
    </Card>

    <Card className="border-blue-300 shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Workers</p>
      <span className="mt-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
        {workerStats}
      </span>
    </Card>

    <Card className="border-yellow-300 shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Work Orders</p>
      <span className="mt-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">
        8 Ongoing
      </span>
    </Card>
  </div>
    <div className="flex flex-col gap-6 mt-6">
        {/* Workers Management */}
        <Card className="border-green-300 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Users className="w-5 h-5" />
              Workers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 text-sm">
              Manage your business workers, add or remove workers, and assign tasks.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => setAddWorkerOpen(true)} className="cursor-pointer">Add Worker</Button>
              <Button variant="secondary" onClick={() => setViewWorkersOpen(true)} className="cursor-pointer">
                View All Workers
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Work / Task Management */}
        <Card className="border-yellow-300 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <FileCheck className="w-5 h-5" />
              Work Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 text-sm">
              Issue or manage work tasks assigned to workers.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => setCreateWorkOpen(true)} className="cursor-pointer">Create Work</Button>
              <Button variant="secondary" onClick={() => setViewWorkOpen(true)} className="cursor-pointer">
                View All Work
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints */}
        <Card className="border-red-300 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Rumors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 text-sm">
              View and track complaints related to your business operations.
            </p>
            <Button variant="outline" onClick={() => setViewComplaintsOpen(true)} className="cursor-pointer">
              View Rumors
            </Button>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card className="border-purple-300 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <BadgeCheck className="w-5 h-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 text-sm">
              Your business is currently{" "}
              <span className="text-green-600 font-semibold">{business?.status}</span>
            </p>
            <Button variant="secondary" onClick={() => setRequestReviewOpen(true)} className="cursor-pointer">
              Request Review
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* ===== Modals for Actions ===== */}
      <CustomDialog
      open={addWorkerOpen}
      onOpenChange={setAddWorkerOpen}
      title="Add Worker"
    >
      <div className="space-y-4">

        <input
          type="text"
          placeholder="Worker Name"
          value={workerName}
          onChange={(e) => setWorkerName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Worker DID"
          value={workerDID}
          onChange={(e) => setWorkerDID(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        {/* Role Dropdown */}
        <select
          value={workerRole}
          onChange={(e) => setWorkerRole(e.target.value as "worker" | "admin")}
          className="w-full border rounded px-3 py-2"
        >
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>

        <div className="flex justify-end gap-3">
          <Button onClick={handleAddWorker} disabled={loadingAddWorker}>
            {loadingAddWorker ? "Adding..." : "Add"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setAddWorkerOpen(false)}
          >
            Cancel
          </Button>
        </div>

      </div>
    </CustomDialog>


      <CustomDialog
        open={viewWorkersOpen}
        onOpenChange={setViewWorkersOpen}
        title="All Workers"
      >
        <div className="text-gray-700">
          {workers?.map((worker) => (
            <p>{worker}</p>
          ))}
        </div>
      </CustomDialog>

   <CustomDialog
    open={showIssuers}
    onOpenChange={setShowIssuers}
    title="Verified Issuers"
    zIndex={50}
  >
  <div className="flex flex-col gap-1 p-1 w-full">
    {/* Search Filters */}
    <div className="flex gap-2 w-full">
      <input
        type="text"
        placeholder="Search by name"
        className="flex-1 min-w-0 px-1 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        onChange={e => handleFilterChange("name", e.target.value)}
      />
      <input
        type="text"
        placeholder="Search by sector"
        className="flex-1 min-w-0 px-1 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        onChange={e => handleFilterChange("sector", e.target.value)}
      />
    </div>

    {/* View Issuers Button */}
    <button
      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1.5 rounded-md shadow-md transition-colors duration-200 self-start cursor-pointer"
      onClick={fetchIssuers}
      disabled={loadingIssuers}
    >
      {loadingIssuers ? "Loading..." : "Reload"}
    </button>

    {/* Issuer List */}
    <div className="mt-2 w-full max-h-64 overflow-y-scroll">
      {loadingIssuers && <p className="text-gray-500 text-center">Loading issuers...</p>}
      {!loadingIssuers && issuers.length === 0 && (
        <p className="text-gray-500 text-center">No issuers found</p>
        
      )}
      {!loadingIssuers && issuers.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          {issuers.map((issuer: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 border rounded-md shadow-sm hover:bg-green-50 transition-colors duration-150 w-full"
            >
              <div className="flex flex-col">
                <p className="font-semibold text-gray-800 truncate">{issuer?.name?.toUpperCase()}</p>
                <p className="text-sm text-gray-500 truncate">{issuer?.sector}</p>
                <p className="text-sm text-gray-500 truncate">
                  {issuer?.issuerDID
                    ? `${issuer.issuerDID.slice(0, 15)}...${issuer.issuerDID.slice(-8)}`
                    : ""}
                </p>
              </div>
              <div
                className={`text-white font-semibold cursor-pointer p-2 rounded-sm flex items-center justify-center 
                  ${requestLoading[issuer?.issuerDID] ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={() => {
                  if (!requestLoading[issuer?.issuerDID]) {
                    requestTrust(issuer?.issuerDID);
                  }
                }}
              >
                {requestLoading[issuer?.issuerDID] ? "Requesting..." : "Request Trust"}
              </div>

            </div>
          ))}
        </div>
      )}
      </div>
    </div>
    </CustomDialog>

      <CustomDialog
        open={createWorkOpen}
        onOpenChange={setCreateWorkOpen}
        title="Create Work"
      >
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Task Title"
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            placeholder="Task Description"
            className="w-full border rounded px-3 py-2"
          />
          <div className="flex justify-end gap-3">
            <Button type="submit">Create</Button>
            <Button variant="secondary" onClick={() => setCreateWorkOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CustomDialog>

      <CustomDialog
        open={viewWorkOpen}
        onOpenChange={setViewWorkOpen}
        title="All Work Tasks"
      >
        <p className="text-gray-700">List of all work tasks will be displayed here.</p>
      </CustomDialog>

      <CustomDialog
        open={viewComplaintsOpen}
        onOpenChange={setViewComplaintsOpen}
        title="Complaints"
      >
        <p className="text-gray-700">List of complaints will be displayed here.</p>
      </CustomDialog>

    <CustomDialog
  open={requestReviewOpen}
  onOpenChange={setRequestReviewOpen}
  title="Request Review"
>
    {renderBusinessContent()}
    {/* <div className="flex justify-end gap-3 mt-4">
      <Button>Submit</Button>
      <Button variant="secondary" onClick={() => setRequestReviewOpen(false)}>
        Cancel
      </Button>
    </div> */}
  </CustomDialog>


    </div>
  );
};
