//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import "react-native"

declare module "react-native" {
	interface ViewStyle {
		$$css?: true;
		yoshiki?: string;
	}

	interface ImageStyle {
		$$css?: true;
		yoshiki?: string;
	}

	interface PressableStateCallbackType {
		readonly hovered: boolean;
		readonly focused: boolean;
	}
}
