//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { StyleRegistryProvider, createStyleRegistry } from "yoshiki/web";
import Document, { DocumentContext } from "next/document";

Document.getInitialProps = async (ctx: DocumentContext) => {
	const renderPage = ctx.renderPage;
	const registry = createStyleRegistry();

	ctx.renderPage = () =>
		renderPage({
			enhanceApp: (App) => (props) => {
				return (
					<StyleRegistryProvider registry={registry}>
						<App {...props} />
					</StyleRegistryProvider>
				);
			},
		});

	const props = await ctx.defaultGetInitialProps(ctx);
	return {
		...props,
		styles: (
			<>
				{props.styles}
				{registry.flushToComponent()}
			</>
		),
	};
};

export default Document;
