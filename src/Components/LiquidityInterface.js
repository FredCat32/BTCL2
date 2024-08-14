import React, { useState } from "react";
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";

function LiquidityInterface() {
  const [stxAmount, setStxAmount] = useState("");
  const [btcAmount, setBtcAmount] = useState("");

  const handleAddLiquidity = () => {
    // TODO: Implement add liquidity logic
    console.log("Add liquidity initiated");
  };

  return (
    <Box width="100%" maxWidth="400px" margin="auto">
      <VStack spacing={4}>
        <Text>Add Liquidity</Text>
        <Input
          placeholder="STX amount"
          value={stxAmount}
          onChange={(e) => setStxAmount(e.target.value)}
        />
        <Input
          placeholder="BTC amount"
          value={btcAmount}
          onChange={(e) => setBtcAmount(e.target.value)}
        />
        <Button onClick={handleAddLiquidity} colorScheme="green">
          Add Liquidity
        </Button>
      </VStack>
    </Box>
  );
}

export default LiquidityInterface;
