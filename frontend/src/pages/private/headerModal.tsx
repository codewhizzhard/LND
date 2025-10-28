// src/components/Header.tsx
import React from "react";
import lnd from "../../assets/lnd.png";
import { X } from "lucide-react";

interface HeaderProps {
  creator: any;
  navigate: (path: string) => void;
  isModalOpen: boolean;
  handleOpenModal: () => void;
  handleCloseModal: () => void;
  name: string;
  setName: (val: string) => void;
  sector: string;
  setSector: (val: string) => void;
  type: "business" | "issuer" | "";
  setType: (val: "business" | "issuer" | "") => void;
  saving: boolean;
  modalError: string;
  handleSubmit: () => void;
  handleLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  creator,
  navigate,
  isModalOpen,
  handleOpenModal,
  handleCloseModal,
  name,
  setName,
  sector,
  setSector,
  type,
  setType,
  saving,
  modalError,
  handleSubmit,
  handleLogout,
}) => {
  return (
    <>
      <header className="w-full flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur sticky top-0 shadow-sm z-20">
        {/* ...same JSX as before */}
      </header>

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
              <input
                type="text"
                placeholder="Name"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
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
                onChange={(e) => setType(e.target.value as "business" | "issuer")}
                disabled={saving}
              >
                <option value="">Select Type</option>
                <option value="business">BUSINESS</option>
                <option value="issuer">ISSUER</option>
              </select>
            </div>

            {modalError && <p className="text-sm text-red-600 mt-2">{modalError}</p>}

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
                disabled={saving || !name || !sector || !type}
              >
                {saving ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
};
