# Yoshiki

## Features

- Same interface for React and React Native
- Universal API working for builtins, any component library or your own
- Breakpoints as objects
- User defined theme support
- Shorthands (`m` for `margin`, `paddingX` for `paddingLeft` and `paddingRight`...)
- Atomic CSS generation
- SSR support

## Usage

```tsx
import { Stylable, useYoshiki } from "yoshiki/web";

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

### Native independence

You can create the same page layout for React and React Native but use native features of both. For that,
include `yoshiki` instead of `yoshiki/native` or `yoshiki/web`. It will allow you to use the css function
with only css styles available in both React and React Native.
To support units in spacing or lengths, you can use the units functions:

```tsx
import { useYoshiki, px, percent, em } from "yoshiki";
import { Div, P, Span } from "my-super-component-lib";

const App = () => {
	const { css } = useYoshiki();

	return (
		<Div
			{...css({
				backgroundColor: "white",
				p: px(12),
				margin: em(2),
				height: percent(50);
			})}
		>
			<P>
				Hello from <Span {...css({ color: "red" })}>Yoshiki</Span>
			</P>
		</Div>
	);
};
```

This will use the native version on React Native and the web version on React for web, so you can have all the benefits
of each environment without its limitations. The downside is that your components need to pass stylables props to the
DOM (so `className` and `style` on the web and `style` on React Native). React Native Web does not allow one to use the `className`,
so it won't work with it. Yoshiki exposes the `splitRender` function to easily create components that will support this:

```tsx
import { splitRender } from "yoshiki";
import { Text } from "react-native";
import { ReactNode } from "react";

export const P = splitRender<HTMLParagraphElement, Text, { children: ReactNode }>(
	function _PWeb(props, ref) {
		return <div ref={ref} {...props}></div>;
	},
	function _PNat(props, ref) {
		return <Text ref={ref} {...props}></View>;
	},
);

```
