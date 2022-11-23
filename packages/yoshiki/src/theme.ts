//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { createContext, useContext } from "react";
 
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Theme {}

export const breakpoints = {
	xs: 0,
	sm: 600,
	md: 900,
	lg: 1200,
	xl: 1600,
};

// A theme provider can't be created here since a Context's Provider is not callable and we want to
// support both react and react-native jsx modes. This is why the ThemeContext is exported.
export const ThemeContext = createContext<Theme>({});

export const useTheme = (): Theme => useContext(ThemeContext);

