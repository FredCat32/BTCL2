import React from "react";
import { Button } from "@chakra-ui/react";
import { useWallet } from "../WalletContext";

function WalletConnection() {
  const { userData, connectWallet, disconnectWallet } = useWallet();

  if (userData) {
    return (
      <Button onClick={disconnectWallet} colorScheme="red">
        Disconnect Wallet
      </Button>
    );
  }

  return (
    <Button onClick={connectWallet} colorScheme="teal">
      Connect Wallet
    </Button>
  );
}

export default WalletConnection;
