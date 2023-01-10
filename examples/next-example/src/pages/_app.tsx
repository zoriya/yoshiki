//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { AppProps } from "next/app";
import { ReactNode, useMemo } from "react";
import {
	useYoshiki,
	createStyleRegistry,
	useMobileHover,
	StyleRegistryProvider,
	Theme,
	ThemeProvider,
	useAutomaticTheme,
} from "yoshiki";

declare module "yoshiki" {
	export interface Theme {
		spacing: string;
		name: string;
		background: string;
		light: { background: string; nested: { black: string } };
		dark: { background: string; nested: { black: string } };
	}
}

export const theme: Theme = {
	spacing: "24px",
	name: "yoshiki",
	background: "white",
	light: { background: "white", nested: { black: "black" } },
	dark: { background: "black", nested: { black: "red" } },
};

const AppName = () => {
	const { css, theme } = useYoshiki();
	return (
		<div {...css({ hover: { text: { color: "red" } } })}>
			<p {...css([{ padding: (theme) => theme.spacing }, "text"])}>{theme.name}</p>
		</div>
	);
};

const BrowserOnlyRegistry = ({ children }: { children: JSX.Element }) => {
	const registry = useMemo(() => createStyleRegistry(), []);
	if (typeof window === "undefined") return children;
	return <StyleRegistryProvider registry={registry}>{children}</StyleRegistryProvider>;
};

const App = ({ Component, pageProps }: AppProps) => {
	useMobileHover();
	const auto = useAutomaticTheme("theme", theme);

	return (
		<BrowserOnlyRegistry>
			<ThemeProvider theme={{ ...theme, ...auto }}>
				<Component {...pageProps} />
				<AppName />
			</ThemeProvider>
		</BrowserOnlyRegistry>
	);
};

export default App;
