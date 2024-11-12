import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Flex,
  Link,
  Heading,
  Stack,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Image,
  VStack,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import WalletConnection from "./WalletConnection";
import { useWallet } from "../WalletContext";

const ADMIN_ADDRESS = "SP1EJ799Q4EJ511FP9C7J71ESA4920QJV7CQHGA61";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userData } = useWallet();
  const userAddress = userData?.profile?.stxAddress?.mainnet;
  const isAdmin = userAddress === ADMIN_ADDRESS;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Stats", path: "/stats" },
    { name: "Leaderboard", path: "/Leaderboard" },
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
        {/* Hamburger Menu Button - Made Larger */}
        <IconButton
          icon={<HamburgerIcon boxSize={6} />}
          aria-label="Open Menu"
          onClick={onOpen}
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          mr={4}
          size="lg"
        />

        {/* Logo and Title */}
        <Flex align="center">
          <Image src="/logo.png" alt="Logo" h="80px" w="auto" mr={3} />
          <Heading
            as="h1"
            size="lg"
            letterSpacing={"wider"}
            color="white"
            textShadow="0 0 10px rgba(255,255,255,0.5)"
            mr={8}
          >
            Bitcoin Prediction
          </Heading>
        </Flex>

        {/* Desktop Navigation */}
        <Stack
          direction={"row"}
          spacing={6}
          align="center"
          flex={1}
          justify="flex-end"
          display={{ base: "none", md: "flex" }}
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

        {/* Mobile Navigation - Only show wallet connection in header */}
        <Box display={{ base: "flex", md: "none" }} flex={1} justify="flex-end">
          <WalletConnection />
        </Box>
      </Flex>

      {/* Slide-out Drawer - Made Wider with Larger Content */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg="gray.900" color="white" maxW="350px">
          <DrawerCloseButton size="lg" margin={4} />
          <DrawerHeader
            borderBottomWidth="1px"
            fontSize="2xl"
            py={8}
            textAlign="center"
          >
            Menu
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch" mt={8}>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  as={RouterLink}
                  to={item.path}
                  py={4}
                  px={6}
                  fontSize="xl"
                  fontWeight={600}
                  color="whiteAlpha.900"
                  onClick={onClose}
                  borderRadius="md"
                  _hover={{
                    textDecoration: "none",
                    color: "cyan.300",
                    textShadow: "0 0 8px cyan",
                    bg: "whiteAlpha.100",
                    transform: "translateX(10px)",
                    transition: "all 0.2s ease-in-out",
                  }}
                  transition="all 0.2s ease-in-out"
                >
                  {item.name}
                </Link>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
