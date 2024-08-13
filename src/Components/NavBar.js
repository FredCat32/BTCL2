import React from "react";
import {
  Box,
  Flex,
  Link,
  Heading,
  useColorModeValue,
  IconButton,
  Stack,
  useTheme,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

const Navbar = () => {
  const theme = useTheme(); // Access the theme to use theme values programmatically

  const [isOpen, setIsOpen] = React.useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const bgColor = useColorModeValue(theme.colors.brand.pink);
  const textColor = useColorModeValue(
    theme.colors.brand.lightblue,
    theme.colors.green
  );

  return (
    <div>
      <Box bg={bgColor} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={toggle}
          />
          <Heading as="h1" size="lg" letterSpacing={"tighter"}>
            BTC L-2
          </Heading>
          <Flex alignItems={"center"}>
            <Stack
              direction={"row"}
              spacing={7}
              display={{ base: isOpen ? "flex" : "none", md: "flex" }}
            >
              <Link
                px={2}
                py={1}
                rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  bg: useColorModeValue("gray.200", "gray.700"),
                }}
                href={"#"}
              >
                Home
              </Link>
              <Link
                px={2}
                py={1}
                rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  bg: useColorModeValue("gray.200", "gray.700"),
                }}
                href={"#"}
              >
                About
              </Link>
              <Link
                px={2}
                py={1}
                rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  bg: useColorModeValue("gray.200", "gray.700"),
                }}
                href={"#"}
              >
                Services
              </Link>
              <Link
                px={2}
                py={1}
                rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  bg: useColorModeValue("gray.200", "gray.700"),
                }}
                href={"#"}
              >
                Contact
              </Link>
            </Stack>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              <Link href={"#"}>Home</Link>
              <Link href={"#"}>Layers</Link>
              <Link href={"#"}>Forum</Link>
              <Link href={"#"}>Contact</Link>
            </Stack>
          </Box>
        ) : null}
      </Box>
      <Box width="100%" height="5vh" bg={bgColor} px={4} color={textColor}>
        Your Home For BTC L-2 Analytics
      </Box>
    </div>
  );
};

export default Navbar;
