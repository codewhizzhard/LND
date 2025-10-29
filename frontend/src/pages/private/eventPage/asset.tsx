import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { QRCodeCanvas }  from "qrcode.react";
import sdk from "../../../sdk"; // Adjust your SDK path
import { ArrowLeft, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [showQr, setShowQr] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const accountId = localStorage.getItem("creator")
    ? JSON.parse(localStorage.getItem("creator") || "{}").accountId
    : null;

      const navigate = useNavigate();
  // ✅ Fetch assets
  useEffect(() => {
    if (!accountId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await sdk.getUserAssets();
        console.log("reee:", res)
        if (res.success) {
          setAssets(res.data.assets || []);
       
          toast.success("✅ Assets loaded successfully!");
          // Scroll to bottom after assets load
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
          }, 500);
        } else {
          toast.error(res.error || "Failed to load assets");
        }
      } catch (err) {
        console.error("❌ Error loading assets:", err);
        toast.error("Network error while loading assets");
      } finally {
        setLoading(false);
      }
    })();
  }, [accountId]);

  const handleViewQr = (asset: any) => {
    setSelectedAsset(asset);
    setShowQr(true);
  };

  const handleDownloadQr = () => {
    const canvas = document.querySelector("#asset-qr") as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${selectedAsset?.name || "asset"}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm p-6 flex justify-between items-center">
      {/* Left side with Back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 My Assets</h1>
          <p className="text-sm text-gray-500">
            View and manage all your created assets
          </p>
        </div>
      </div>
    </div>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading assets...</p>
        ) : assets.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No assets found 📭</p>
        ) : (
          assets?.map((asset) => (
            <Card
              key={asset._id}
              className="hover:shadow-lg transition border border-gray-200"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>TopicId: {asset.topicId || "Unnamed Asset"}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
               {/*  <p className="text-gray-600 text-sm truncate">
                  <strong>Description:</strong> {asset.description || "No description"}
                </p> */}
                <p className="text-gray-600 text-sm truncate">
                  <strong>Creator:</strong> {asset.creatorDID || asset.accountId}
                </p>
               {/*  <p className="text-gray-600 text-sm truncate">
                    <strong>Date:</strong>{" "}
                    {new Date(asset.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p> */}

                <div className="flex justify-between">
                  <Link to={`/qr/${asset.topicId}`} className="bg-blue-200 hover:bg-gray-700 text-white cursor-pointer px-2 pt-1 rounded-sm">
                    View Events
                  </Link>
                  <Button
                    variant="default"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    onClick={() => handleViewQr(asset)}
                  >
                    View QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedAsset?.name || "Asset QR Code"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <QRCodeCanvas
            id="asset-qr"
            value={url}  // ✅ use URL string instead of JSON
            size={220}
            level="H"
            includeMargin
          />
            <Button
              onClick={handleDownloadQr}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
