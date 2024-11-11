import React from "react";
import {
  Box,
  VStack,
  Heading,
  Link,
  Icon,
  Text,
  HStack,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FaTwitter, FaDiscord } from "react-icons/fa";

const SocialsPage = () => {
  return (
    <Box maxWidth="800px" margin="auto" p={6}>
      <VStack spacing={8} align="stretch">
        {/* Social Links Section */}
        <Card bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)">
          <CardBody>
            <VStack spacing={4}>
              <Heading color="white" size="lg">Connect With Us</Heading>
              <HStack spacing={6}>
                <Link 
                  href="https://twitter.com/Clever_Jeph" 
                  isExternal
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="all 0.2s"
                >
                  <VStack>
                    <Icon as={FaTwitter} w={10} h={10} color="twitter.500" />
                    <Text color="white">Follow on X</Text>
                  </VStack>
                </Link>
                <Link 
                  href="https://discord.gg/Ssc4FSRN" 
                  isExternal
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="all 0.2s"
                >
                  <VStack>
                    <Icon as={FaDiscord} w={10} h={10} color="purple.500" />
                    <Text color="white">Join Discord</Text>
                  </VStack>
                </Link>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Twitter Timeline Embed */}
        <Card bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading color="white" size="lg">Recent Updates</Heading>
              <Box borderRadius="12px" overflow="hidden">
                <iframe
                  src="https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk"
                  height="600"
                  width="100%"
                  frameBorder="0"
                  title="Twitter Timeline"
                  style={{
                    background: 'transparent',
                    borderRadius: '12px',
                  }}
                ></iframe>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default SocialsPage;
