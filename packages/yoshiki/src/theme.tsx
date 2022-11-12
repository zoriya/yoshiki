//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { createContext, ReactNode, useContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Theme {}

export const breakpoints = {
	xs: 0,
	sm: 600,
	md: 900,
	lg: 1200,
	xl: 1600,
};

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ theme, children }: { theme: Theme; children?: ReactNode }) => {
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
