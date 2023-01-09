//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { YoshikiStyle } from "./type";

export const shorthandsFn = {
	p: (v: YoshikiStyle<string | number>) => ({
		padding: v,
	}),
	pX: (v: YoshikiStyle<string | number>) => ({
		paddingLeft: v,
		paddingRight: v,
	}),
	paddingX: (v: YoshikiStyle<string | number>) => ({
		paddingLeft: v,
		paddingRight: v,
	}),
	pY: (v: YoshikiStyle<string | number>) => ({
		paddingTop: v,
		paddingBottom: v,
	}),
	paddingY: (v: YoshikiStyle<string | number>) => ({
		paddingTop: v,
		paddingBottom: v,
	}),
	m: (v: YoshikiStyle<string | number>) => ({
		margin: v,
	}),
	mX: (v: YoshikiStyle<string | number>) => ({
		marginLeft: v,
		marginRight: v,
	}),
	marginX: (v: YoshikiStyle<string | number>) => ({
		marginLeft: v,
		marginRight: v,
	}),
	mY: (v: YoshikiStyle<string | number>) => ({
		marginTop: v,
		marginBottom: v,
	}),
	marginY: (v: YoshikiStyle<string | number>) => ({
		marginTop: v,
		marginBottom: v,
	}),
	bg: (v: YoshikiStyle<string>) => ({
		backgroundColor: v,
	}),
};
