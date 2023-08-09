//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const path = require("path");

/**
 * @type {import("next").NextConfig}
 */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	webpack: (config, options) => {
		if (options.isServer) {
			config.externals = ["react", ...config.externals];
		}

		config.resolve.alias["react"] = path.resolve(__dirname, ".", "node_modules", "react");
		return config;
	},
	transpilePackages: ["yoshiki"],
};

module.exports = nextConfig;
