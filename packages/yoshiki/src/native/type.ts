//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { AtLeastOne, FilterOr, WithState, YoshikiStyle, Length } from "../type";
import { shorthandsFn } from "../shorthands";

export type EnhancedStyle<Properties> = {
	[key in keyof Properties]: YoshikiStyle<Properties[key]>;
} & {
	[key in keyof typeof shorthandsFn]?: FilterOr<
		Parameters<typeof shorthandsFn[key]>[0],
		Length,
		YoshikiStyle<number>
	>;
};
export type YsStyleProps<Style, State> = State extends AtLeastOne<WithState<Style>>
	? { style: (state: { pressed?: boolean; focused?: boolean; hovered?: boolean }) => Style }
	: { style: Style };
