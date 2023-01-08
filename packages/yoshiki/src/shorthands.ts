//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

export const shorthandsFn = {
	p: (v: string | number) => ({
		padding: v,
	}),
	pX: (v: string | number) => ({
		paddingLeft: v,
		paddingRight: v,
	}),
	paddingX: (v: string | number) => ({
		paddingLeft: v,
		paddingRight: v,
	}),
	pY: (v: string | number) => ({
		paddingTop: v,
		paddingBottom: v,
	}),
	paddingY: (v: string | number) => ({
		paddingTop: v,
		paddingBottom: v,
	}),
	m: (v: string | number) => ({
		margin: v,
	}),
	mX: (v: string | number) => ({
		marginLeft: v,
		marginRight: v,
	}),
	marginX: (v: string | number) => ({
		marginLeft: v,
		marginRight: v,
	}),
	mY: (v: string | number) => ({
		marginTop: v,
		marginBottom: v,
	}),
	marginY: (v: string | number) => ({
		marginTop: v,
		marginBottom: v,
	}),
	bg: (v: string) => ({
		backgroundColor: v,
	}),
};
