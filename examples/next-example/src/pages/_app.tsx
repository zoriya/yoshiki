//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Theme, ThemeProvider, useYoshiki } from "yoshiki";
import { AppProps } from "next/app";
import { useMobileHover } from "yoshiki";

declare module "yoshiki" {
	export interface Theme {
		spacing: string;
		name: string;
	}
}

export const theme: Theme = {
	spacing: "24px",
	name: "yoshiki",
};

const AppName = () => {
	const { css, theme } = useYoshiki();

	return <p {...css({ padding: (theme) => theme.spacing })}>{theme.name}</p>;
};

const App = ({ Component, pageProps }: AppProps) => {
	useMobileHover();

	return (
		<ThemeProvider theme={theme}>
			<Component {...pageProps} />
			<AppName />
		</ThemeProvider>
	);
};

export default App;
