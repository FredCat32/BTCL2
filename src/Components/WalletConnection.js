import React from "react";
import { Button } from "@chakra-ui/react";

function WalletConnection() {
  const handleConnect = () => {
    // TODO: Implement wallet connection logic
    console.log("Connecting wallet...");
  };

  return (
    <Button onClick={handleConnect} colorScheme="teal">
      Connect Wallet
    </Button>
  );
}

export default WalletConnection;
