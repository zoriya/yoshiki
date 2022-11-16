//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { useEffect } from "react";

let preventHover = false;
let hoverTimeout: NodeJS.Timeout;

export const useMobileHover = () => {
	useEffect(() => {
		const enableHover = () => {
			if (preventHover) return;
			document.body.classList.remove("noHover");
		};

		const disableHover = () => {
			if (hoverTimeout) clearTimeout(hoverTimeout);
			preventHover = true;
			hoverTimeout = setTimeout(() => (preventHover = false), 1000);
			document.body.classList.add("noHover");
		};

		document.addEventListener("touchstart", disableHover, true);
		document.addEventListener("mousemove", enableHover, true);
		return () => {
			document.removeEventListener("touchstart", disableHover);
			document.removeEventListener("mousemove", enableHover);
		};
	}, []);
};

export const Pressable = "div";
