"use client";

import * as React from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { arbitrum, goerli, mainnet, optimism, polygon, zora } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
	[mainnet, polygon, optimism, arbitrum, zora, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : [])],
	[publicProvider()]
);

const wagmiConfig = createConfig({
	autoConnect: true,
	publicClient,
	webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	return <WagmiConfig config={wagmiConfig}>{mounted && children}</WagmiConfig>;
}
