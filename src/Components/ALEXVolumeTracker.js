import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Text,
  Spinner,
  Code,
} from "@chakra-ui/react";
import { connectWebSocketClient } from "@stacks/blockchain-api-client";

const ALEXVolumeTracker = () => {
  const [volumeData, setVolumeData] = useState([]);
  const [timePeriod, setTimePeriod] = useState("24h");
  const [isLoading, setIsLoading] = useState(true);
  const [debug, setDebug] = useState("");

  useEffect(() => {
    const fetchVolumeData = async () => {
      setIsLoading(true);
      setDebug("Connecting to Stacks blockchain...");
      try {
        const client = await connectWebSocketClient("mainnet");
        setDebug((prev) => prev + "\nConnected. Subscribing to blocks...");

        await client.subscribeBlocks((block) => {
          setDebug((prev) => prev + `\nReceived block ${block.height}`);
          const transactions = block.transactions;
          setDebug(
            (prev) => prev + `\nFound ${transactions.length} transactions`
          );

          const alexSwaps = transactions.filter((tx) => {
            const isAlexSwap =
              tx.tx_type === "contract_call" &&
              tx.contract_call &&
              tx.contract_call.contract_id.includes("ALEX") &&
              tx.contract_call.function_name.includes("swap");
            if (isAlexSwap) {
              setDebug((prev) => prev + "\nFound ALEX swap transaction");
            }
            return isAlexSwap;
          });

          setDebug((prev) => prev + `\nFound ${alexSwaps.length} ALEX swaps`);

          if (alexSwaps.length > 0) {
            const swapData = alexSwaps.map((swap) => ({
              token0:
                swap.contract_call.function_args.find(
                  (arg) => arg.name === "token_x"
                )?.repr || "Unknown",
              token1:
                swap.contract_call.function_args.find(
                  (arg) => arg.name === "token_y"
                )?.repr || "Unknown",
              amount: parseInt(
                swap.contract_call.function_args.find(
                  (arg) => arg.name === "dx"
                )?.repr || "0"
              ),
              timestamp: block.burn_block_time * 1000,
            }));

            const aggregatedData = aggregateSwapData(swapData, timePeriod);
            setVolumeData(aggregatedData);
          }
        });
      } catch (error) {
        console.error("Error fetching volume data:", error);
        setDebug((prev) => prev + `\nError: ${error.message}`);
      }
      setIsLoading(false);
    };

    fetchVolumeData();
  }, [timePeriod]);

  const aggregateSwapData = (swapData, period) => {
    const now = Date.now();
    const periodInMs =
      period === "1h" ? 3600000 : period === "24h" ? 86400000 : 604800000;
    const filteredSwaps = swapData.filter(
      (swap) => now - swap.timestamp <= periodInMs
    );

    const aggregated = filteredSwaps.reduce((acc, swap) => {
      const key = `${swap.token0}-${swap.token1}`;
      if (!acc[key]) {
        acc[key] = { pair: key, volume: 0 };
      }
      acc[key].volume += swap.amount;
      return acc;
    }, {});

    return Object.values(aggregated)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
  };

  return (
    <Box
      backdropFilter="blur(10px)"
      backgroundColor="rgba(0, 0, 0, 0.6)"
      borderRadius="lg"
      padding={6}
      boxShadow="dark-lg"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Highest Volume Pairs on ALEX
      </Text>
      <Select
        value={timePeriod}
        onChange={(e) => setTimePeriod(e.target.value)}
        mb={4}
        width="200px"
      >
        <option value="1h">Last 1 Hour</option>
        <option value="24h">Last 24 Hours</option>
        <option value="7d">Last 7 Days</option>
      </Select>
      {isLoading ? (
        <Spinner />
      ) : volumeData.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Token Pair</Th>
              <Th>Volume</Th>
            </Tr>
          </Thead>
          <Tbody>
            {volumeData.map((pair) => (
              <Tr key={pair.pair}>
                <Td>{pair.pair}</Td>
                <Td>{pair.volume.toLocaleString()} (in smallest unit)</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>No data available for the selected time period.</Text>
      )}
      <Box mt={4}>
        <Text fontWeight="bold">Debug Information:</Text>
        <Code>{debug}</Code>
      </Box>
    </Box>
  );
};

export default ALEXVolumeTracker;
