import type { BoxProperties, BoxTag } from "@components/base/Box";
import {
	BOX_BORDER_WIDTHS,
	BOX_COLORS,
	BOX_ELEVATIONS,
	BOX_ROUNDED,
	Box
} from "@components/base/Box";
import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import type * as React from "react";

/** One labelled example of a spacing aspect. */
interface SpacingSample {
	label: string;
	props: BoxProperties;
}

const SPACING_SAMPLES: SpacingSample[] = [
	{ label: "p=md", props: { p: "md" } },
	{ label: "px=xl", props: { px: "xl" } },
	{ label: "py=sm", props: { py: "sm" } },
	{ label: "m=sm", props: { m: "sm" } },
	{ label: "mx=lg", props: { mx: "lg" } },
	{ label: "my=xs", props: { my: "xs" } }
];

/**
 * Tags shown in the `as` demo. `main` is omitted: the page shell owns the only `main`
 * landmark, so the demo does not render a second one.
 */
const TAG_SAMPLES: BoxTag[] = [
	"div",
	"span",
	"section",
	"article",
	"aside",
	"header",
	"footer",
	"nav"
];

/**
 * The Box section: every background role, spacing prop, rounded value, border width and
 * color, elevation, and `as` tag, all driven by token props.
 *
 * @returns The rendered Box demo section.
 */
export const BoxDemo: React.FC = () => (
	<VStack gap="lg">
		<Heading level={3}>Background</Heading>
		<HStack gap="base" wrap align="start">
			{BOX_COLORS.map((role) => (
				<VStack key={role} gap="xs" align="center">
					<Box background={role} p="lg" rounded="sm" />
					<Text as="span" size="xs" tone="muted">
						{role}
					</Text>
				</VStack>
			))}
		</HStack>

		<Heading level={3}>Spacing</Heading>
		<HStack gap="base" wrap align="start">
			{SPACING_SAMPLES.map(({ label, props }) => (
				<Box key={label} background="surface-alt" rounded="sm" {...props}>
					<Text as="span" size="xs">
						{label}
					</Text>
				</Box>
			))}
		</HStack>

		<Heading level={3}>Rounded</Heading>
		<HStack gap="base" wrap align="start">
			{BOX_ROUNDED.map((value) => (
				<Box key={value} background="surface-alt" p="md" rounded={value}>
					<Text as="span" size="xs">
						{value}
					</Text>
				</Box>
			))}
		</HStack>

		<Heading level={3}>Border width</Heading>
		<HStack gap="base" wrap align="start">
			{BOX_BORDER_WIDTHS.map((value) => (
				<Box key={value} border={value} borderColor="brand-primary" p="md">
					<Text as="span" size="xs">
						{value}
					</Text>
				</Box>
			))}
		</HStack>

		<Heading level={3}>Border color</Heading>
		<HStack gap="base" wrap align="start">
			{BOX_COLORS.map((role) => (
				<Box key={role} border="sm" borderColor={role} p="md">
					<Text as="span" size="xs" tone="muted">
						{role}
					</Text>
				</Box>
			))}
		</HStack>

		<Heading level={3}>Elevation</Heading>
		<HStack gap="lg" wrap align="start">
			{BOX_ELEVATIONS.map((value) => (
				<Box key={value} background="surface-alt" elevation={value} p="md" rounded="sm">
					<Text as="span" size="xs">
						{value}
					</Text>
				</Box>
			))}
		</HStack>

		<Heading level={3}>As</Heading>
		<HStack gap="base" wrap align="start">
			{TAG_SAMPLES.map((tag) => (
				<Box key={tag} as={tag} background="surface-alt" p="sm" rounded="sm">
					<Text as="span" size="xs">
						{tag}
					</Text>
				</Box>
			))}
		</HStack>
		<Text size="sm" tone="muted">
			`main` is reserved for the page shell, so it is not rendered here.
		</Text>

		<Heading level={3}>Layout primitives</Heading>
		<HStack
			id="box-layout-demo"
			data-testid="box-layout"
			gap="md"
			background="surface-alt"
			border="sm"
			borderColor="brand-primary"
			p="md"
			rounded="sm"
		>
			<Box background="surface" p="sm" rounded="sm">
				<Text as="span" size="xs">
					Box
				</Text>
			</Box>
			<Box background="surface" p="sm" rounded="sm">
				<Text as="span" size="xs">
					Box
				</Text>
			</Box>
		</HStack>
	</VStack>
);
