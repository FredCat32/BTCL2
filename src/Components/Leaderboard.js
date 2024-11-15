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
  const highlightColor = useColorModeValue("blue.50", "blue.900");
  const hoverColor = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Frontend: Update the fetchLeaderboard function in your Leaderboard.js
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching leaderboard data...");
      const response = await axios.get(`${API_URL}/api/points/leaderboard`);
      console.log("Raw leaderboard response:", response.data);

      // Convert single object response to array if needed
      let leaderboardData = response.data;
      if (!Array.isArray(leaderboardData)) {
        if (leaderboardData.totalPoints !== undefined) {
          // If it's a single user object, convert to array
          leaderboardData = [leaderboardData];
        } else {
          // If it's invalid data, use empty array
          leaderboardData = [];
        }
      }

      // Filter out any invalid entries
      const validData = leaderboardData.filter(
        (entry) =>
          entry && entry.walletAddress && typeof entry.totalPoints === "number"
      );

      console.log("Processed leaderboard data:", validData);
      setLeaderboardData(validData);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setLeaderboardData([]); // Set empty array on error
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

  const getLastActivity = (entry) => {
    if (entry.lastUpdated) {
      return new Date(entry.lastUpdated).toLocaleDateString();
    }
    if (entry.transactionHistory?.[0]?.date) {
      return new Date(entry.transactionHistory[0].date).toLocaleDateString();
    }
    return "No recent activity";
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading leaderboard...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">{error}</Text>
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
                    key={entry.walletAddress}
                    bg={
                      entry.walletAddress === userAddress
                        ? highlightColor
                        : "inherit"
                    }
                    _hover={{ bg: hoverColor }}
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
                        {Math.abs(entry.totalPoints).toLocaleString()}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600">
                        {getLastActivity(entry)}
                      </Text>
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
