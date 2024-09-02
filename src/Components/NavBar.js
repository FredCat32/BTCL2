import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Flex, Link, Heading, Stack, Text } from "@chakra-ui/react";
import WalletConnection from "./WalletConnection";
import { useWallet } from "../WalletContext";

const ADMIN_ADDRESS = "ST1EJ799Q4EJ511FP9C7J71ESA4920QJV7D8YKK2C";

const Navbar = () => {
  const { userData } = useWallet();
  const userAddress = userData?.profile?.stxAddress?.testnet;
  const isAdmin = userAddress === ADMIN_ADDRESS;
  console.log(isAdmin);
  console.log(userAddress);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Create Market", path: "/create" },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin", path: "/admin/markets" });
  }

  return (
    <Box backdropFilter="blur(10px)" backgroundColor="rgba(0, 0, 0, 0.3)">
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
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Heading
            as="h1"
            size="lg"
            letterSpacing={"wider"}
            color="white"
            textShadow="0 0 10px rgba(255,255,255,0.5)"
          >
            Bitcoin Prediction
          </Heading>
        </Flex>
        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
          display={{ base: "flex", md: "flex" }}
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
