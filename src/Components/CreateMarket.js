import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Text,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useConnect } from "@stacks/connect-react";
import { StacksTestnet } from "@stacks/network";
import { uintCV } from "@stacks/transactions";

const CreateMarket = () => {
  const [question, setQuestion] = useState("");
  const [initialLiquidity, setInitialLiquidity] = useState(1000);
  const [yesPercentage, setYesPercentage] = useState(50);
  const [feePercentage, setFeePercentage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState(null);
  const toast = useToast();
  const { doContractCall } = useConnect();

  const createMarket = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a market question",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const network = new StacksTestnet(); // Use StacksMainnet for production
      const contractAddress = "ST1EJ799Q4EJ511FP9C7J71ESA4920QJV7D8YKK2C";
      const contractName = "market8";
      const functionName = "create-market";
      const functionArgs = [
        uintCV(initialLiquidity * 1000000), // Convert to micro-STX
        uintCV(yesPercentage * 100), // Convert to basis points
        uintCV(feePercentage * 100), // Convert to basis points
      ];

      await doContractCall({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        onFinish: async (data) => {
          console.log("Contract call finished", data);
          setTxId(data.txId);
          await storeMarketInDatabase(data.txId);
          toast({
            title: "Success",
            description:
              "Market created successfully. It will be visible after admin approval.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        },
        onCancel: () => {
          console.log("Contract call was cancelled");
          setIsSubmitting(false);
          toast({
            title: "Cancelled",
            description: "Market creation was cancelled",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        },
      });
    } catch (error) {
      console.error("Error creating market:", error);
      toast({
        title: "Error",
        description: "Failed to create market",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const storeMarketInDatabase = async (txId) => {
    try {
      await axios.post("http://localhost:3001/api/markets", {
        question,
        initialLiquidity,
        yesPercentage,
        feePercentage,
        txId,
        visible: false, // Initially set to false
      });
    } catch (error) {
      console.error("Error storing market in database:", error);
      toast({
        title: "Warning",
        description:
          "Market created on blockchain but failed to store in database",
        status: "warning",
        duration: null,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setQuestion("");
    setInitialLiquidity(1000);
    setYesPercentage(50);
    setFeePercentage(1);
    setTxId(null);
  };

  return (
    <Box width="100%" maxWidth="500px" margin="auto">
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Market Question</FormLabel>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter new market question"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Initial Liquidity (STX)</FormLabel>
          <NumberInput
            value={initialLiquidity}
            onChange={(valueString) => setInitialLiquidity(Number(valueString))}
            min={1}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Yes Percentage</FormLabel>
          <NumberInput
            value={yesPercentage}
            onChange={(valueString) => setYesPercentage(Number(valueString))}
            min={1}
            max={99}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Fee Percentage</FormLabel>
          <NumberInput
            value={feePercentage}
            onChange={(valueString) => setFeePercentage(Number(valueString))}
            min={0}
            max={10}
            step={0.1}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <Button
          onClick={createMarket}
          colorScheme="blue"
          width="100%"
          isLoading={isSubmitting}
          loadingText="Submitting"
        >
          Create Market
        </Button>
        {isSubmitting && <Spinner />}
        {txId && <Text>Transaction ID: {txId}</Text>}
      </VStack>
    </Box>
  );
};

export default CreateMarket;
