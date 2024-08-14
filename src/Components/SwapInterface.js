import React, { useState } from "react";
import { Box, Button, Input, Select, Text, VStack } from "@chakra-ui/react";

function SwapInterface() {
  const [inputToken, setInputToken] = useState("STX");
  const [outputToken, setOutputToken] = useState("BTC");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");

  const handleSwap = () => {
    // TODO: Implement swap logic
    console.log("Swap initiated");
  };

  return (
    <Box width="100%" maxWidth="400px" margin="auto">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="bold">
          Swap
        </Text>
        <Select
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
        >
          <option value="STX">STX</option>
          <option value="BTC">BTC</option>
        </Select>
        <Input
          placeholder="Input amount"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
        />
        <Select
          value={outputToken}
          onChange={(e) => setOutputToken(e.target.value)}
        >
          <option value="STX">STX</option>
          <option value="BTC">BTC</option>
        </Select>
        <Input
          placeholder="Output amount"
          value={outputAmount}
          onChange={(e) => setOutputAmount(e.target.value)}
          isReadOnly
        />
        <Button onClick={handleSwap} colorScheme="blue">
          Swap
        </Button>
      </VStack>
    </Box>
  );
}

export default SwapInterface;
