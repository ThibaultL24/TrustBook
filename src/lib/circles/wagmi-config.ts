// src/lib/circles/wagmi-config.ts

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { CIRCLES_CHAIN, getCirclesRpcUrl } from "./chains";

export const wagmiConfig = createConfig({
  chains: [CIRCLES_CHAIN],
  connectors: [injected()],
  transports: {
    [CIRCLES_CHAIN.id]: http(getCirclesRpcUrl()),
  },
  ssr: true,
});
