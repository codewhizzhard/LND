import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // ✅ import Sonner
import sdk from "../../sdk";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [newContactId, setNewContactId] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  //const navigate = useNavigate();


  // 🔹 Fetch contacts on mount
  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoadingContacts(true);
        const res = await sdk.viewAllContacts();
        console.log("rr:", res.data);
        if (res.success) {
          setContacts(res.data.contacts || []);
          if (res.data.contacts?.length === 0) {
            toast.info("No contacts found.");
          }
        } else {
          toast.error(res.error || "Could not fetch contacts");
        }
      } catch (err: any) {
        toast.error(err.message || "Error fetching contacts");
      } finally {
        setLoadingContacts(false);
      }
    }
    fetchContacts();
  }, []);

  // 🔹 Add contact handler
  async function handleAddContact() {
    setAddingContact(true);
    try {
      const res = await sdk.addContact(newContactId, newDisplayName);
      if (res.success) {
        setContacts((prev) => [...prev, res.data]);
        setNewContactId("");
        setNewDisplayName("");
        toast.success("Contact added successfully ✅");
      } else {
        toast.error(res.error || "Failed to add contact");
      }
    } catch (err: any) {
      toast.error(err.message || "Error adding contact");
    } finally {
      setAddingContact(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        ← Back
      </button>

      <h2 className="text-xl font-semibold mb-4">My Contacts</h2>

      {/* 🔹 Add New Contact Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Contact Account ID"
            value={newContactId}
            onChange={(e) => setNewContactId(e.target.value)}
          />
          <Input
            placeholder="Display Name"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
          />
          <Button onClick={handleAddContact} disabled={addingContact}>
            {addingContact ? "Adding..." : "Add Contact"}
          </Button>
        </CardContent>
      </Card>

      {/* 🔹 Contact List */}
      <div className="grid gap-3">
        {loadingContacts && <p>Loading contacts...</p>}
        {contacts.length === 0 && !loadingContacts && (
          <p className="text-slate-500">No contacts yet.</p>
        )}

        {contacts.map((c) => (
          <Card key={c._id || c.id} className="mb-2">
            <CardContent className="flex justify-between items-center p-3">
              <div>
                <div className="font-medium">
                  {c.contactDisplayName ?? "Unnamed"}
                </div>
                <div className="text-xs text-slate-500">
                  {c.exist ? c.contactAccountId : "User no longer registered"}
                </div>
              </div>

              <div className="flex gap-2">
                {c.exist ? (
                  <>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
