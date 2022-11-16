//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { YoshikiStyle } from "../type";
import { Properties } from "csstype";

type YSPs = { [key in keyof Properties]: YoshikiStyle<Properties[key]> };

export const shorthandsFn = {
	p: (v: YSPs["padding"]): YSPs => ({
		padding: v,
	}),
	pX: (v: YSPs["paddingLeft"]): YSPs => ({
		paddingLeft: v,
		paddingRight: v,
	}),
	paddingX: (v: YSPs["paddingLeft"]): YSPs => ({
		paddingLeft: v,
		paddingRight: v,
	}),
	pY: (v: YSPs["paddingTop"]): YSPs => ({
		paddingTop: v,
		paddingBottom: v,
	}),
	paddingY: (v: YSPs["paddingTop"]): YSPs => ({
		paddingTop: v,
		paddingBottom: v,
	}),
	m: (v: YSPs["margin"]): YSPs => ({
		margin: v,
	}),
	mX: (v: YSPs["marginLeft"]): YSPs => ({
		marginLeft: v,
		marginRight: v,
	}),
	marginX: (v: YSPs["marginLeft"]): YSPs => ({
		marginLeft: v,
		marginRight: v,
	}),
	mY: (v: YSPs["marginTop"]): YSPs => ({
		marginTop: v,
		marginBottom: v,
	}),
	marginY: (v: YSPs["marginTop"]): YSPs => ({
		marginTop: v,
		marginBottom: v,
	}),
	// This can't be background because react native does not support it.
	bg: (v: YSPs["backgroundColor"]): YSPs => ({
		// We still remove the background in case it was set before.
		background: "unset",
		backgroundColor: v,
	}),
};