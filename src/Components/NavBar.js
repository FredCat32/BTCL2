import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Flex, Link, Heading, Stack, Button } from "@chakra-ui/react";
import WalletConnection from "./WalletConnection";
import { useWallet } from "../WalletContext";

const ADMIN_ADDRESS = "SP1EJ799Q4EJ511FP9C7J71ESA4920QJV7CQHGA61";

const Navbar = () => {
  const { userData } = useWallet();
  const userAddress = userData?.profile?.stxAddress?.mainnet;
  const isAdmin = userAddress === ADMIN_ADDRESS;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Stats", path: "/stats" },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin", path: "/admin/markets" });
    navItems.push({ name: "Create Market", path: "/create" });
  }

  return (
    <Box bg="rgba(0,0,0,0.7)" backdropFilter="blur(10px)">
      <Flex
        color="white"
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor="whiteAlpha.200"
        align={"center"}
        maxWidth="container.xl"
        margin="0 auto"
      >
        <Heading
          as="h1"
          size="lg"
          letterSpacing={"wider"}
          color="white"
          textShadow="0 0 10px rgba(255,255,255,0.5)"
          mr={8} // Add margin to the right of the title
        >
          Bitcoin Prediction
        </Heading>
        <Stack
          direction={"row"}
          spacing={6}
          align="center"
          flex={1}
          justify="flex-end"
        >
          {navItems.map((item) => (
            <Link
              key={item.name}
              as={RouterLink}
              to={item.path}
              p={2}
              fontSize={"sm"}
              fontWeight={500}
              color="whiteAlpha.900"
              _hover={{
                textDecoration: "none",
                color: "cyan.300",
                textShadow: "0 0 8px cyan",
              }}
            >
              {item.name}
            </Link>
          ))}
          <WalletConnection />
        </Stack>
      </Flex>
    </Box>
  );
};

export default Navbar;
