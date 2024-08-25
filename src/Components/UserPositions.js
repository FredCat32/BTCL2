import React, { useState } from "react";
import { Box, Heading, Input, Button, VStack } from "@chakra-ui/react";

const CreateMarket = () => {
  const [question, setQuestion] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would interact with the smart contract to create a new market
    console.log("Creating market:", { question, endDate });
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Create New Market
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button type="submit" colorScheme="green">
            Create Market
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateMarket;
