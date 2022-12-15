import "../additional.d.ts";

import { ethers } from "ethers";
import React from "react";

export interface UseConnectWallet {
  connected: boolean;
  chainConnected:boolean;
  connect: () => void;
}

export const useConnectWallet = (): UseConnectWallet => {
  const [connected, setConnected] = React.useState<boolean>(false);
  const [chainConnected,setChainConnected] = React.useState<boolean>(false);
 
  const checkAccountConnected = (accounts: string[]) => {
    if (!accounts.length) {
      setConnected(false);
    } else {
      setConnected(true);
    }
  };
  const checkChainConnected = (chainId: string) => {
    if (chainId === "513100") {
      setChainConnected(true);
    } else {
      setChainConnected(false);
    }
  }

  const connect = React.useCallback(async () => {
    const handleConnect = async() => {
      setConnected(true);
      const  currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      setChainConnected(currentChainId === "513100");
      if (window.ethereum) {
        window.ethereum.on("chainChanged",checkChainConnected)
        window.ethereum.on("accountsChanged",checkAccountConnected)
      }
    };

    const handleError = (error:Error) => {
    console.error(error)
      setConnected(false);
    };

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, {
        name: "MetaMask",
        chainId: 513100,
      });
      // Prompt user for account connections
      await provider.send("eth_requestAccounts", []);
      await provider.getSigner();
    
    //   console.log("Account:", await signer.getAddress());
      handleConnect()
    } catch (error) {
      handleError(error as Error)
    }
  
  }, []);
  React.useEffect(() => {
    connect();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", checkAccountConnected);
        window.ethereum.removeListener("chainChanged", checkChainConnected);
      }
    };
  }, [connect]);


  return { connected, connect,chainConnected };
};