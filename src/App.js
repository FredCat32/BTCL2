import React from "react";
import { ChakraProvider, Box, Container } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Connect } from "@stacks/connect-react";
import { WalletProvider, useWallet } from "./WalletContext";
import Navbar from "./Components/NavBar";
import CryptoMarquee from "./Components/CryptoMarquee";
import MarketList from "./Components/MarketList";
import BettingInterface from "./Components/BettingInterface";
import PariMutualInterface from "./Components/PariMutualInterface";
import CreateMarket from "./Components/CreateMarket";
import CreateParimutuelMarket from "./Components/CreatePariMarket";
import AdminMarketList from "./Components/AdminMarketList";
import ParimutelAdminMarketList from "./Components/ParimutelAdminMarketList";
import SocialsPage from "./Components/SocialsPage";
import theme from "./theme";

// Admin check function
export const isAdmin = (userAddress) => {
  const adminAddresses = ["SP1EJ799Q4EJ511FP9C7J71ESA4920QJV7CQHGA61"]; // Your admin address
  return adminAddresses.includes(userAddress);
};

const ProtectedAdminRoute = ({ children }) => {
  const { userData } = useWallet();
  const userAddress = "SP1EJ799Q4EJ511FP9C7J71ESA4920QJV7CQHGA61";

  if (!isAdmin(userAddress)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
const AppContent = () => {
  const { userData } = useWallet();
  const userAddress = userData?.profile?.stxAddress?.mainnet;

  return (
    <Router>
      <Box
        minHeight="100vh"
        width="100%"
        height="100%"
        backgroundImage="url('/background.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundAttachment="fixed"
      >
        <CryptoMarquee />
        <Navbar userAddress={userAddress} />
        <Box width="100%" px={4} py={8}>
          <Routes>
            <Route path="/" element={<MarketList />} />
            <Route path="/bet/:id/:outcome" element={<BettingInterface />} />
            <Route
              path="/parimutual/:id/:outcome"
              element={<PariMutualInterface />}
            />
            <Route path="/create" element={<CreateMarket />} />
            <Route path="/paricreate" element={<CreateParimutuelMarket />} />
            <Route
              path="/admin/markets"
              element={
                <ProtectedAdminRoute>
                  <AdminMarketList />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/parimarkets"
              element={
                <ProtectedAdminRoute>
                  <ParimutelAdminMarketList />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/socials" element={<SocialsPage />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

function App() {
  const appConfig = {
    appName: "Bitcoin Prediction",
    appIconUrl: "/your-app-icon.png",
    network: "testnet",
  };

  return (
    <ChakraProvider theme={theme}>
      <Connect authOptions={appConfig}>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </Connect>
    </ChakraProvider>
  );
}

export default App;
