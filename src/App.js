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
import CreateMarket from "./Components/CreateMarket";
import AdminMarketList from "./Components/AdminMarketList";
import theme from "./theme";

// Admin check function
export const isAdmin = (userAddress) => {
  const adminAddresses = ["ST1EJ799Q4EJ511FP9C7J71ESA4920QJV7D8YKK2C"]; // Your admin address
  return adminAddresses.includes(userAddress);
};

const ProtectedAdminRoute = ({ children }) => {
  const { userData } = useWallet();
  const userAddress = "ST1EJ799Q4EJ511FP9C7J71ESA4920QJV7D8YKK2C";

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
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundAttachment="fixed"
      >
        <Navbar userAddress={userAddress} />
        <CryptoMarquee />
        <Container maxWidth="container.xl" py={8}>
          <Routes>
            <Route path="/" element={<MarketList />} />
            <Route
              path="/bet/:marketId/:option"
              element={<BettingInterface />}
            />
            <Route path="/create" element={<CreateMarket />} />
            <Route
              path="/admin/markets"
              element={
                <ProtectedAdminRoute>
                  <AdminMarketList />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
};

function App() {
  const appConfig = {
    appName: "Bitcoin Prediction",
    appIconUrl: "/your-app-icon.png",
    network: "mainnet",
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
