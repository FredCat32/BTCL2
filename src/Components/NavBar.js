import React from "react";
import {
  Box,
  Flex,
  Link,
  Heading,
  IconButton,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();

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
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
            color="white"
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Heading
            as="h1"
            size="lg"
            letterSpacing={"wider"}
            color="white"
            textShadow="0 0 10px rgba(255,255,255,0.5)"
          >
            Interstellar Swap
          </Heading>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
          display={{ base: isOpen ? "flex" : "none", md: "flex" }}
        >
          {["Home", "About", "Services", "Contact"].map((item) => (
            <Link
              key={item}
              p={2}
              href={"#"}
              fontSize={"sm"}
              fontWeight={500}
              color="whiteAlpha.900"
              _hover={{
                textDecoration: "none",
                color: "cyan.300",
                textShadow: "0 0 8px cyan",
              }}
            >
              {item}
            </Link>
          ))}
        </Stack>
      </Flex>
    </Box>
  );
};

export default Navbar;
