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
        <Card bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)">
          <CardBody>
            <VStack spacing={4}>
              <Heading color="white" size="lg">
                Connect With Us
              </Heading>
              <HStack spacing={6}>
                <Link
                  href="https://twitter.com/StxBets"
                  isExternal
                  _hover={{ transform: "scale(1.1)" }}
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
                  _hover={{ transform: "scale(1.1)" }}
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

        <Card bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading color="white" size="lg">
                Recent Updates
              </Heading>
              <Box 
                borderRadius="12px" 
                overflow="auto" 
                maxHeight="600px"
                sx={{
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.4)',
                    },
                  },
                }}
              >
                <VStack spacing={4} p={2}>
                  <blockquote className="twitter-tweet" data-theme="dark">
                    <p lang="en" dir="ltr">
                      Calling all LPs in the <a href="https://twitter.com/Stacks?ref_src=twsrc%5Etfw">@Stacks</a> ecosystem.<br/><br/>
                      Earn yield on your idle <a href="https://twitter.com/search?q=%24stx&amp;src=ctag&amp;ref_src=twsrc%5Etfw">$stx</a> by providing liquidity on <a href="https://t.co/4sqJOnBVeD">https://t.co/4sqJOnBVeD</a><br/><br/>
                      2% on all trades
                    </p>&mdash; STXBets (@StxBets) <a href="https://twitter.com/StxBets/status/1856159771331535121?ref_src=twsrc%5Etfw">November 12, 2024</a>
                  </blockquote>

                  <blockquote className="twitter-tweet" data-theme="dark">
                    <p lang="en" dir="ltr">
                      New prediction market on <a href="https://t.co/52cgpLG3r9">https://t.co/52cgpLG3r9</a> <br/>Check it out 🔥 <a href="https://t.co/AMuDMrvDPD">https://t.co/AMuDMrvDPD</a>
                    </p>&mdash; $tobi (@tobi_chain) <a href="https://twitter.com/tobi_chain/status/1855723008654286894?ref_src=twsrc%5Etfw">November 10, 2024</a>
                  </blockquote>

                  <blockquote className="twitter-tweet" data-theme="dark">
                    <p lang="en" dir="ltr">
                      New Prediction Market on <a href="https://t.co/nzUgEt6JXa">https://t.co/nzUgEt6JXa</a><br/><br/>
                      Will FakeBird Complete Its Bonding Curve By 5PM EST November 12th?<a href="https://twitter.com/stxcity?ref_src=twsrc%5Etfw">@stxcity</a>
                    </p>&mdash; STXBets (@StxBets) <a href="https://twitter.com/StxBets/status/1855699085790982271?ref_src=twsrc%5Etfw">November 10, 2024</a>
                  </blockquote>

                  <blockquote className="twitter-tweet" data-theme="dark">
                    <p lang="en" dir="ltr">
                      Please join our discord btw for <a href="https://t.co/qa74HpsK54">https://t.co/qa74HpsK54</a><a href="https://t.co/MI9odeJiRV">https://t.co/MI9odeJiRV</a>
                    </p>&mdash; FredCat (@FredCat2024) <a href="https://twitter.com/FredCat2024/status/1844330574741397690?ref_src=twsrc%5Etfw">October 10, 2024</a>
                  </blockquote>

                  <blockquote className="twitter-tweet" data-theme="dark">
                    <p lang="en" dir="ltr">
                      Hey guys lets bet on Kain Warwick beating up the Bankless guy
                    </p>&mdash; STXBets (@StxBets) <a href="https://twitter.com/StxBets/status/1844685211109412906?ref_src=twsrc%5Etfw">October 11, 2024</a>
                  </blockquote>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default SocialsPage;
