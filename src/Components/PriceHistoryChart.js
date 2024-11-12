import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Text } from "@chakra-ui/react";

const PriceHistoryChart = ({ data }) => {
  return (
    <Box h="300px" w="100%" bg="gray.900" p={4} borderRadius="lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#888" tick={{ fill: "#888" }} />
          <YAxis
            stroke="#888"
            tick={{ fill: "#888" }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A202C",
              border: "1px solid #444",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#888" }}
          />
          <Line
            type="monotone"
            dataKey="yesPrice"
            stroke="#F56565"
            name="Yes"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="noPrice"
            stroke="#4299E1"
            name="No"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <Text color="gray.500" fontSize="sm" mt={2}>
        Source: Market data
      </Text>
    </Box>
  );
};

export default PriceHistoryChart;
