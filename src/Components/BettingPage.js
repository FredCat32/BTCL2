import React from "react";
import { useParams } from "react-router-dom";
import { Box, Heading, Text } from "@chakra-ui/react";
import BettingInterface from "./BettingInterface";

const BettingPage = () => {
  const { id } = useParams();

  // This would be fetched from your smart contract in a real implementation

  return (
    <Box maxWidth="800px" margin="auto" p={5}>
      <Heading size="lg" mb={4}>
        {market.question}
      </Heading>
      <Text mb={4}>Ends: {market.endTime}</Text>
      <BettingInterface market={} />
    </Box>
  );
};

export default BettingPage;
