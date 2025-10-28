import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordPopup } from "@/components/custom/passwordPopup";
import { Transaction } from "@hashgraph/sdk";
import sdk from "@/sdk";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function EventActionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<"events" | "messages">("events");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const accountId = localStorage.getItem("creator")
    ? JSON.parse(localStorage.getItem("creator") || "{}").accountId
    : null;

  // ✅ Fetch data when tab changes
  useEffect(() => {
    if (!accountId || !activeTab) return;

    (async () => {
      setLoading(true);
      try {
        if (activeTab === "events") {
          const res = await sdk.getUserEvents();
          if (res.success) {
            setItems(res.data.events || []);
            toast.success("✅ Events loaded successfully!");
          } else {
            toast.error(res.error || "Failed to load events");
            setItems([]);
          }
        } else {
          const res = await sdk.getAllMessages();
          if (res.success) {
            setItems(res.data.messages || []);
            toast.success("📩 Messages loaded successfully!");
          } else {
            toast.error(res.error || "Failed to load messages");
            setItems([]);
          }
        }
      } catch (err: any) {
        console.error(`❌ Failed to load ${activeTab}:`, err);
        toast.error("Network error while loading data");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [accountId, activeTab]);

  const handleSigned = async (signedTx: Transaction) => {
    console.log("Signed transaction:", signedTx);
    toast.success("Transaction signed successfully ✅");
  };

  // ✅ Handle click for event/message actions
  const handleActionClick = (item: any) => {
    if (activeTab === "messages") {
      toast.message(
        `Message from ${item.senderAccountId}`,
        {
          description: item.body || "No message body",
        }
      );
      return;
    }

    const payload = {
      topicId: item.topicId,
      message: item.payload.message,
      creatorDid: item.creatorDID,
      savedAt: Date.now(),
    };

    localStorage.setItem("eventDraft", JSON.stringify(payload));
    toast.success("Event draft saved, redirecting...");
    navigate("/events");
  };

  return (
    <div className="flex flex-col h-screen">
  {/* 🔝 Fixed header and tabs */}
  <div className="bg-white z-20 shadow-sm p-6 sticky top-0">
     <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-3 cursor-pointer"
      >
        ← Back
      </button>
    <h1 className="text-2xl font-bold mb-4">My Events & Messages</h1>

    {/* ✅ Tabs */}
    <div className="flex gap-4">
      <Button
        className={`px-6 py-2 rounded-full font-semibold transition ${
          activeTab === "events"
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("events")}
      >
        Events
      </Button>
      <Button
        className={`px-6 py-2 rounded-full font-semibold transition ${
          activeTab === "messages"
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("messages")}
      >
        Messages
      </Button>
    </div>
  </div>

  {/* 🧾 Scrollable content */}
  <div className="flex-1 overflow-y-auto p-6">
    {loading && <p className="text-center text-gray-500">Loading {activeTab}...</p>}

    {!loading && activeTab && (
      <div className="grid gap-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 mt-6">
            {activeTab === "events" ? "No events yet 📭" : "No messages yet 📩"}
          </p>
        ) : (
          items.map((item) => (
            <Card key={item._id}>
              <CardHeader>
                <CardTitle>
                  {activeTab === "messages" ? (
                    "📩 Message"
                  ) : (
                    <>
                      {item.eventType === "CREATED" && "🆕 Event Created"}
                      {item.eventType === "UPDATED" && "♻️ Event Updated"}
                      {item.eventType === "TRANSFER" && "🔄 Transfer Event"}
                      {item.eventType === "CUSTOM" && "✨ Custom Event"}
                      {!item.eventType && "📌 Event – UNKNOWN"}
                    </>
                  )}
                </CardTitle>
              </CardHeader>

              {/* ✅ The truncated content you already added */}
              <CardContent className="space-y-2">
                <p
                  className="text-sm text-gray-600 truncate max-w-full sm:max-w-[600px]"
                  title={activeTab === "messages" ? item.body : item.description}
                >
                  {activeTab === "messages" ? item.body : item.description}
                </p>

                <p
                  className="text-xs text-gray-500 truncate max-w-full sm:max-w-[500px]"
                  title={
                    activeTab === "messages"
                      ? item.senderAccountId
                      : item.creatorDID
                  }
                >
                  Created by:{" "}
                  {activeTab === "messages"
                    ? item.senderAccountId
                    : item.creatorDID}
                </p>

                <p
                  className="text-xs text-gray-500 truncate max-w-full sm:max-w-[400px]"
                  title={item.topicId}
                >
                  Topic ID: {item.topicId}
                </p>

                <p
                  className="text-sm text-gray-900 truncate max-w-full sm:max-w-[600px]"
                  title={item.payload?.message}
                >
                  Message: {item.payload?.message ?? "No message"}
                </p>

                {activeTab === "messages" && (
                  <p
                    className="text-xs text-blue-600 truncate max-w-full sm:max-w-[500px]"
                    title={item.recipientAccountId}
                  >
                    To: {item.recipientAccountId}
                  </p>
                )}

                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => handleActionClick(item)}
                >
                  {activeTab === "messages" ? "Reply" : "Update"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )}
  </div>
</div>

  );
}
