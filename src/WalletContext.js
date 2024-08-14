import React, { createContext, useState, useContext, useCallback } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const appConfig = new AppConfig(["store_write", "publish_data"]);
  const userSession = new UserSession({ appConfig });

  const connectWallet = useCallback(() => {
    showConnect({
      appDetails: {
        name: "Interstellar Swap",
        icon: window.location.origin + "/logo.png",
      },
      redirectTo: "/",
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
    });
  }, [userSession]);

  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setUserData(null);
  }, [userSession]);

  return (
    <WalletContext.Provider
      value={{ userData, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
