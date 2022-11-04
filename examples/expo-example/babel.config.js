//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
	};
};
