import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, ChevronDown, ChevronUp, Image, Share2 } from "lucide-react";
import { PasswordPopup } from "@/components/custom/passwordPopup";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import sdk from "@/sdk";
import { useNavigate } from "react-router-dom";

export function TransactionForm() {
  const [creator] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("creator") || "null");
    } catch {
      return null;
    }
  });

  const [existingEvent, setExistingEvent] = useState<any>(() => {
    try {
      const draft = JSON.parse(localStorage.getItem("eventDraft") || "null");
      if (!draft) return null;
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (Date.now() - draft.savedAt > FIVE_MINUTES) {
        localStorage.removeItem("eventDraft");
        return null;
      }
      return draft;
    } catch {
      return null;
    }
  });

  const [sector, setSector] = useState<"goods" | "services" | "">("");
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [expiry, setExpiry] = useState<Date | undefined>(undefined);
  const [showPopup, setShowPopup] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("public")
  const publicKey = localStorage.getItem("userPublicKey");
  console.log("v:", visibility)

   const navigate = useNavigate();

  // 🔄 Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 🖼️ Handle image upload (convert to Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 🧠 Check if other fields (besides message) have data
  const hasOtherData = () => {
    const checkFields = { ...formData };
    delete checkFields.message; // exclude message
    return (
      Object.values(checkFields).some((val) => val && val.toString().trim() !== "") ||
      images.length > 0
    );
  };

  // 🧩 Handle submission validation
  const handleSubmitClick = () => {
    const otherDataFilled = hasOtherData();
    if (!otherDataFilled && (!formData.message || formData.message.trim() === "")) {
      toast.error("Message / Note is required when no other details are added.");
      return;
    }
    setShowPopup(true);
  };

  // ✅ Create Hedera record
  const handleCreateTopic = async () => {
    try {
      toast.info("⏳ Recording message to Hedera...");

      const metadata = {
        action,
        visibility,
        sector,
        ...formData,
        expiry: expiry ? expiry.toISOString() : undefined,
        accountId: creator?.accountId,
        createdAt: new Date().toISOString(),
        creatorDID: creator?.creatorDID,
        publicKey,
        assetTopicId: existingEvent?.topicId,
        images,
      };
      console.log("metadata:", metadata)
      
      const { success, data, error } = await sdk.handleTopicCreation(metadata);
      if (!success) throw new Error(error);

      console.log("✅ Topic created successfully:", data);
      toast.success("✔️ Message recorded on Hedera!");

      const shareText = `📜 Message: ${formData.message || "(No message provided)"}
          Action: ${action}
          Sector: ${sector}

          ✅ Verified on Hedera DLT (Consensus Reached)
          🔗 View more on: ${window.location.origin}/events/${data?.topicId || "latest"}`;

      setShareData({
        title: "Shared via Hedera Messaging Hub",
        text: shareText,
        url: `${window.location.origin}/events/${data?.topicId || ""}`,
      });

      localStorage.removeItem("eventDraft");
      setExistingEvent(null);

      setTimeout(() => {
        handleUserShare(shareText);
      }, 400);
    } catch (err: any) {
      console.error("❌ Failed to create topic:", err);
      toast.error(err.message || "Unknown error");
    } finally {
      setShowPopup(false);
    }
  };

  // ✅ Share logic
  const handleUserShare = async (messageText?: string) => {
    const toShare = shareData || {
      title: "Shared via Hedera Messaging Hub",
      text: messageText || formData.message,
      url: `${window.location.origin}/events`,
    };

    if (!toShare.text || !toShare.url) {
      toast.error("No valid message to share");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share(toShare);
        toast.success("🎉 Message shared successfully!");
      } catch (err: any) {
        if (err.name === "AbortError" || err.message.includes("cancelled")) {
          toast.info("Sharing cancelled");
        } else {
          console.error("Sharing failed:", err);
          toast.error("Sharing failed");
        }
      }
    } else {
      const encoded = encodeURIComponent(`${toShare.text}\n\n${toShare.url}`);
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    }
  };

  const otherDataFilled = hasOtherData();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
   <div className="p-4">
      {/* Back Button */}
      <button
          onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4 cursor-pointer"
      >
        ← Back
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🌍 Universal Messaging Hub</h1>
        <p className="text-muted-foreground">
          Choose your sector, define your action, and create secure topics.
        </p>
      </div>
    </div>

      {/* Action Selection */}
     {/*  <Card>
        <CardHeader>
          <CardTitle>Select Action</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">🛒 Buy</SelectItem>
              <SelectItem value="sell">💰 Sell</SelectItem>
              <SelectItem value="request">📩 Request</SelectItem>
              <SelectItem value="access">📄 Access</SelectItem>
              <SelectItem value="rumor">📮Rumor</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card> */}

      <Card className="p-4">
  <div className="flex justify-between items-center w-full gap-4">
    {/* Left side - Select Action */}
    <div className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700">
          Select Action:
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Select onValueChange={setAction}>
          <SelectTrigger className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400">
            <SelectValue placeholder="Choose an action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">🛒 Buy</SelectItem>
            <SelectItem value="sell">💰 Sell</SelectItem>
            <SelectItem value="request">📩 Request</SelectItem>
            <SelectItem value="access">📄 Access</SelectItem>
            <SelectItem value="rumor">📮 Rumor</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </div>

    {/* Right side - Select Visibility */}
    <div className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700">
          Visibility:
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Select onValueChange={setVisibility}>
          <SelectTrigger className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400">
            <SelectValue placeholder="Choose visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">🌍 Public</SelectItem>
            <SelectItem value="private">🔒 Private</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </div>
  </div>
</Card>


      {/* Transaction Details */}
      <Card>
        <CardHeader
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowDetails((prev) => !prev)}
        >
          <CardTitle>Product / Service Details</CardTitle>
          {showDetails ? <ChevronUp /> : <ChevronDown />}
        </CardHeader>

        {showDetails && (
          <CardContent>
            <Tabs value={sector} onValueChange={(v) => setSector(v as "goods" | "services")}>
              <TabsList className="mb-6">
                <TabsTrigger value="goods">Goods</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  placeholder="Receiver Identifier (Name or Account ID)"
                  onChange={(e) => handleChange("receiverIdentifier", e.target.value)}
                />
                <Input
                  placeholder={sector === "goods" ? "Product Category/Name" : "Service Name"}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <TabsContent value="goods" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="number" placeholder="Quantity" onChange={(e) => handleChange("quantity", e.target.value)} />
                  <Input type="number" placeholder="Price" onChange={(e) => handleChange("price", e.target.value)} />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <div className="w-full">
                      <Button variant="outline" className="w-full justify-between">
                        {expiry ? expiry.toDateString() : "Set Expiry Date (if perishable)"}
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-2">
                    <Calendar
                      mode="single"
                      selected={expiry}
                        onSelect={(date) => {
                        setExpiry(date);
                        handleChange("expiry", date?.toISOString());
                        document.body.click();
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <Input placeholder="Location (optional)" onChange={(e) => handleChange("location", e.target.value)} />
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Duration (e.g. 1hr, 3 days)" onChange={(e) => handleChange("duration", e.target.value)} />
                  <Input type="number" placeholder="Price" onChange={(e) => handleChange("price", e.target.value)} />
                </div>
                <Input placeholder="Location (e.g. Virtual, On-site)" onChange={(e) => handleChange("location", e.target.value)} />
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowImages((prev) => !prev)}
        >
          <CardTitle>Attach Images</CardTitle>
          {showImages ? <ChevronUp /> : <ChevronDown />}
        </CardHeader>

        {showImages && (
          <CardContent className="space-y-3">
            <Button variant="outline" asChild>
              <label className="flex items-center gap-2 cursor-pointer">
                <Image className="w-4 h-4" /> Upload Images
                <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
              </label>
            </Button>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <img key={i} src={img} alt={`upload-${i}`} className="rounded-md border object-cover w-full h-24" />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Message / Note */}
      <Card>
        <CardHeader>
          <CardTitle>Message / Note</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full border rounded-md p-3 text-sm"
            placeholder="E.g. I want to do a medical test for malaria and typhoid..."
            rows={3}
            onChange={(e) => handleChange("message", e.target.value)}
          />
          {!otherDataFilled && !formData.message && (
            <p className="text-xs text-red-500 mt-1">Message / Note is required if no other details are added.</p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent>
          <Button
            className={`w-full flex items-center gap-2 cursor-pointer ${
              !otherDataFilled && (!formData.message || formData.message.trim() === "")
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={handleSubmitClick}
            disabled={!otherDataFilled && (!formData.message || formData.message.trim() === "")}
          >
            <CheckCircle className="w-4 h-4" /> Submit Transaction
          </Button>

          {shareData && (
            <Button
              className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleUserShare()}
            >
              <Share2 className="w-4 h-4" /> Share Message
            </Button>
          )}
        </CardContent>
      </Card>

      <PasswordPopup
        isOpen={showPopup}
        transaction={null}
        onClose={() => setShowPopup(false)}
        onSigned={handleCreateTopic}
      />
    </div>
  );
}
