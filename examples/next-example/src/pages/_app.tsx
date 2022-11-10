//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { StyleRegistryProvider } from "@yoshiki/react/src/registry";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<StyleRegistryProvider>
			<Component {...pageProps} />
		</StyleRegistryProvider>
	);
};

export default App;
