"use client"

import { useEffect, useState } from "react"
import sdk from "@/sdk"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react"

export default function QrPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loadingDB, setLoadingDB] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalVerified: 0,
    totalUnverified: 0,
    allVerified: false,
  })

  const topicId = "0.0.6955022"

  useEffect(() => {
    const fetchAndVerify = async () => {
      try {
        // Step 1️⃣ — Fetch events from DB
        setLoadingDB(true)
        const dbRes = await sdk.verifyEventsFromDB(topicId)
        setLoadingDB(false)

        const dbEvents = dbRes?.data?.data?.events || []
        if (!dbRes.success || dbEvents.length === 0) {
          setError("No events found for this topic.")
          return
        }

        // Show DB events instantly
        setEvents(
          dbEvents.map((e: any) => ({
            ...e,
            verified: false,
            verifying: true,
          }))
        )

        // Step 2️⃣ — Verify against Hedera
        setVerifying(true)
        const hederaRes = await sdk.verifyEventsOnHedera(dbEvents)
        console.log("🟢 Hedera Response:", hederaRes)
        setVerifying(false)

        const hederaData = hederaRes?.data?.data || {}
        const verifiedEvents = hederaData.verifiedEvents || []
        const allValid = hederaData.allValid || false

        // Build sets for fast comparison
        const verifiedHashes = new Set(
          verifiedEvents.map((item: any) => item.messageHash)
        )
        const dbHashes = new Set(dbEvents.map((e: any) => e.messageHash))

        // Detect Hedera-only events (debugging only)
        const extraHederaEvents = [...verifiedHashes].filter(
          (h) => !dbHashes.has(h)
        )
        if (extraHederaEvents.length > 0) {
          console.log("🟣 Extra Hedera-only events:", extraHederaEvents)
        }

        // Step 3️⃣ — Update events with verified status
        const updated = dbEvents.map((event: any) => ({
          ...event,
          verifying: false,
          verified: verifiedHashes.has(event.messageHash),
        }))

        setEvents(updated)

        // 🧮 Step 4️⃣ — Calculate stats
        const totalVerified = updated.filter((e) => e.verified).length
        const totalEvents = updated.length
        const totalUnverified = totalEvents - totalVerified
        const allVerifiedNow = totalVerified === totalEvents

        setStats({
          totalEvents,
          totalVerified,
          totalUnverified,
          allVerified: allVerifiedNow,
        })

        // ✅ Only show error if DB events failed verification
        if (totalUnverified > 0) {
          setError("Some events could not be verified on Hedera.")
        } else {
          setError(null)
        }
      } catch (err: any) {
        console.error("❌ Verification error:", err)
        setError(err.message || "Unexpected error during verification")
        setLoadingDB(false)
        setVerifying(false)
      }
    }

    fetchAndVerify()
  }, [topicId])

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔍 Hedera Events Verification</h1>
        <p className="text-muted-foreground">
          Viewing all events linked to topic ID <b>{topicId}</b>.<br />
          Data loads instantly, verification runs in background.
        </p>
      </div>

      {/* Loading state */}
      {loadingDB && (
        <div className="flex justify-center items-center gap-2">
          <Loader2 className="animate-spin w-5 h-5" />
          <p>Fetching events from database...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          ❌ {error}
        </div>
      )}

      {/* 🧩 Stats Summary */}
      {!loadingDB && events.length > 0 && (
        <Card className="border border-gray-200 shadow-sm bg-gray-50">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Verification Summary
            </CardTitle>
            <Badge
              className={`${
                stats.allVerified ? "bg-green-600" : "bg-yellow-500"
              } text-white`}
            >
              {stats.allVerified ? "All Verified" : "Partial Verification"}
            </Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
            <div>
              <p className="font-semibold">Total Events</p>
              <p>{stats.totalEvents}</p>
            </div>
            <div>
              <p className="font-semibold text-green-600">Verified</p>
              <p>{stats.totalVerified}</p>
            </div>
            <div>
              <p className="font-semibold text-red-600">Unverified</p>
              <p>{stats.totalUnverified}</p>
            </div>
            <div>
              <p className="font-semibold">All Verified</p>
              <p>{stats.allVerified ? "✅ Yes" : "❌ No"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      {!loadingDB && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event, idx) => (
            <Card key={event._id || idx} className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Event #{idx + 1}
                  </CardTitle>

                  {/* ✅ Dynamic Verification Badge */}
                  {event.verifying ? (
                    <Badge className="bg-yellow-500 text-white">
                      <Loader2 className="animate-spin w-3.5 h-3.5 mr-1" />
                      Verifying...
                    </Badge>
                  ) : event.verified ? (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-400 text-white">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {event.creatorDID} • {new Date(event.createdAt).toLocaleString()}
                </p>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                {/* 🧩 Core Data */}
                <div>
                  <p className="font-semibold">Message:</p>
                  <p className="bg-gray-50 border p-2 rounded">
                    {event.payload?.message || "No message"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-semibold">Sector:</p>
                    <p>{event.payload?.sector || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Action:</p>
                    <p>{event.payload?.action || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Account ID:</p>
                    <p>{event.accountId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Expiry Date:</p>
                    <p>
                      {event.payload?.expiryDate
                        ? new Date(event.payload.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

               <div className="pt-2 border-t text-xs text-muted-foreground break-all">
                <p>Message Hash: {event.messageHash}</p>
                <p>Transaction ID: {event.msgTransactionId}</p>
                <p>Consensus Timestamp: {event.consensusTimestamp}</p>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Background verification notice */}
      {verifying && !error && (
        <div className="flex justify-center items-center gap-2 mt-4 text-sm">
          <Loader2 className="animate-spin w-5 h-5" />
          <p>Background verification running on Hedera...</p>
        </div>
      )}
    </div>
  )
}
