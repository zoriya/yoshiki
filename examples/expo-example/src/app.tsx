//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { registerRootComponent } from "expo";
import { Pressable, Stylable, useYoshiki } from "yoshiki/native";

const CustomBox = ({ color, ...props }: { color: string } & Stylable) => {
	const { css } = useYoshiki();

	return (
		<View {...css({ bg: color, p: "13px", alignItems: "center" }, props)}>
			<Text {...css({ color: "white" })}>Text inside the custom black box.</Text>
		</View>
	);
};

const BoxWithoutProps = (props: Stylable) => {
	const { css } = useYoshiki();

	return (
		<Pressable
			{...css(
				{
					backgroundColor: { xs: "#00ff00", md: "#ff0000" },
					hover: { alignContent: "center" },
					press: { alignContent: "center" },
					focus: { alignContent: "center" },
				},
				props,
			)}
		>
			<Text
				{...css(
					{
						backgroundColor: { xs: "#00ff00", md: "#ff0000" },
						hover: { alignContent: "center" },
					},
					props,
				)}
			>
				Text inside the box without props (green on small screens, red on bigs)
			</Text>
		</Pressable>
	);
};

function App() {
	const { css } = useYoshiki();

	return (
		<View
			{...css({
				flex: 1,
				backgroundColor: "#fff",
				alignItems: "center",
				justifyContent: "center",
			})}
		>
			<Text>Open up App.tsx to start working on your app!</Text>
			<CustomBox color="black" {...css({ borderColor: "red", borderWidth: 3 })} />
			<BoxWithoutProps {...css({ borderColor: "red", borderWidth: 3 })} />
			<StatusBar style="auto" />
		</View>
	);
}

export default registerRootComponent(App);
