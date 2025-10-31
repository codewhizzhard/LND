// src/pages/LandingPage.tsx
import { Button } from "@/components/ui/button";
import lndHero from "./assets/herolnd.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800">
      {/* Hero Section */}
      <header className="relative w-full flex flex-col items-center text-center px-6 pt-12 md:pt-20">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Welcome to Business Fabric Infrastructure(BFI)
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          A decentralized land where trust is the new currency —{" "}
          <span className="font-medium text-indigo-600">all powered by Hedera</span>.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            onClick={() => (window.location.href = "/signin")}
            className="cursor-pointer"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            /* onClick={() => (window.location.href = "/docs")} */
            className="cursor-pointer"
          >
            Learn More
          </Button>
        </div>

        {/* Hero Image / SVG */}
        <div className="mt-12 w-full max-w-6xl h-[400px] md:h-[450px] lg:h-[500px] flex justify-center">
        <img
          src={lndHero}
          alt="LND Land connectivity"
          className="h-full w-auto object-contain rounded-xl shadow-lg border"
        />
      </div>
      </header>

      {/* Features Section */}
      <section className="px-6 py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Why LND?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-6 rounded-xl shadow-sm border bg-gradient-to-br from-slate-50 to-white">
              <div className="w-12 h-12 mb-4 mx-auto rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                🔑
              </div>
              <h3 className="text-lg font-semibold mb-2">Decentralized Trust</h3>
              <p className="text-sm text-slate-600">
                Exchange trust with others, be confident on your data, sales, purchase and everything
              </p>
            </div>
            <div className="p-6 rounded-xl shadow-sm border bg-gradient-to-br from-slate-50 to-white">
              <div className="w-12 h-12 mb-4 mx-auto rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-bold">
                👥
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Contacts</h3>
              <p className="text-sm text-slate-600">
                Add and manage trusted contacts seamlessly with DID verification.
              </p>
            </div>
            <div className="p-6 rounded-xl shadow-sm border bg-gradient-to-br from-slate-50 to-white">
              <div className="w-12 h-12 mb-4 mx-auto rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 text-xl font-bold">
                💬
              </div>
              <h3 className="text-lg font-semibold mb-2">Private Messaging</h3>
              <p className="text-sm text-slate-600">
                Send and receive end-to-end encrypted messages directly on Hedera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-16 md:py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Ready to enter the land for decentralization?
        </h2>
        <p className="max-w-2xl mx-auto text-lg mb-6">
          Create your wallet, connect with friends, and explore BFI — the hub for decentralized trust operations.
        </p>
        <Button
          className="cursor-pointer"
          size="lg"
          variant="secondary"
          onClick={() => (window.location.href = "/signin")}
        >
          Create Free Account
        </Button>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-sm text-slate-500 border-t">
        © {new Date().getFullYear()} <span className="italic">BFI</span>. All rights reserved.
      </footer>
    </div>
  );
}
