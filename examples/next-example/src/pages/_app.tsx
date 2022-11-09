//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import type { AppProps } from "next/app";
import { useLayoutEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
	const [show, showApp] = useState(false);

	useLayoutEffect(() => showApp(true));
	return show ? <Component {...pageProps} /> : null;
}
