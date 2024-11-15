import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/stats/overview`
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        <Heading size="xl" textAlign="center">
          Platform Statistics
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Stat>
                <StatLabel>Total Volume</StatLabel>
                <StatNumber>
                  {stats.totalStats.volume.toFixed(2)} STX
                </StatNumber>
                <StatHelpText>All-time trading volume</StatHelpText>
              </Stat>
            </CardHeader>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Stat>
                <StatLabel>Total Traders</StatLabel>
                <StatNumber>{stats.totalStats.uniqueTraders.size}</StatNumber>
                <StatHelpText>Unique addresses</StatHelpText>
              </Stat>
            </CardHeader>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Stat>
                <StatLabel>Total Markets</StatLabel>
                <StatNumber>{stats.totalStats.markets}</StatNumber>
                <StatHelpText>Created markets</StatHelpText>
              </Stat>
            </CardHeader>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Stat>
                <StatLabel>Total Liquidity</StatLabel>
                <StatNumber>
                  {stats.totalStats.totalLiquidity.toFixed(2)} STX
                </StatNumber>
                <StatHelpText>Across all markets</StatHelpText>
              </Stat>
            </CardHeader>
          </Card>
        </SimpleGrid>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Daily Statistics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Stat>
                <StatLabel>Daily Volume</StatLabel>
                <StatNumber>
                  {stats.dailyStats.volume.toFixed(2)} STX
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Daily Trades</StatLabel>
                <StatNumber>{stats.dailyStats.trades}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Daily Traders</StatLabel>
                <StatNumber>{stats.dailyStats.uniqueTraders}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>New Markets</StatLabel>
                <StatNumber>{stats.dailyStats.newMarkets}</StatNumber>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default StatsPage;
