import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  Divider,
  Spinner,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Input,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";
import { hexToCV, cvToString, makeContractCall } from "@stacks/transactions";
import { cvToHex, uintCV, intCV } from "@stacks/transactions";
import { Cl, parseReadOnlyResponse } from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import {
  callReadOnlyFunction,
  cvToJSON,
  bufferCVFromString,
  standardPrincipalCV,
} from "@stacks/transactions";
import { useConnect } from "@stacks/connect-react";

const BettingInterface = () => {
  const location = useLocation();
  const { market, marketId, onChainId } = location.state || {};

  const parseClarityValue = (clarityString) => {
    const match = clarityString.match(/\(ok \(tuple (.*)\)\)/);
    if (match) {
      const pairs = match[1].match(/\((.*?) (.*?)\)/g);
      return pairs.reduce((acc, pair) => {
        const [key, value] = pair.slice(1, -1).split(" ");
        acc[key] = value.startsWith("u") ? parseInt(value.slice(1)) : value;
        return acc;
      }, {});
    }
    return null;
  };
  const { doContractCall } = useConnect();
  const [apiResponse, setApiResponse] = useState(null);
  const [apiResponse2, setApiResponse2] = useState(null);
  const [decodedOwner, setDecodedOwner] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState("");

  const contractAddress = "ST1EJ799Q4EJ511FP9C7J71ESA4920QJV7D8YKK2C";
  const contractName = "market8";
  const apiEndpoint = "https://stacks-node-api.testnet.stacks.co";
  const [slippage, setSlippage] = useState(0);

  const bgColor = useColorModeValue("gray.100", "gray.700");

  const marketDetails = apiResponse ? parseClarityValue(apiResponse) : null;
  const userPosition = apiResponse2 ? parseClarityValue(apiResponse2) : null;

  useEffect(() => {
    if (onChainId) {
      fetchMarketDetails();
      fetchUserPosition();
    }
  }, [onChainId]);
  useEffect(() => {
    if (marketDetails && transactionAmount) {
      const poolSize = location.pathname.includes("/yes")
        ? marketDetails["yes-pool"]
        : marketDetails["no-pool"];
      const calculatedSlippage = calculateSlippage(
        transactionAmount * 1000000,
        poolSize,
        marketDetails["total-liquidity"]
      );
      setSlippage(calculatedSlippage);
    }
  }, [transactionAmount, marketDetails]);
  const fetchMarketDetails = async () => {
    setIsLoading(true);
    const functionName = "get-market-details";
    const tokenId = uintCV(onChainId);
    const network = new StacksTestnet();

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [tokenId],
      network,
      senderAddress: contractAddress,
    };

    try {
      const response = await callReadOnlyFunction(options);
      console.log(response);
      setApiResponse(cvToString(response));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const calculateSlippage = (amount, poolSize, totalLiquidity) => {
    const constantProduct = poolSize * totalLiquidity;
    const newPoolSize = poolSize + parseFloat(amount);
    const newTotalLiquidity = totalLiquidity + parseFloat(amount);
    const newOtherPoolSize = constantProduct / newPoolSize;

    const priceBeforeSwap = totalLiquidity / poolSize;
    const priceAfterSwap = newTotalLiquidity / newPoolSize;

    const slippage =
      ((priceAfterSwap - priceBeforeSwap) / priceBeforeSwap) * 100;

    return Math.abs(slippage).toFixed(2);
  };

  const handleSwapStxToYes = async () => {
    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(parseFloat(transactionAmount) * 1000000), // stx-amount in microSTX
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: "swap-stx-to-yes",
      functionArgs,
      network: new StacksTestnet(),
      onFinish: (data) => {
        console.log("Transaction submitted:", data);
        // You can add additional logic here, like updating UI or fetching new data
      },
      onCancel: () => {
        console.log("Transaction canceled");
      },
    };

    try {
      await doContractCall(options);
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(error.message);
    }
  };

  const handleTransaction = () => {
    if (location.pathname.includes("/yes")) {
      handleSwapStxToYes();
    } else {
      // Implement swap-stx-to-no if needed
      console.log("Selling is not implemented yet");
    }
  };

  const fetchUserPosition = async () => {
    setIsLoading(true);
    const functionName = "get-user-position";
    const marketId = uintCV(onChainId);
    const user = standardPrincipalCV(contractAddress);
    const network = new StacksTestnet();

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [marketId, user],
      network,
      senderAddress: contractAddress,
    };

    try {
      const response = await callReadOnlyFunction(options);
      console.log("Response:", response);
      setApiResponse2(cvToString(response));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getContractOwner = async () => {
    setIsLoading(true);
    setError(null);
    setDecodedOwner(null);

    try {
      const url = `${apiEndpoint}/v2/contracts/call-read/${contractAddress}/${contractName}/get-contract-owner`;
      console.log("Fetching contract owner from URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: contractAddress,
          arguments: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(
        "Contract owner raw response:",
        JSON.stringify(responseData, null, 2)
      );

      if (responseData.okay && responseData.result) {
        const clarityValue = hexToCV(responseData.result);
        const ownerAddress = cvToString(clarityValue);
        setDecodedOwner(ownerAddress);
      }
    } catch (err) {
      console.error("Error fetching contract owner:", err);
      setError(
        err.message || "An error occurred while fetching the contract owner"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (/^\d*\.?\d{0,6}$/.test(value) || value === "") {
      setTransactionAmount(value);
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" p={6}>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <Heading size="md">
              {market?.question || "Betting Market Interface"}
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justifyContent="space-between">
                <Button
                  onClick={getContractOwner}
                  isLoading={isLoading}
                  colorScheme="blue"
                >
                  Get Contract Owner
                </Button>
                {onChainId && (
                  <Text fontWeight="bold">On-chain ID: {onChainId}</Text>
                )}
              </HStack>

              {isLoading && (
                <HStack justifyContent="center">
                  <Spinner />
                  <Text>Loading...</Text>
                </HStack>
              )}

              {error && (
                <Text color="red.500" fontWeight="bold">
                  Error: {error}
                </Text>
              )}

              {decodedOwner && (
                <Text fontWeight="medium">Contract Owner: {decodedOwner}</Text>
              )}

              <Divider />

              {marketDetails && (
                <>
                  <Heading size="sm">Market Details</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>No Pool</StatLabel>
                      <StatNumber>
                        {marketDetails["no-pool"] / 1000000} STX
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Yes Pool</StatLabel>
                      <StatNumber>
                        {marketDetails["yes-pool"] / 1000000} STX
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Total Liquidity</StatLabel>
                      <StatNumber>
                        {marketDetails["total-liquidity"] / 1000000} STX
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Outcome</StatLabel>
                      <StatNumber>{marketDetails.outcome}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Resolved</StatLabel>
                      <StatNumber>
                        {marketDetails.resolved.toString()}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                </>
              )}

              {userPosition && (
                <>
                  <Heading size="sm" mt={4}>
                    Your Position
                  </Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>No</StatLabel>
                      <StatNumber>{userPosition.no / 1000000} STX</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Yes</StatLabel>
                      <StatNumber>{userPosition.yes / 1000000} STX</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </>
              )}

              <Divider />

              <Heading size="sm">
                {location.pathname.includes("/yes") ? "Buy Yes" : "Sell No"}{" "}
                Tokens
              </Heading>
              <HStack>
                <InputGroup>
                  <Input
                    type="text"
                    value={transactionAmount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                  />
                  <InputRightAddon children="STX" />
                </InputGroup>
                <Button
                  onClick={handleTransaction}
                  colorScheme={
                    location.pathname.includes("/yes") ? "green" : "red"
                  }
                  isDisabled={!transactionAmount}
                >
                  {location.pathname.includes("/yes") ? "Buy" : "Sell"}
                </Button>
                <Text>Estimated Slippage: {slippage}%</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default BettingInterface;
