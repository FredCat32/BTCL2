import React from "react";
import {
  ChakraProvider,
  Box,
  Container,
  Flex,
  Stack,
  Link,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { FaTwitter, FaDiscord, FaGithub, FaTelegram } from "react-icons/fa";
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
  const adminAddresses = ["SP1EJ799Q4EJ511FP9C7J71ESA4920QJV7CQHGA61"];
  return adminAddresses.includes(userAddress);
};

const Footer = () => {
  return (
    <Box
      bg="rgba(0,0,0,0.8)"
      backdropFilter="blur(10px)"
      color="white"
      py={8}
      borderTop="1px"
      borderColor="whiteAlpha.200"
    >
      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap={6}
        >
          <Stack direction="row" spacing={6}>
            <IconButton
              as={Link}
              href="https://x.com/StxBets"
              target="_blank"
              aria-label="BsTwitterX"
              icon={<FaTwitter size="20px" />}
              variant="ghost"
              color="white"
              _hover={{
                bg: "whiteAlpha.200",
                transform: "translateY(-2px)",
                color: "cyan.300",
              }}
              transition="all 0.2s"
            />
            <IconButton
              as={Link}
              href="https://discord.gg/A3CEEca86d"
              target="_blank"
              aria-label="Discord"
              icon={<FaDiscord size="20px" />}
              variant="ghost"
              color="white"
              _hover={{
                bg: "whiteAlpha.200",
                transform: "translateY(-2px)",
                color: "cyan.300",
              }}
              transition="all 0.2s"
            />
          </Stack>
          <Text fontSize="sm" color="whiteAlpha.800">
            © 2024 Bitcoin Prediction. All rights reserved.
          </Text>
        </Flex>
      </Container>
    </Box>
  );
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
        backgroundImage="url('/background.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundAttachment="fixed"
        display="flex"
        flexDirection="column"
      >
        <CryptoMarquee />
        <Navbar userAddress={userAddress} />
        <Box width="100%" px={4} py={8} flex="1">
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
        </Box>
        <Footer />
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
