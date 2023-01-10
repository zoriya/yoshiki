//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { StatusBar } from "expo-status-bar";
import { Text, View, Pressable, TextProps, Image } from "react-native";
import { registerRootComponent } from "expo";
import { Stylable, useYoshiki, px, md } from "yoshiki/native";
import { H1 } from "@expo/html-elements";
import { ImageProps } from "react-native";

const CustomBox = ({ color, ...props }: { color: string } & Stylable) => {
	const { css } = useYoshiki();

	return (
		<View {...css({ bg: color, alignItems: "center" }, props)}>
			<Text {...css({ color: "white", fontWeight: (theme) => "900" })}>
				Text inside the custom black box.
			</Text>
		</View>
	);
};

const BoxWithoutProps = (props: Stylable) => {
	const { css } = useYoshiki();

	return (
		<Pressable
			{...css(
				[
					{
						backgroundColor: { xs: "#00ff00", md: "#ff0000" },
						transform: [{ scaleY: 0.7 }],
						press: {
							self: {
								bg: "red",
							},
							text: {
								color: "white",
							},
						},
						hover: {
							text: {
								color: "blue",
							},
						},
						focus: {
							self: {
								bg: "yellow",
							},
							text: {
								transform: [{ scale: 2 }],
								color: "green",
							},
						},
					},
					md({
						shadowOpacity: 0.5,
						shadowRadius: 2,
						shadowOffset: { width: 3, height: 3 },
					}),
				],
				props,
			)}
		>
			<H1
				{...css([
					{
						color: { xs: "black", md: "white" },
					},
					"text",
				])}
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
				md({
					fontFamily: "toto",
				}),
				props,
			)}
		/>
	);
};

function App() {
	const { css } = useYoshiki();
	const test: ImageProps = {};

	return (
		<View
			{...css({
				flex: 1,
				backgroundColor: "#fff",
				alignItems: "center",
				justifyContent: "center",
				elevation: 6,
			})}
		>
			<Text>Open up App.tsx to start working on your app!</Text>
			<CustomBox color="black" {...css({ borderColor: "red", borderWidth: px(3) })} />
			<BoxWithoutProps {...css({ borderColor: "red", borderWidth: px(3) })} />
			<Pressable android_ripple={{ color: "black" }}>
				<P
					accessibilityLabel="toto"
					{...css([undefined, false, { color: "red" }, [{ color: "green" }, false]])}
				>
					Test
				</P>
				<Image {...css({ width: px(100) }, test)} />
				<Image {...css({ width: px(100), resizeMode: "cover" })} />
			</Pressable>
			<StatusBar style="auto" />
		</View>
	);
}

export default registerRootComponent(App);
