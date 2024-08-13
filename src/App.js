import React from "react";
import { ChakraProvider, Box, Heading } from "@chakra-ui/react";
import CryptoPrices from "./Components/CryptoPrices";
import LastBlockTime from "./Components/LastBlockTime";

function App() {
  return (
    <ChakraProvider>
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h1" size="2xl" mb={6}>
          Welcome to Crypto Price Tracker
        </Heading>
        <CryptoPrices />
        <LastBlockTime />
      </Box>
    </ChakraProvider>
  );
}

export default App;
