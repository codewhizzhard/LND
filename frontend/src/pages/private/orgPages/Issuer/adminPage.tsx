import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import sdk from "../../../../sdk"; // adjust path
import { Unauthorized } from "../unauthorized"; // your unauthorized component
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button"; 
import { Input } from "../../../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Search, Building2, Activity, ShieldCheck, Users, Coins } from "lucide-react";

import IssuerSecurityDialog from "./walletdetail";
import IssuerBondDialog from "./bond";

type BusinessStats = {
  total: number;
  active: number;
  revoked: number;
  pending: number;
};

export default function IssuerDashboard() {
  const [issuer, setIssuer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
const [businesses, setBusinesses] = useState<any[]>([]);
const [businessStats, setBusinessStats] = useState<BusinessStats>({
  total: 0,
  active: 0,
  revoked: 0,
  pending: 0,
});
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();


  /* Socket stalled when trying to connect to wss://relay.walletconnect.org */

  // ✅ Fetch issuer before rendering
  useEffect(() => {
    const fetchIssuer = async () => {
      try {
        const res = await sdk.orgGetIssuer();
        console.log("ggg:", res)
        if (res.success && res.data.issuer) {
          setIssuer(res.data.issuer);
         
        } else {
          setError(true)
          setIssuer(null);
        }
      } catch (err) {
        console.error("Error fetching issuer:", err);
        setIssuer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchIssuer();
  }, []);

  useEffect(() => {
  const fetchBusinesses = async () => {
    if (!issuer) return; // Make sure issuer is loaded first

    setLoadingBusinesses(true);
    try {
      const res = await sdk.orgGetBusinessesByIssuer();
      console.log("ffff:", res.data)
      if (res.success) {
        setBusinesses(res.data.business?.businesses);
        setBusinessStats(res.data.business?.stats)
      } else {
        toast.error("Failed to fetch businesses or none found.");
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setBusinesses([]);
      toast.error("Error fetching businesses.");
    } finally {
      setLoadingBusinesses(false);
    }
  };

  fetchBusinesses();
}, [issuer]);


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-medium">
        Checking Issuer Authorization...
      </div>
    );
  }

  if (!issuer && error) {
    return <Unauthorized />;
  }



  /*  */
  const isPending = issuer.status === "PENDING";
  const isRevoked = issuer.status === "REVOKED";
  const isActive = issuer.status === "ACTIVE";


  /*  */
   const renderIssuerContent = () => {
  return (
    <>
      {isPending && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Kickstart Your Issuer Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 space-y-2">
              To begin your journey as a verified issuer, create your ECDSA account in the managed wallet and stake your Trust Bond to the smart contract. 
              This allows you to issue credentials to businesses and monitor their on-chain behavior for transparency, fairness, and collective benefit.
            </p>
            <p className="text-sm text-gray-700 space-y-2">
              Collect and verify important business data. Verified businesses remain under your supervision, and legal action can be taken if misbehavior occurs. 
              Your role as a guarantor is vital—ensure due diligence to protect all parties and maintain trust.
            </p>
          </CardContent>
        </Card>
      )}

      {isRevoked && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Issuer Account on Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 space-y-2">
              Your issuer account is currently on hold. Critical misbehavior may result in loss of profits from affected businesses.
            </p>
            <p className="text-sm text-gray-700 space-y-2">
              20% of losses will go to the Bond Manager for platform sustainability, while the remainder may be recovered from the organization depending on severity. 
              Closely monitor your businesses, and revoke any with repeated violations to maintain trust and accountability.
            </p>
          </CardContent>
        </Card>
      )}

      {isActive && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Business Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input placeholder="Search business by name or ID..." className="w-72" />
              </div>
              <Tabs defaultValue="active">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="revoked">Revoked</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>BUS-{1000 + i}</TableCell>
                    <TableCell>Biz Corp {i}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          i % 3 === 0
                            ? "bg-red-100 text-red-700"
                            : i % 2 === 0
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {i % 3 === 0
                          ? "Revoked"
                          : i % 2 === 0
                          ? "Active"
                          : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>2025-10-2{i}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
};

  /*  */






  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🏛️ Issuer Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your businesses, verify businesses, and manage your businesses behaviour.
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")} // <-- route to go back
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
        >
          ← Back
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Users className="w-4 h-4" />
              Total Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{businessStats.total}</p>  
            <p className="text-sm text-gray-500">All businesses under this issuer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Building2 className="w-4 h-4" />
              Active Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{businessStats.active}</p>
            <p className="text-sm text-gray-500">Currently active businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Activity className="w-4 h-4" />
              Revoked Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{businessStats.revoked}</p>
            <p className="text-sm text-gray-500">Revoked or suspended businesses</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Monitoring Section */}
      <>
        {renderIssuerContent()}
      </>
      

      <div className="flex flex-col md:flex-row gap-6 mt-4">
        {/* Security Section */}
        <Card className="border-blue-300 shadow-sm flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
              Issuer Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              Manage your ECDSA wallet and secure account settings.
            </p>
            <IssuerSecurityDialog />
          </CardContent>
        </Card>

        {/* Bond Section */}
        <Card className="border-green-300 shadow-sm flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Coins className="w-5 h-5" />
              Issuer Bond
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              Stake your bond to become a verified issuer and unlock platform privileges.
            </p>
            <IssuerBondDialog accountId={issuer.data?.edscaAccountId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
