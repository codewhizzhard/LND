import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import sdk from "@/sdk";
import { toast } from "sonner";

export default function UserAuth() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOrg, setIsOrg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState<"login" | "register">("login");
  const [orgType, setOrgType] = useState<"issuer" | "business" | "">("");

  const navigate = useNavigate();

  // ✅ Reset fields when switching mode
  const resetFields = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setOrgName("");
    setSector("");
  };

  const switchMode = (mode: "login" | "register") => {
    setOption(mode);
    resetFields();
  };

  // ✅ Registration logic (R3: Auto-login after registration)
const handleRegister = async () => {
  setOption("register");

  // Check org type first
  if (isOrg && !orgType) {
    toast.error("Select organization type"); // show error
    return; // stop execution immediately
  }

  try {
    setLoading(true);
    toast.loading("Creating account...");

    let res;
    if (isOrg) {
      res = await sdk.signup("organization", password, email, undefined, orgName, orgType);
    } else {
      res = await sdk.signup("user", password, email, username, undefined);
    }

    console.log("Registration response:", res);
    toast.dismiss();

    if (res.success) {
      toast.success("✅ Registered successfully! Logging you in...");

      // Auto-login after registration
      let loginRes;
      if (isOrg) {
        loginRes = await sdk.login("organization", orgName, password, email);
      } else {
        loginRes = await sdk.login("user", username, password, email);
      }

      if (loginRes.success) {
        localStorage.setItem("token", loginRes.data.token);
        localStorage.setItem("creator", JSON.stringify(loginRes.data.creator));

        toast.success("✅ Logged in!");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        toast.error("⚠️ Registered but failed to auto-login. Please login manually.");
      }
    } else {
      toast.error("❌ Registration failed: " + (res.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Registration error:", err);
    toast.dismiss();
    toast.error("❌ Failed to register, check console.");
  } finally {
    setLoading(false);
  }
};


  // ✅ Login with Guardian Sync
  const handleLogin = async () => {
    setOption("login");

    const isEmailProvided = email.trim() !== "";
    let loadingToastId: any;

    try {
      if (isEmailProvided) {
        toast.info("ℹ️ We will sync your guardian details here.");
        loadingToastId = toast.loading("Syncing guardian details...");
      } else {
        loadingToastId = toast.loading("Logging in...");
      }

      setLoading(true);

      let res;
      if (isOrg) {
        res = await sdk.login("organization", orgName, password, email);
      } else {
        res = await sdk.login("user", username, password, email);
      }

      console.log("Login response:", res);
      toast.dismiss(loadingToastId);

      if (res.success) {
        if (isEmailProvided) toast.success("✅ Guardian details synced successfully!");

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("creator", JSON.stringify(res.data.creator));

        toast.success("✅ Logged in successfully!");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        toast.error("❌ Login failed: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.dismiss(loadingToastId);

      if (isEmailProvided) {
        toast.error(err?.response?.data?.error || "❌ Failed to sync guardian details.");
      } else {
        toast.error("❌ Login failed. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Validation
  const canRegister = isOrg
    ? orgName.trim().length > 2 && password.trim().length > 5 && email.includes("@")
    : username.trim().length > 2 && password.trim().length > 5 && email.includes("@");

  const canLogin = isOrg
    ? orgName.trim().length > 2 && password.trim().length > 5
    : username.trim().length > 2 && password.trim().length > 5;

  const title =
    option === "login"
      ? isOrg
        ? "Organization Login"
        : "User Login"
      : isOrg
      ? "Organization Registration"
      : "User Registration";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Username (users only) */}
          {!isOrg && (
            <Input
              placeholder="Display Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          {/* Email */}
          <Input
            type="email"
            placeholder="Email (Required for Register)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>

          {/* Organization fields */}
        {isOrg && (
  <>
    <Input
      placeholder="Organization Name"
      value={orgName}
      onChange={(e) => setOrgName(e.target.value)}
    />
    <Input
      placeholder="Sector (Optional)"
      value={sector}
      onChange={(e) => setSector(e.target.value)}
    />
    <select
      value={orgType}
      onChange={(e) => setOrgType(e.target.value)}
    >
      <option value="">Select type</option>
      <option value="issuer">Issuer</option>
      <option value="business">Business</option>
    </select>
  </>
)}


          {/* Toggle User/Org */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={isOrg} onChange={() => setIsOrg(!isOrg)} />
              <span className="text-sm">Register / Login as Organization</span>
            </label>
          </div>

          {/* Buttons */}
          <Button
            className="w-full"
            onClick={handleRegister}
            disabled={!canRegister || loading}
          >
            {loading && option === "register" ? "Registering..." : "Register"}
          </Button>

          <Button
            className="w-full"
            variant="secondary"
            onClick={handleLogin}
            disabled={!canLogin || loading}
          >
            {loading && option === "login" ? "Logging in..." : "Login"}
          </Button>

          {/* Mode Switch */}
          <div className="text-center text-sm mt-2">
            {option === "login" ? (
              <p>
                Don’t have an account?{" "}
                <button
                  onClick={() => switchMode("register")}
                  className="text-blue-600 underline"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="text-blue-600 underline"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
