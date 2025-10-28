// src/pages/HederaDashboard.tsx
import React, { useEffect, useState } from "react";
import sdk from "@/sdk";
import { Link, useNavigate } from "react-router-dom";
import lnd from "../../assets/lnd.png";
import { getHederaBalance } from "@/utils/utils";
import { Dialog, DialogTitle, DialogPanel } from "@headlessui/react";
import { ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
/* check 699 */
export default function HederaDashboard() {
  const [creator, setCreator] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("creator") || "null");
    } catch {
      return null;
    }
   
  });
  console.log("cc:", creator)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "home" | "contacts" | "messages" | "profile" | "create"
  >("home");

  // Data for contacts/messages are mock hooks — replace with real sdk calls
  const [contacts, setContacts] = useState([]);
  const [threads, setThreads] = useState([]);
  const navigate = useNavigate();

  // --- Events state ---
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // --- Assets state ---
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
    // --- Account balance state ---
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isDIDModalOpen, setIsDIDModalOpen] = useState(false);
   const [isFullDIDVisible, setIsFullDIDVisible] = useState(false);
/* 
   const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [type, setType] = useState<"business" | "issuer" | "">("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Other dashboard states like events, assets, balance, etc. can go here...
  // const [events, setEvents] = useState([]);
  // ...

  // -------------------
  // HANDLERS
  // -------------------
  const handleOpenModal = () => {
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
    if (!name || !sector || !type) {
      setModalError("All fields are required.");
      return;
    }

    setSaving(true);
    setModalError("");
    try {
      // TODO: send data to backend
      // const res = await api.updateCreatorType({ name, sector, type });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate backend

      const updatedCreator = {
        ...creator,
        type,
        info: { ...creator.info, displayName: name, sector },
      };
      setCreator(updatedCreator);
      localStorage.setItem("creator", JSON.stringify(updatedCreator));
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setModalError("Failed to save data. Try again.");
    } finally {
      setSaving(false);
    }
  }; */

 
  const fullDID = creator?.creatorDID;
  const shortDID = fullDID
    ? `${fullDID.slice(0, 18)}...${fullDID.slice(-11)}`
    : "—";


  // Fetch events for logged-in creator
  useEffect(() => {
    async function loadEvents() {
      if (!creator?.accountId) {
        setEvents([]);
        return;
      }

      setLoadingEvents(true);
      setEventsError(null);

      try {
        // NOTE: sdk.getUserEvents should be implemented in your SDK
        const res = await sdk.getUserEvents?.();
        if (!res) throw new Error("sdk.getUserEvents is not available");
        if (!res.success) {
          throw new Error(res.error || "Failed to fetch events");
        }

        // server response shape: { success: true, count, events }
        const ev = res.data?.events ?? res.data ?? [];
        setEvents(Array.isArray(ev) ? ev : []);
      } catch (err: any) {
        console.error("❌ Failed to load events:", err);
        setEventsError(err?.message ?? "Unknown error loading events");
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, [creator]);

    // Fetch Hedera account balance
  useEffect(() => {
    async function loadBalance() {
      if (!creator?.accountId) {
        setBalance(null);
        return;
      }

      setLoadingBalance(true);
      setBalanceError(null);

      try {
        const hbarBalance = await getHederaBalance(creator.accountId);
        setBalance(hbarBalance.toFixed(4));
      } catch (err: any) {
        console.error("❌ Failed to fetch balance:", err);
        setBalanceError(err?.message ?? "Unable to fetch balance");
        setBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    }

    loadBalance();
  }, [creator]);


  // Fetch assets for logged-in creator
  useEffect(() => {
    async function loadAssets() {
      if (!creator?.accountId) {
        setAssets([]);
        return;
      }

      setLoadingAssets(true);
      setAssetsError(null);

      try {
        // NOTE: sdk.getUserAssets should be implemented in your SDK
        const res = await sdk.getUserAssets?.();
        if (!res) throw new Error("sdk.getUserAssets is not available");
        if (!res.success) {
          throw new Error(res.error || "Failed to fetch assets");
        }

        // server response shape: { success: true, assets }
        const arr = res.data?.assets ?? res.data ?? [];
        console.log("asset:", arr)
        setAssets(Array.isArray(arr) ? arr : []);
      } catch (err: any) {
        console.error("❌ Failed to load assets:", err);
        setAssetsError(err?.message ?? "Unknown error loading assets");
        setAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    }

    loadAssets();
  }, [creator]);

  // Refresh helper
  const refreshEvents = async () => {
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const res = await sdk.getUserEvents?.();
      if (!res) throw new Error("sdk.getUserEvents is not available");
      if (!res.success) throw new Error(res.error || "Failed to fetch events");
      const ev = res.data?.events ?? res.data ?? [];
      setEvents(Array.isArray(ev) ? ev : []);
    } catch (err: any) {
      console.error("❌ Refresh events failed:", err);
      setEventsError(err.message || "Failed to refresh events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const refreshBalance = async () => {
  if (!creator?.accountId) return;
  setLoadingBalance(true);
  setBalanceError(null);
  try {
    const hbarBalance = await getHederaBalance(creator.accountId);
    setBalance(hbarBalance.toFixed(4)); // convert number → string
  } catch (err: any) {
    console.error("❌ Failed to refresh balance:", err);
    setBalanceError(err?.message ?? "Unable to refresh balance");
  } finally {
    setLoadingBalance(false);
  }
};




  const refreshAssets = async () => {
    setLoadingAssets(true);
    setAssetsError(null);
    try {
      const res = await sdk.getUserAssets?.();
      if (!res) throw new Error("sdk.getUserAssets is not available");
      if (!res.success) throw new Error(res.error || "Failed to fetch assets");
      const arr = res.data?.assets ?? res.data ?? [];
      setAssets(Array.isArray(arr) ? arr : []);
    } catch (err: any) {
      console.error("❌ Refresh assets failed:", err);
      setAssetsError(err.message || "Failed to refresh assets");
    } finally {
      setLoadingAssets(false);
    }
  };

  // --- Actions ---
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("creator");
    setCreator(null);
    navigate("/signin");
  }

  // --- Small components ---
 // --- HEADER COMPONENT --- //
const Header = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
/*   const [name, setName] = React.useState(""); */
  const [sector, setSector] = React.useState("");
  const [type, setType] = React.useState<"business" | "issuer" | "">("");
  const [saving, setSaving] = React.useState(false);
  const [modalError, setModalError] = React.useState("");

  const handleOpenModal = () => {
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return; // prevent closing while saving
    setIsModalOpen(false);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!sector || !type) {
    setModalError("All fields are required.");
    return;
  }

  setSaving(true);
  setModalError("");

  try {
    console.log("gggg:", sector, type)
    const res = await sdk.addOrgType(sector, type);
    console.log("res:", res);

    if (res.success) {
      const updatedCreator = res.data?.creator;
      console.log("updated creator:", updatedCreator);

      if (updatedCreator) {
        // ✅ Update both state and local storage
        localStorage.setItem("creator", JSON.stringify(updatedCreator));
        setCreator(updatedCreator);
      }

      toast.success("✅ Profile updated & synced successfully!");
      setIsModalOpen(false);
    } else {
      toast.error("❌ " + (res.error || "Failed to save data."));
      setModalError(res.error || "Failed to save data.");
    }
  } catch (err) {
    console.error("Save error:", err);
    toast.error("❌ Something went wrong. Please try again.");
    setModalError("Failed to save data. Try again.");
  } finally {
    setSaving(false);
  }
};



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("creator");
    setCreator(null);
    navigate("/signin");
  };

  return (
  <>
    <header className="w-full flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur sticky top-0 shadow-sm z-20">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src={lnd}
          alt="LND"
          className="h-18 w-18 object-cover rounded-full cursor-pointer"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Name + Admin Button + DID */}
        <div className="flex flex-col mr-2">
          {/* Name + Admin on same row */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">
              {creator?.info?.displayName?.toUpperCase() ||
                creator?.info?.org?.name.toUpperCase() ||
                "No Name"}
            </div>

            {creator?.role === "organization" && !creator.creatorDID ? (
              <div className="text-sm text-red-600">!DID Needed</div>
            ):  (
              <>
                {creator.info.org?.type ? (
                  <button
                    className="text-xs font-medium px-3 py-1 border rounded-md hover:bg-slate-100 transition"
                    onClick={() => navigate(`/${creator.info.org.type}`)}
                  >
                   {creator.info.org.type.toUpperCase() } 
                  </button>
                ) : (
                  <button
                    className="text-xs font-medium px-3 py-1 border rounded-md hover:bg-slate-100 transition"
                    onClick={handleOpenModal}
                  >
                    Admin Page
                  </button>
                )}
              </>
            )}
          </div>

          {/* DID */}
          <div
            className="text-[10px] text-slate-500 truncate max-w-[180px]"
            title={creator?.creatorDID ?? "No DID"}
          >
            {creator?.creatorDID ?? "No DID"}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition"
        >
          Logout
        </button>
      </div>
    </header>

    {/* Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="relative bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold mb-4 text-center">Set Admin Info</h2>

         <div className="space-y-3">
           {/* 
            <input
              type="text"
              placeholder="Name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            /> */}

            <input
              type="text"
              placeholder="Sector"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              disabled={saving}
            />

            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={type}
              onChange={(e) =>
                setType(e.target.value as "business" | "issuer")
              }
              disabled={saving}
            >
              <option value="">Select Type</option>
              <option value="business">BUSINESS</option>
              <option value="issuer">ISSUER</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              disabled={saving || !sector || !type}
            >
              {saving ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}



const SummaryCard = () => (
  <div>
    <h2 className="text-xl font-bold mb-2">
      Welcome back{creator?.info?.displayName ? `, ${creator.info.displayName}` : ""}!
    </h2>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Account Info */}
      <div className="p-4 rounded-xl bg-white shadow-sm">
        <div className="text-xs text-slate-500">Account ID</div>
        <div className="mt-2 font-semibold">{creator?.accountId ?? "No account"}</div>

        {/* ✅ Hedera Balance Section */}
        {creator?.accountId && (
          <div className="mt-3 text-sm text-slate-700">
            {loadingBalance ? (
              <p className="text-gray-500">Fetching balance...</p>
            ) : balanceError ? (
              <p className="text-red-500">Error: {balanceError}</p>
            ) : (
              <p>
                Balance:{" "}
                <span className="font-semibold text-indigo-600">
                  {balance ?? "0"} ℏ
                </span>
              </p>
            )}

            <button
              onClick={refreshBalance}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700"
            >
              Refresh Balance
            </button>
          </div>
        )}

        {!creator?.accountId && (
          <div className="mt-3">
            <button
              onClick={() => setActiveTab("create")}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md"
            >
              Create Hedera Account
            </button>
          </div>
        )}
      </div>

      {/* DID */}

      <div className="p-4 rounded-xl bg-white shadow-sm">
      <div className="text-xs text-slate-500">DID</div>

      {/* ✅ Show short DID if available */}
      {creator?.creatorDID ? (
        <>
          <div
            className="mt-2 font-semibold break-words text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => setIsFullDIDVisible(true)}
            title="Click to view full DID"
          >
            {shortDID}
          </div>

          {/* 🔍 Dialog for Full DID */}
          <Dialog
            open={isFullDIDVisible}
            onClose={() => setIsFullDIDVisible(false)}
            className="relative z-50"
          >
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="mx-auto max-w-lg rounded-xl bg-white p-5 shadow-lg">
                <DialogTitle className="text-base font-semibold text-slate-800 mb-2">
                  Full Guardian DID
                </DialogTitle>

                <p className="break-words text-sm text-slate-700">{fullDID}</p>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(fullDID).then(() =>
                        toast.message("✅ DID copied to clipboard!")
                      )
                    }
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setIsFullDIDVisible(false)}
                    className="px-3 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        </>
      ) : (
        // 🧩 If no DID yet — show Generate button
        <div className="mt-3">
          <button
            onClick={() => setIsDIDModalOpen(true)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
          >
            Generate DID
          </button>
        </div>
      )}

      {/* 🧭 DID Setup Instructions Dialog */}
      <Dialog
        open={isDIDModalOpen}
        onClose={() => setIsDIDModalOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <DialogTitle className="text-lg font-semibold">
                Create Your Guardian DID
              </DialogTitle>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              A <strong>Decentralized Identifier (DID)</strong> is your secure
              digital identity on the <strong>Hedera blockchain</strong>. It
              helps verify that your organization or account is authentic on the
              Guardian platform.
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>To create your DID:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Open the <strong>Guardian Portal</strong> using the link we
                  emailed you. make sure it is the email we sent the link to you that you register with.
                </li>
                <li className="text-red-500">
                  Sign up with the <strong>exact same username</strong> and{" "}
                  <strong>password</strong> you used here (case-sensitive).
                </li>
                <li>
                  Create your Hedera wallet (if not done already). Copy your{" "}
                  <strong>Account ID</strong> and{" "}
                  <strong>Private Key</strong>.
                </li>
                <li>
                  Use these to complete your Guardian account setup and DID
                  creation.
                </li>
                <li>
                  Return here to the signin page and login with your password, name and email(make sure you add your email to sync your data) to sync your guardian data and get your did.
                  {/* Return here and click <strong>“Generate DID”</strong> again —
                  your new DID will appear. */}
                </li>
              </ol>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <a
                href="https://guardianservice.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
              >
                Open Guardian Portal
              </a>
              <button
                onClick={() => setIsDIDModalOpen(false)}
                className="w-full py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>

      {/* Creator Topic */}
      <div className="p-4 rounded-xl bg-white shadow-sm">
        <div className="text-xs text-slate-500">Creator Topic</div>
        <div className="mt-2 font-semibold break-words">
          {creator?.creatorTopicId ?? "—"}
        </div>
      </div>
    </section>
  </div>
);

  const ContactsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Contacts</h3>
        <button
          onClick={() => {
            const name = prompt("Contact name");
            if (!name) return;
            setContacts((c) => [...c, { id: Date.now().toString(), name }]);
          }}
          className="px-3 py-1 rounded-md border border-slate-200"
        >
          Add
        </button>
      </div>
      {/* look into this well */}
      <div className="grid gap-3">
        {contacts.length === 0 && <div className="text-sm text-slate-500">No contacts yet</div>}
        {contacts.map((c) => (
          <div key={c.id} className="p-3 rounded-md bg-white shadow-sm flex justify-between items-center">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-slate-500">{c.address ?? "—"}</div>
            </div>
            <div className="text-sm text-slate-500">Actions</div>
          </div>
        ))}
      </div>
    </div>
  );

  const MessagesView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Messages</h3>
        <Link to={"/events"} className="px-3 py-1 rounded-md border border-slate-200">Compose</Link>
      </div>

      <div className="grid gap-3">
        <Link to={"/events-update"} className="text-sm text-slate-500">View All</Link>
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="space-y-4">
      <h3 className="font-semibold">Profile</h3>
      <div className="p-4 rounded-md bg-white shadow-sm">
        <div className="text-sm">Display name</div>
        <div className="font-medium">{creator?.info?.displayName ?? "—"}</div>
      </div>
      <div className="p-4 rounded-md bg-white shadow-sm">
        <div className="text-sm">Saved DID</div>
        <div className="font-medium break-words">{creator?.creatorDID ?? "—"}</div>
      </div>
    </div>
  );

  const CreateView = () => (
    <div className="space-y-4">
      <h3 className="font-semibold">Create Hedera Account</h3>
      <p className="text-sm text-red-500">! Your account is self custodian meaning you are responsible for your account; we won't store your private key.</p>
      <div className="flex gap-3">
        <Link to={"/self-custodian"} className="px-4 py-2 rounded-md bg-indigo-600 text-white">
          {creator?.accountId ? "Create New Wallet" : "Create Wallet"}
        </Link>
        <button onClick={() => setActiveTab("home")} className="px-4 py-2 rounded-md border cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );

  // Helper to format event message
  function eventMessage(ev: any) {
    // check common shapes
    const payload = ev?.payload ?? ev?.data ?? ev?.message ?? {};
    if (!payload) return "Event";
    if (typeof payload === "string") return payload;
    if (payload.message) return payload.message;
    if (payload.details) return payload.details;
    if (payload.name) return payload.name;
    // fallback: stringify small
    try {
      const s = JSON.stringify(payload);
      return s.length > 120 ? s.slice(0, 120) + "…" : s;
    } catch {
      return "Event";
    }
  }

  // Helper to format asset display
  function assetLabel(asset: any) {
    if (!asset) return "Asset";
    // prefer metadata fields if available
    const meta = asset.metadata ?? {};
    return (
      meta.displayName ??
      meta.name ??
      meta.title ??
      asset.topicId ??
      asset.assetId ??
      asset._id ??
      "Asset"
    );
  }

  // Recent activity UI (uses fetched events)
  const RecentActivity = () => (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Recent activity</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshEvents}
            className="text-xs px-2 py-1 rounded border"
            disabled={loadingEvents}
          >
            {loadingEvents ? "Refreshing..." : "Refresh"}
          </button>
          <Link to={"/events-update"} className="text-xs text-slate-500">View all</Link>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-500">
        {loadingEvents && <div>Loading events...</div>}
        {eventsError && <div className="text-red-500">{eventsError}</div>}

        {!loadingEvents && !eventsError && events.length === 0 && (
          <div>No recent events — your events will appear here.</div>
        )}

        {!loadingEvents && events.length > 0 && (
          <ul className="space-y-2">
            {events.slice(0, 3).map((ev: any) => (
              <li key={ev._id ?? ev.eventId ?? Math.random()} className="p-2 rounded-md bg-slate-50 border text-slate-700">
                <div className="text-sm font-medium truncate">{eventMessage(ev)}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {ev.accountId ? `${ev.accountId} • ` : ""}
                  <p className="break-all whitespace-normal">{ev.creatorDID ? `${ev.creatorDID} • ` : ""}</p>
                  {new Date(ev.createdAt ?? ev.latestCreatedAt ?? Date.now()).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Assets sidebar (replaces Topics block)
  const AssetsSidebar = () => (
    <div className="mt-4 p-4 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Assets</h4>
        <div className="flex items-center gap-2">
          <button onClick={refreshAssets} className="text-xs px-2 py-1 rounded border" disabled={loadingAssets}>
            {loadingAssets ? "Refreshing..." : "Refresh"}
          </button>
          <Link to={"/assets"} className="text-xs text-slate-500">View all</Link>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-500">
        {loadingAssets && <div>Loading assets...</div>}
        {assetsError && <div className="text-red-500">{assetsError}</div>}
        {!loadingAssets && !assetsError && assets.length === 0 && <div>No assets found.</div>}
        {!loadingAssets && assets.length > 0 && (
          <ul className="space-y-2">
            {assets.slice(0, 3).map((asset: any) => (
              <li key={asset._id ?? asset.accountId ?? Math.random()} className="p-2 rounded-md bg-slate-50 border text-slate-700">
                <div className="text-sm font-medium truncate">{assetLabel(asset)}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {asset.topicId ? `Topic: ${asset.topicId} • ` : ""}
                  {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // --- Layout ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="max-w-6xl mx-auto p-4">
        <div className="md:flex md:gap-6">
          <div className="md:w-3/4 space-y-6">
            <div className="md:hidden">
              {/* Mobile summary condensed */}
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-500">Account ID</div>
                    <div className="font-semibold">{creator?.accountId ?? "No account"}</div>
                  </div>
                  <div>{creator.accountId ? 
                    <div className="mt-3 text-sm text-slate-700">
            {loadingBalance ? (
              <p className="text-gray-500">Fetching balance...</p>
            ) : balanceError ? (
              <p className="text-red-500">Error: {balanceError}</p>
            ) : (
              <p>
                Balance:{" "}
                <span className="font-semibold text-indigo-600">
                  {balance ?? "0"} ℏ
                </span>
              </p>
            )}

            <button
              onClick={refreshBalance}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700"
            >
              Refresh Balance
            </button>
          </div>   
              : 
              <button onClick={() => setActiveTab("create")} className="px-2 py-1 rounded-md border text-sm">
                Setup
              </button> }
            </div>
          </div>
        </div>
      </div>

            <div className="hidden md:block">
              <SummaryCard />
            </div>

            <div className="bg-transparent p-0">
              {error && <div className="text-red-600 mb-2">{error}</div>}

              {activeTab === "home" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Overview of your wallet & activity.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Quick actions — desktop only */}
                    <div className="p-4 rounded-lg bg-white shadow-sm hidden md:block">
                      <h4 className="font-semibold">Quick actions</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setActiveTab("create")} className="px-3 py-2 rounded-md border cursor-pointer">Create account</button>
                        <Link to={"/contacts"} onClick={() => setActiveTab("contacts")} className="px-3 py-2 rounded-md border cursor-pointer">Contacts</Link>
                        <Link  to={"/events"} /* onClick={() => setActiveTab("messages")}  */className="px-3 py-2 rounded-md border cursor-pointer">Messages</Link>
                      </div>
                    </div>

                    {/* Recent activity — always visible */}
                    <RecentActivity />
                  </div>
                </div>
              )}

              {activeTab === "create" && <CreateView />}
              {activeTab === "contacts" && <ContactsView />}
              {activeTab === "messages" && <MessagesView />}
              {activeTab === "profile" && <ProfileView />}
            </div>
          </div>

          <aside className="hidden md:block md:w-1/4 mt-9 space-y-8">
            <div className="p-4 rounded-lg bg-white shadow-sm">
              <div className="text-xs text-slate-500">Profile</div>
              <div className="mt-2 font-semibold">{creator?.info?.displayName ? creator?.info?.displayName.toUpperCase() : creator?.info?.org?.name?.toUpperCase() ?? "—"}</div>
              <div className="text-xs text-slate-500 mt-2">{creator?.info?.email ?? ""}</div>

              <div className="mt-4">
                <div className="text-xs text-slate-500">Roles</div>
                <div className="break-words font-semibold">{creator?.role?.toUpperCase() ?? "—"}</div>
              </div>
            </div>

            {/* Replaced Topics block with Assets sidebar */}
            <AssetsSidebar />
          </aside>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-1/2 transform -translate-x-1/2 w-[min(96%,720px)] bg-white/90 backdrop-blur rounded-xl shadow-lg p-2 flex justify-between md:hidden">
        <button onClick={() => setActiveTab("home")} className={`flex-1 py-2 ${activeTab === "home" ? "font-semibold" : "text-slate-500"}`}>Home</button>
        <button onClick={() => setActiveTab("contacts")} className={`flex-1 py-2 ${activeTab === "contacts" ? "font-semibold" : "text-slate-500"}`}>Contacts</button>
        <button onClick={() => setActiveTab("messages")} className={`flex-1 py-2 ${activeTab === "messages" ? "font-semibold" : "text-slate-500"}`}>Messages</button>
        <button onClick={() => setActiveTab("profile")} className={`flex-1 py-2 ${activeTab === "profile" ? "font-semibold" : "text-slate-500"}`}>Profile</button>
      </nav>
    </div>
  );
}
