import "styles/globals.css";

import { ApolloProvider } from "@apollo/client";
import { DAppProvider } from "@usedapp/core";
import { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import React, { ReactElement } from "react";

import { DemoBanner } from "@/components/DemoBanner";
import { RegionsProvider } from "@/components/RegionsProvider";
import { SaleorProviderWithChannels } from "@/components/SaleorProviderWithChannels";
import { DEMO_MODE } from "@/lib/const";
import apolloClient from "@/lib/graphql";
import { CheckoutProvider } from "@/lib/providers/CheckoutProvider";

type AppPropsWithLayout = AppProps & {
  Component: any;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);

  return (
    <DAppProvider config={{}}>
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
    </DAppProvider>
  );
}

export default MyApp;
