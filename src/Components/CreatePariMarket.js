import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  Text,
  Spinner,
  HStack,
  NumberInput,
  NumberInputField,
  Card,
  CardHeader,
  CardBody,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import { useConnect } from "@stacks/connect-react";
import { StacksTestnet } from "@stacks/network";
import { uintCV, stringAsciiCV, listCV } from "@stacks/transactions";
import { PostConditionMode } from "@stacks/transactions";

const CreateParimutuelMarket = () => {
  const [question, setQuestion] = useState("");
  const [outcomes, setOutcomes] = useState([
    { number: 1, name: "" },
    { number: 2, name: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState(null);
  const toast = useToast();
  const { doContractCall } = useConnect();
  const API_URL = process.env.REACT_APP_API_URL;

  const addOutcome = () => {
    if (outcomes.length < 10) {
      const nextNumber = Math.max(...outcomes.map((o) => o.number)) + 1;
      setOutcomes([...outcomes, { number: nextNumber, name: "" }]);
    } else {
      toast({
        title: "Maximum Outcomes Reached",
        description: "Cannot add more than 10 outcomes",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeOutcome = () => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.slice(0, -1));
    } else {
      toast({
        title: "Minimum Outcomes Required",
        description: "Cannot have fewer than 2 outcomes",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateOutcomeName = (index, name) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index].name = name;
    setOutcomes(newOutcomes);
  };

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

    if (outcomes.some((outcome) => !outcome.name.trim())) {
      toast({
        title: "Error",
        description: "All outcomes must have names",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const network = new StacksTestnet();
      const contractAddress = process.env.REACT_APP_TESTCONTRACT_ADDRESS;
      const contractName = process.env.REACT_APP_PARICONTRACT_NAME;

      // Create the contract arguments
      const outcomesCV = listCV(outcomes.map((o) => uintCV(o.number)));
      const outcomeNamesCV = listCV(
        outcomes.map((o) => stringAsciiCV(o.name.trim()))
      );

      await doContractCall({
        network,
        contractAddress,
        contractName,
        functionName: "create-market",
        functionArgs: [
          outcomesCV,
          outcomeNamesCV,
          stringAsciiCV(question.trim()),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: async (data) => {
          console.log("Contract call finished", data);
          setTxId(data.txId);
          await storeMarketInDatabase(data.txId);
        },
        onCancel: () => {
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
        description: "Failed to create market: " + error.message,
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
      // Ensure arrays are properly formatted
      const marketData = {
        question,
        outcomes: outcomes.map((o) => o.number), // Simple array of numbers
        outcomeNames: outcomes.map((o) => o.name.trim()), // Simple array of strings
        txId,
        visible: false,
        notes,
        imageUrl,
      };

      console.log("Sending market data to backend:", marketData);

      const response = await axios.post(
        `${API_URL}/api/parimarkets`,
        marketData
      );

      console.log("API Response:", response.data);

      toast({
        title: "Success",
        description: "Market created and stored in database",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      resetForm();
    } catch (error) {
      console.error("Error storing market in database:", error);
      toast({
        title: "Error",
        description: "Failed to store market in database: " + error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const resetForm = () => {
    setQuestion("");
    setOutcomes([
      { number: 1, name: "" },
      { number: 2, name: "" },
    ]);
    setNotes("");
    setImageUrl("");
    setTxId(null);
  };

  return (
    <Box maxWidth="800px" margin="auto" p={6}>
      <Card>
        <CardHeader>
          <Heading size="lg">Create Pari-mutuel Market</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Market Question</FormLabel>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the market question"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Outcomes</FormLabel>
              <VStack spacing={4} align="stretch" width="100%">
                {outcomes.map((outcome, index) => (
                  <HStack key={outcome.number} spacing={4}>
                    <Text width="100px">Outcome {outcome.number}:</Text>
                    <Input
                      value={outcome.name}
                      onChange={(e) => updateOutcomeName(index, e.target.value)}
                      placeholder={`Enter name for outcome ${outcome.number}`}
                    />
                  </HStack>
                ))}
                <HStack spacing={4}>
                  <Button
                    onClick={addOutcome}
                    colorScheme="green"
                    size="sm"
                    isDisabled={outcomes.length >= 10}
                  >
                    + Add Outcome
                  </Button>
                  <Button
                    onClick={removeOutcome}
                    colorScheme="red"
                    size="sm"
                    isDisabled={outcomes.length <= 2}
                  >
                    - Remove Outcome
                  </Button>
                </HStack>
              </VStack>
            </FormControl>

            <FormControl>
              <FormLabel>Market Notes</FormLabel>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information or context"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Background Image URL</FormLabel>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </FormControl>

            <Button
              onClick={createMarket}
              colorScheme="blue"
              width="100%"
              size="lg"
              isLoading={isSubmitting}
              loadingText="Creating Market"
            >
              Create Market
            </Button>

            {isSubmitting && <Spinner />}
            {txId && (
              <Text fontSize="sm" color="gray.600">
                Transaction ID: {txId}
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default CreateParimutuelMarket;
