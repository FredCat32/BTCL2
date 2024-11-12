import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Alert,
  AlertIcon,
  Box,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

const LegalWarningModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  useEffect(() => {
    // Parse the string value from localStorage
    const acknowledged = localStorage.getItem("legalWarningAcknowledged");
    // Check if the value is explicitly 'true'
    if (acknowledged !== "true") {
      setIsOpen(true);
    } else {
      setHasAcknowledged(true);
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleAcknowledge = () => {
    localStorage.setItem("legalWarningAcknowledged", "true");
    setHasAcknowledged(true);
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  // Added a function to force show the modal
  const forceShow = () => {
    setIsOpen(true);
    setHasAcknowledged(false);
  };

  // Expose the forceShow method to the window object so we can call it from anywhere
  useEffect(() => {
    window.showLegalWarning = forceShow;
  }, []);

  if (hasAcknowledged && !isOpen) {
    return null;
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent bg="gray.900" color="white" p={6} mx={4}>
        <Alert status="warning" bg="orange.900" mb={4}>
          <AlertIcon />
          <Text fontWeight="semibold">Important Legal Notice</Text>
        </Alert>

        <ModalBody py={4}>
          <Text mb={4}>
            Please read this important notice about using our platform:
          </Text>
          <UnorderedList pl={6} mb={4} spacing={2}>
            <ListItem>
              This platform is not intended for use by residents or citizens of
              the United States or citizen/agents of Iran, Cuba, North Korea,
              Syria, Myanmar, Sudan, Liberia, Russia or the regions of Crimea,
              Donetsk or Luhansk and that you are not accessing the interface
              from within the United States or any of the mentioned countries
              and territories.
            </ListItem>
            <ListItem>
              Geographic IP restrictions will be implemented in the near future
            </ListItem>
            <ListItem>
              Users must comply with their local laws and regulations
            </ListItem>
            <ListItem>
              You must be of legal age in your jurisdiction to use this platform
            </ListItem>
          </UnorderedList>

          <Text mb={4} fontWeight="medium">
            By continuing, you confirm that:
          </Text>
          <UnorderedList pl={6} mb={4} spacing={2}>
            <ListItem>
              You are not prohibited by your local laws from using this service
            </ListItem>
            <ListItem>
              You understand that geographic restrictions are forthcoming
            </ListItem>
            <ListItem>
              You accept full responsibility for ensuring your compliance with
              applicable laws
            </ListItem>
          </UnorderedList>

          <Alert status="info" bg="blue.900" mt={4}>
            <AlertIcon />
            <Text fontSize="sm">
              Note: Geographic restrictions will be implemented soon. Users from
              restricted regions will be blocked from accessing the platform.
              You will not be able to access your bets if you place them from
              within the U.S. or other restricted areas.
            </Text>
          </Alert>
        </ModalBody>

        <ModalFooter gap={4} pt={6}>
          <Button
            onClick={handleDecline}
            bg="red.600"
            _hover={{ bg: "red.700" }}
            color="white"
          >
            Decline & Exit
          </Button>
          <Button
            onClick={handleAcknowledge}
            bg="blue.600"
            _hover={{ bg: "blue.700" }}
            color="white"
          >
            I Understand & Accept
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LegalWarningModal;
