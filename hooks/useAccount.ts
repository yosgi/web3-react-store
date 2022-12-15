import "../additional.d.ts"

import { ethers } from "ethers";
import React from "react";


export interface UseAccount {
  account: Account | null;
  checkAccount: () => void;
}

export const useAccount = (
  connected: boolean,
): UseAccount => {
 
  const [account, setAccount] = React.useState<Account | null>(null);
  
  const getAddress = async () => {
    
    const provider = new ethers.providers.Web3Provider(window.ethereum, {
        name: "MetaMask",
        chainId: 513100,
      });
    const signer = provider.getSigner();
    const accounts = await signer.getAddress();
    return accounts;
  };

  const getAccounBalance = async (address: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, {
        name: "MetaMask",
        chainId: 513100,
      });
    const res =  await provider.getBalance(address);
    return res
  };

  const checkAccount = React.useCallback(async () => {
    if (!connected) {
      setAccount(null);
      return;
    }
    const address = await getAddress();
    const balance = await getAccounBalance(address);
    setAccount({ address, balance });
  }, [connected]);

  React.useEffect(() => {
    checkAccount();
  }, [connected, checkAccount]);

  return { account, checkAccount };
};