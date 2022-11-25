//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { StatusBar } from "expo-status-bar";
import { Text, View, Pressable, TextProps } from "react-native";
import { registerRootComponent } from "expo";
import { Stylable, useYoshiki, px } from "yoshiki/native";
import { H1 } from "@expo/html-elements";

const CustomBox = ({ color, ...props }: { color: string } & Stylable) => {
	const { css } = useYoshiki();

	return (
		<View {...css({ bg: color, alignItems: "center" }, props)}>
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
					hover: { alignContent: "center", alignItems: "center" },
					press: { alignContent: "center" },
					focus: { alignContent: "center" },
				},
				props,
			)}
		>
			<H1
				{...css({
					color: { xs: "black", md: "white" },
				})}
			>
				Text inside the box without props (green on small screens, red on bigs)
			</H1>
		</Pressable>
	);
};

const P = (props: TextProps) => {
	const { css } = useYoshiki();
	return (
		<Text
			{...css(
				{
					fontFamily: "toto",
				},
				props
			)}
		/>
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
			<CustomBox color="black" {...css({ borderColor: "red", borderWidth: px(3) })} />
			<BoxWithoutProps {...css({ borderColor: "red", borderWidth: px(3) })} />
			<P
				accessibilityLabel="toto"
				style={[undefined, false, { color: "red" }, [{ color: "green" }, false]]}
			>
				Test
			</P>
			<StatusBar style="auto" />
		</View>
	);
}

export default registerRootComponent(App);
