import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Alert,
  AlertIcon,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

const LegalWarningModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  useEffect(() => {
    checkAcknowledgement();
  }, []);

  const checkAcknowledgement = () => {
    const acknowledged = localStorage.getItem("legalWarningAcknowledged");
    const acknowledgedTimestamp = localStorage.getItem("legalWarningTimestamp");

    console.log("Stored acknowledgement:", acknowledged); // Debug log
    console.log("Stored timestamp:", acknowledgedTimestamp); // Debug log

    // Check if either value is missing or acknowledgment is explicitly 'false'
    if (!acknowledged || acknowledged === "false" || !acknowledgedTimestamp) {
      console.log("No valid acknowledgement found, showing modal"); // Debug log
      setIsOpen(true);
      return;
    }

    // Check if 24 hours have passed
    const lastAcknowledged = parseInt(acknowledgedTimestamp);
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const hasExpired = Date.now() - lastAcknowledged > twentyFourHours;

    console.log(
      "Time since last acknowledgement:",
      Date.now() - lastAcknowledged
    ); // Debug log
    console.log("Has expired:", hasExpired); // Debug log

    if (hasExpired) {
      console.log("Acknowledgement has expired, showing modal"); // Debug log
      setIsOpen(true);
      setHasAcknowledged(false);
      // Clear expired acknowledgement
      localStorage.setItem("legalWarningAcknowledged", "false");
      localStorage.removeItem("legalWarningTimestamp");
    } else {
      console.log("Valid acknowledgement found, hiding modal"); // Debug log
      setHasAcknowledged(true);
      setIsOpen(false);
    }
  };

  const handleAcknowledge = () => {
    console.log("Acknowledging warning..."); // Debug log
    localStorage.setItem("legalWarningAcknowledged", "true");
    localStorage.setItem("legalWarningTimestamp", Date.now().toString());
    setHasAcknowledged(true);
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  // Force modal to show if not acknowledged
  if (!hasAcknowledged || isOpen) {
    return (
      <Modal
        isOpen={true}
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
                This platform is not intended for use by residents or citizens
                of the United States
              </ListItem>
              <ListItem>
                Geographic restrictions will be implemented in the near future
              </ListItem>
              <ListItem>
                Users must comply with their local laws and regulations
              </ListItem>
              <ListItem>
                You must be of legal age in your jurisdiction to use this
                platform
              </ListItem>
            </UnorderedList>

            <Text mb={4} fontWeight="medium">
              By continuing, you confirm that:
            </Text>
            <UnorderedList pl={6} mb={4} spacing={2}>
              <ListItem>
                You are not prohibited by your local laws from using this
                service
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
                Note: You will need to reconfirm this acknowledgment every 24
                hours. Geographic restrictions will be implemented soon.
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
  }

  return null;
};

export default LegalWarningModal;
