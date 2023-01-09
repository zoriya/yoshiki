# Yoshiki

## Features

- Same interface for React, React Native and React Native Web
- Universal API working for builtins, any component library or your own
- Breakpoints as objects
- User defined theme support
- Shorthands (`m` for `margin`, `paddingX` for `paddingLeft` and `paddingRight`...)
- Atomic CSS generation
- Automatic vendor prefixing
- SSR support
- Automatic theme (light/dark)

## Installation

As any other npm package, simply run

`yarn add yoshiki`

or

`npm install --save yoshiki`

## Usage

```tsx
import { Stylable, useYoshiki } from "yoshiki";

const ColoredDiv = ({ color }: { color: string }) => {
	const { css } = useYoshiki();

	return (
		<div
			{...css({
				backgroundColor: color,
				height: { xs: "13%", lg: "25%" },
				paddingX: (theme) => theme.spaccing,
				m: 1,
			})}
		>
			<p {...css({ color: "white" })}>Text inside the colored div.</p>
		</div>
	);
};
```

Or for React Native components, simply use the `yoshiki/native` import.
Notice that the only difference between the two are the components and the import.

```tsx
import { Text, View } from "react-native";
import { Stylable, useYoshiki } from "yoshiki/native";

const ColoredBox = ({ color }: { color: string }) => {
	const { css } = useYoshiki();

	return (
		<View
			{...css({
				backgroundColor: color,
				height: { xs: "13%", lg: "25%" },
				paddingX: (theme) => theme.spaccing,
				m: 1,
			})}
		>
			<Text {...css({ color: "white" })}>Text inside the colored box.</Text>
		</View>
	);
};
```

You can also use multiple style objects to apply some conditions or a breakpoint to multiple styles at once:

```tsx
import { useState } from "react";
import { Text, View } from "react-native";
import { Stylable, useYoshiki, md } from "yoshiki/native";

const ColoredBox = ({ color }: { color: string }) => {
	const { css } = useYoshiki();
	const [state, setState] = useState(state);

	return (
		<View
			{...css([
				{
					backgroundColor: color,
					height: { xs: "13%", lg: "25%" },
				},
				state && {
					paddingX: (theme) => theme.spaccing,
					m: 1,
				},
				md({
					width: rem(3),
				}),
			])}
		>
			<Text {...css({ color: "white" })}>Text inside the colored box.</Text>
		</View>
	);
};
```

This syntax, as any others of Yoshiki works on both React and React Native.

## Recipes

### Customize your own components

In order to theme your own components, you need to forward some props to the root element like the following example:

```tsx
const Example = (props) => {
	return (
		<div {...props}>
			<p>Example component</p>
		</div>
	);
};
```

If you want to use yoshiki to theme your component and allow others components to override styles, pass
the props to the `css` function.

```tsx
import { useYoshiki } from "yoshiki/web";

const Example = (props) => {
	const { css } = useYoshiki();

	return (
		<div {...css({ background: "black" }, props)}>
			<p>Example component</p>
		</div>
	);
};
```

To stay type-safe and ensure you don't forget to pass down the props, yoshiki exposes the `Stylable` type, so you can do:

```tsx
import { ReactNode } from "react";
import { useYoshiki, Stylable } from "yoshiki/web";
// or
// import { useYoshiki, Stylable } from "yoshiki/native";

const Example = (props: Stylable) => {
	const { css } = useYoshiki();

	return (
		<div {...css({ background: "black" }, props)}>
			<ExampleText {...css({ padding: "15px" })}>Example component</ExampleText>
		</div>
	);
};

const ExampleText = ({ children, ...props }: { children: ReactNode } & Stylable) => {
	const { css } = useYoshiki();

	return <p {...css({ color: "white", padding: "10px" }, props)}>{children}</p>;
};
```

Yoshiki will handle overrides so the `ExampleText`'s p element will have a padding of `15px`.

### Server Side Rendering (SSR)

#### Generic

To support server side rendering, you need to create a style registry and wrap your app with a `StyleRegistryProvider`.

```tsx
import { StyleRegistryProvider, createStyleRegistry } from "yoshiki/web";

const registry = createStyleRegistry();

const html = renderToString(
	<StyleRegistryProvider registry={registry}>
		<App />
	</StyleRegistryProvider>,
);

// A list of classes to append to your html head.
const style = registry.flush();
```

#### Next

Starting Next 13, a new hook is available to do this easily. If you have not yet migrated to next 13, don't worry, there is another solution below.

Wrap your app with the following component:

```tsx
import { ReactNode, useMemo } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { createStyleRegistry, StyleRegistryProvider } from "yoshiki";

const RootRegistry = ({ children }: { children: ReactNode }) => {
	const registry = useMemo(() => createStyleRegistry(), []);

	useServerInsertedHTML(() => {
		return registry.flushToComponent();
	});

	return <StyleRegistryProvider registry={registry}>{children}</StyleRegistryProvider>;
};

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<RootRegistry>
			<Component {...pageProps} />
		</RootRegistry>
	);
};
```

#### Next < 13

Simply use the following `getInitialProps` inside the `pages/_document.tsx` file.

```tsx
import { StyleRegistryProvider, createStyleRegistry } from "yoshiki/web";
import Document, { DocumentContext } from "next/document";

Document.getInitialProps = async (ctx: DocumentContext) => {
	const renderPage = ctx.renderPage;
	const registry = createStyleRegistry();

	ctx.renderPage = () =>
		renderPage({
			enhanceApp: (App) => (props) => {
				return (
					<StyleRegistryProvider registry={registry}>
						<App {...props} />
					</StyleRegistryProvider>
				);
			},
		});

	const props = await ctx.defaultGetInitialProps(ctx);
	return {
		...props,
		styles: (
			<>
				{props.styles}
				{registry.flushToComponent()}
			</>
		),
	};
};

export default Document;
```

### Theme

To use the theme, you need to wrap your app with a `ThemeProvider`. If you are using typescript, you will also
need to use module augmentation to add your properties to the theme object.

```tsx
import { Theme, ThemeProvider, useYoshiki } from "yoshiki/web";

declare module "yoshiki" {
	export interface Theme {
		spacing: string;
		name: string;
	}
}

const defaultTheme: Theme = {
	spacing: "24px",
	name: "yoshiki",
};

const App = () => {
	return (
		<ThemeProvider theme={defaultTheme}>
			<AppName />
		</ThemeProvider>
	);
};

const AppName = () => {
	const { css, theme } = useYoshiki();

	return <p {...css({ padding: (theme) => theme.spacing })}>{theme.name}</p>;
};
```

### Automatic theme

If you have a light and dark theme, you may want to automatically switching between the two based on user preferences.
Yoshiki support this directly with the css property, you can use the `useAutomaticTheme` to get the automatic version
of a light/dark theme.

This approach works with SSR.

```tsx
import { useYoshiki, useAutomaticTheme } from "yohsiki/web";

const App = () => {
	const theme = {
		light: { background: "white", text: "black" },
		dark: { background: "black", text: "white" },
	};
	const auto = useAutomaticTheme("key", theme);
	const { css } = useYoshiki();

	return (
		<div {...css({ bg: auto.background })}>
			<p {...css({ textColor: auto.text })}>Automatic theme</p>
		</div>
	);
};
```

## API

### useYoshiki

The most used function will be `useYoshiki`:

```typescript
const { css, theme } = useYoshiki;
```

The `theme` variable is the one returned from `useTheme` and the css function has the following signature:

```typescript
css: (css: CssObject, leftovers: object) => Props;
```

The first parameter is a css object, in react web that means a dictionary of css key-values. On React Native that means
a `ViewStyle`, a `TextStyle` or an `ImageStyle`. Yoshiki will unsure type safety by returning the style object needed
for your arguments.

The css object can also take the keys `hover`, `focus` and `press`, and it will apply the style object given as a value
to the object only when it should.

The leftover parameter is here to allow your component to be customized by yoshiki. See [Customize your own components](#customize-your-own-components)
for more details.

### useTheme

```typescript
const theme = useTheme();
```

Simply return the theme object you defined with a Theme Provider see [Theme](#theme) for more details.
