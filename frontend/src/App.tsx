import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from "./pages/public/accounts/createAccount";
import ProtectedRoute from "./pages/private/proctectedPages";
//import Dashboard from "./pages/public/landingPage";
//import SelfCustodialAccount from "./pages/public/accounts/selfCustodialAccount";
/* import { WalletUI } from "./pages/public/accounts/selfCustodial/walletUI"; */
import { HederaCrossProjectConnect } from "./pages/public/accounts/crossProject/crossProject";
import { TransactionForm } from "./pages/private/eventPage/createEvent";
import EventActionsPage from "./pages/private/eventPage/updateTopic";
/* import HederaWalletConnect fro./pages/public/connectest"; */
import { Toaster } from "sonner";

import { BusinessAdminPage } from "./pages/private/orgPages/business/adminPage";
import SelfCustodialAccount from "./pages/public/accounts/selfCustodialAccount";
import LandingPage from "./pages/public/welcome";
import { WalletUI } from "./pages/public/accounts/selfCustodial/wallet";
import QrPage from "./pages/public/verifyPage";
import UserAuth from "./pages/private/signin";
import HederaDashboard from "./pages/private/mainDashboard";
import ContactsPage from "./pages/private/contactList";
import IssuerDashboard from "./pages/private/orgPages/Issuer/adminPage";
import BondDialog from "./pages/public/test";



function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/hh" element={<LandingPage />} />
          <Route path="/signin" element={<UserAuth />} />
           <Route path="/create-account" element={<CreateAccount />} />
         {/*  <Route path="/welcome" element={<LandingPage />} /> */}
          <Route path="/qr" element={<QrPage />} />
    
          <Route path="/issuer" element={<IssuerDashboard />} />
          <Route path="/business" element={<BusinessAdminPage />} />
          {/* Private */}
           <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<HederaDashboard />} />
            <Route path="/contacts" element={<ContactsPage />} /> 
            
      
            <Route path="/import-account" element={<HederaCrossProjectConnect />} />
            <Route path="/self-custodian" element={<WalletUI />} />
            <Route path="/events" element={<TransactionForm/>} />
            <Route path="/events-update" element={<EventActionsPage />} />
          </Route> 
          
          {/* Public */}
        </Routes>
        
        {/* 🌟 Add the global toast container here */}
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </>
  )
}

export default App
