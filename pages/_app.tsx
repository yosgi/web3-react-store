import "styles/globals.css";

import { ApolloProvider } from "@apollo/client";
import { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import React, { ReactElement,useMemo } from "react";

import { DemoBanner } from "@/components/DemoBanner";
import { RegionsProvider } from "@/components/RegionsProvider";
import { SaleorProviderWithChannels } from "@/components/SaleorProviderWithChannels";
import { DEMO_MODE } from "@/lib/const";
import apolloClient from "@/lib/graphql";
import { CheckoutProvider } from "@/lib/providers/CheckoutProvider";

import { useAccount } from "../hooks/useAccount";
import { useConnectWallet } from "../hooks/useConnectWallet";

type AppPropsWithLayout = AppProps & {
  Component: any;
};
interface Account {
  address: string;
  balance: string;
  connect: () => void;
};
export const UserContext = React.createContext<Account | null>(null);
function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);
  const { connected, connect } = useConnectWallet();
  const { account } = useAccount(connected);
  const value = useMemo(() => (
    {
      address: account?.address || "",
      balance: account?.balance || "0",
      connect
    }
  ), [account?.address, account?.balance, connect])
  return (
    <UserContext.Provider value={value}>
      <ApolloProvider client={apolloClient}>
        <CheckoutProvider>
          <RegionsProvider>
            <SaleorProviderWithChannels>
              <NextNProgress color="#5B68E4" options={{ showSpinner: false }} />
              {DEMO_MODE && <DemoBanner />}
              {getLayout(<Component {...pageProps} />)}
            </SaleorProviderWithChannels>
          </RegionsProvider>
        </CheckoutProvider>
      </ApolloProvider>
    </UserContext.Provider>
  );
}

export default MyApp;
