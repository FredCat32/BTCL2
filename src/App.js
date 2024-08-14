import React from "react";
import { ChakraProvider, Box, VStack, Container } from "@chakra-ui/react";
import { WalletProvider } from "./WalletContext";
import Navbar from "./Components/NavBar";
import CryptoMarquee from "./Components/CryptoMarquee";
import SwapInterface from "./Components/SwapInterface";
import LiquidityInterface from "./Components/LiquidityInterface";
import WalletConnection from "./Components/WalletConnection";
import LastBlockTime from "./Components/LastBlockTime";
import ALEXVolumeTracker from "./Components/ALEXVolumeTracker";

import theme from "./theme";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <WalletProvider>
        <Box
          minHeight="100vh"
          width="100%"
          backgroundImage="url('/background.jpg')"
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundAttachment="fixed"
        >
          <Navbar />
          <CryptoMarquee />
          <ALEXVolumeTracker />

          <Container maxWidth="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
              <Box
                backdropFilter="blur(10px)"
                backgroundColor="rgba(0, 0, 0, 0.6)"
                borderRadius="lg"
                padding={6}
                boxShadow="dark-lg"
              >
                <WalletConnection />
                <SwapInterface />
                <LiquidityInterface />
              </Box>
              <Box
                backdropFilter="blur(10px)"
                backgroundColor="rgba(0, 0, 0, 0.6)"
                borderRadius="lg"
                padding={6}
                boxShadow="dark-lg"
              >
                <LastBlockTime />
              </Box>
            </VStack>
          </Container>
        </Box>
      </WalletProvider>
    </ChakraProvider>
  );
}

export default App;
