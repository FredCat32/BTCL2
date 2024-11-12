import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import axios from "axios";
import { useWallet } from "../WalletContext";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useWallet();
  const userAddress = userData?.profile?.stxAddress?.mainnet;
  const API_URL = process.env.REACT_APP_API_URL;

  const bgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/points/leaderboard`);
      console.log("Leaderboard response:", response.data);

      // If we get a single user's data, convert it to an array with that user
      if (response.data && typeof response.data.totalPoints !== "undefined") {
        setLeaderboardData([
          {
            walletAddress: userAddress,
            totalPoints: response.data.totalPoints,
            transactionHistory: response.data.transactionHistory,
          },
        ]);
      } else if (Array.isArray(response.data)) {
        setLeaderboardData(response.data);
      } else {
        setLeaderboardData([]); // Empty array if no valid data
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setLeaderboardData([]); // Initialize empty array on error
      setError("Failed to load leaderboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankBadge = (rank) => {
    if (rank === 0) return <Badge colorScheme="yellow">🥇 1st</Badge>;
    if (rank === 1) return <Badge colorScheme="gray">🥈 2nd</Badge>;
    if (rank === 2) return <Badge colorScheme="orange">🥉 3rd</Badge>;
    return <Badge colorScheme="blue">{rank + 1}th</Badge>;
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading leaderboard...</Text>
      </Box>
    );
  }

  return (
    <Card
      maxWidth="900px"
      margin="auto"
      mt={8}
      bg={bgColor}
      boxShadow="xl"
      borderRadius="lg"
    >
      <CardHeader>
        <VStack spacing={2} align="center">
          <Heading size="lg">Points Leaderboard</Heading>
          <Text color="gray.500">Top Traders by Points</Text>
        </VStack>
      </CardHeader>

      <CardBody>
        <Box overflowX="auto">
          {leaderboardData.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Rank</Th>
                  <Th>Wallet</Th>
                  <Th isNumeric>Points</Th>
                  <Th>Recent Activity</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboardData.map((entry, index) => (
                  <Tr
                    key={entry.walletAddress || index}
                    bg={
                      entry.walletAddress === userAddress
                        ? "blue.50"
                        : "inherit"
                    }
                    _hover={{ bg: "gray.50" }}
                  >
                    <Td>
                      <HStack spacing={2}>{getRankBadge(index)}</HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Text>
                          {truncateAddress(entry.walletAddress)}
                          {entry.walletAddress === userAddress && (
                            <Badge ml={2} colorScheme="green">
                              You
                            </Badge>
                          )}
                        </Text>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <Text fontWeight="bold">
                        {entry.totalPoints.toLocaleString()}
                      </Text>
                    </Td>
                    <Td>
                      {entry.transactionHistory &&
                      entry.transactionHistory.length > 0 ? (
                        <Text fontSize="sm" color="gray.600">
                          Last activity:{" "}
                          {new Date(
                            entry.transactionHistory[0].date
                          ).toLocaleDateString()}
                        </Text>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          No recent activity
                        </Text>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Box textAlign="center" py={10}>
              <Text>
                No points data available yet. Start trading to earn points!
              </Text>
            </Box>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default Leaderboard;
