import React from "react";
import { ChakraProvider, Box, Heading, VStack } from "@chakra-ui/react";
import CryptoPrices from "./Components/CryptoPrices";
import LastBlockTime from "./Components/LastBlockTime";
import SwapInterface from "./Components/SwapInterface";
import LiquidityInterface from "./Components/LiquidityInterface";
import WalletConnection from "./Components/WalletConnection";

function App() {
  return (
    <ChakraProvider>
      <Box
        textAlign="center"
        py={10}
        px={6}
        backgroundImage="url('/background.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        minHeight="100vh"
      >
        <Heading as="h1" size="2xl" mb={6}>
          StackSwap DEX
        </Heading>
        <VStack spacing={8}>
          <WalletConnection />
          <SwapInterface />
          <LiquidityInterface />
          <CryptoPrices />
          <LastBlockTime />
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
