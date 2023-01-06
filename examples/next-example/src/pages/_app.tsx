//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Theme, ThemeProvider, useAutomaticTheme } from "yoshiki";
import { useYoshiki, useMobileHover } from "yoshiki/web";
import { AppProps } from "next/app";

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
	return <p {...css({ padding: (theme) => theme.spacing })}>{theme.name}</p>;
};

const App = ({ Component, pageProps }: AppProps) => {
	useMobileHover();
	const auto = useAutomaticTheme(theme);

	return (
		<ThemeProvider theme={{ ...theme, ...auto }}>
			<Component {...pageProps} />
			<AppName />
		</ThemeProvider>
	);
};

export default App;
