//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { PixelRatio } from "react-native";

export const px = (value: number) => value;
export const percent = (value: number) => `${value}%`;
export const em = (value: number) => PixelRatio.getFontScale() * 16 * value;
export const rem = em;
