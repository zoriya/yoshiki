//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Length } from "../type";

export const px = (value: number) => `${value}px` as unknown as Length;
export const percent = (value: number) => `${value}%` as unknown as Length;
export const em = (value: number) => `${value}em` as unknown as Length;
export const rem = (value: number) => `${value}rem` as unknown as Length;
