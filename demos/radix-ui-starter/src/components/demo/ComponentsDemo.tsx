import { Heading } from "@components/base/Heading";
import { Icon } from "@components/base/Icon";
import { Text } from "@components/base/Text";
import { Container } from "@components/layout/Container";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Avatar } from "@components/ui/Avatar";
import type { ButtonSize, ButtonVariant } from "@components/ui/Button";
import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@components/ui/Dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@components/ui/DropdownMenu";
import { TextField } from "@components/ui/TextField";
import type * as React from "react";
import { useState } from "react";
import { BoxDemo } from "./BoxDemo";
import { DemoColorPalette } from "./DemoColorPalette";
import { DemoSection } from "./DemoSection";
import "./ComponentsDemo.css";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
const TEXT_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const BUTTON_VARIANTS: ButtonVariant[] = [
	"primary",
	"accent",
	"secondary",
	"ghost",
	"success",
	"warning",
	"danger",
	"info"
];
const BUTTON_SIZES: ButtonSize[] = ["sm", "default", "lg"];
const ICON_NAMES = ["add", "send"] as const;
const ICON_SIZES = ["sm", "md", "lg"] as const;
const noop = (): void => undefined;

/**
 * The components demo. Presents every part of the library in numbered sections so
 * agents and humans can see each variant and size in one place.
 *
 * @returns The rendered components gallery.
 */
export const ComponentsDemo: React.FC = () => {
	const [name, setName] = useState("");
	const [errorText, setErrorText] = useState("a value is required");

	return (
		<Container className="demo-components">
			<VStack gap="xl">
				<Heading level={1}>Components</Heading>

				<DemoSection index={1} title="Headings">
					<VStack gap="sm">
						{HEADING_LEVELS.map((level) => (
							<Heading key={level} level={level}>
								Heading level {level}
							</Heading>
						))}
						<Heading level={2} size="display">
							Level 2 · display size
						</Heading>
						<Heading level={2} size="md">
							Level 2 · md size
						</Heading>
					</VStack>
				</DemoSection>

				<DemoSection index={2} title="Text">
					<VStack gap="sm">
						{TEXT_SIZES.map((size) => (
							<Text key={size} size={size}>
								Text size {size}
							</Text>
						))}
					</VStack>
				</DemoSection>

				<DemoSection index={3} title="Color palette">
					<DemoColorPalette />
				</DemoSection>

				<DemoSection index={4} title="Box">
					<BoxDemo />
				</DemoSection>

				<DemoSection index={5} title="Buttons">
					<VStack gap="md">
						<HStack gap="sm" wrap>
							{BUTTON_VARIANTS.map((variant) => (
								<Button key={variant} label={variant} variant={variant} />
							))}
						</HStack>
						<HStack gap="sm" wrap>
							{BUTTON_SIZES.map((size) => (
								<Button key={size} label={size} size={size} />
							))}
						</HStack>
						<HStack gap="sm" wrap>
							<Button icon="send" label="Send" />
							<Button icon="add" ariaLabel="Add" />
							<Button label="Loading" loading />
							<Button label="Disabled" disabled />
						</HStack>
					</VStack>
				</DemoSection>

				<DemoSection index={6} title="Icons">
					<HStack gap="lg" wrap>
						{ICON_NAMES.map((name) =>
							ICON_SIZES.map((size) => (
								<Icon
									key={`${name}-${size}`}
									name={name}
									size={size}
									label={`${name} (${size})`}
								/>
							))
						)}
					</HStack>
				</DemoSection>

				<DemoSection index={7} title="Avatar">
					<HStack gap="lg" wrap>
						<Avatar fallback="SM" size="sm" shape="rounded" />
						<Avatar fallback="MD" size="md" shape="rounded" />
						<Avatar fallback="LG" size="lg" shape="rounded" />
						<Avatar fallback="SQ" size="md" shape="square" />
					</HStack>
				</DemoSection>

				<DemoSection index={8} title="Text field">
					<VStack gap="md">
						<TextField
							id="demo-name"
							label="Name"
							value={name}
							onChange={setName}
							placeholder="Type here"
						/>
						<TextField
							id="demo-invalid"
							label="Required"
							value={errorText}
							onChange={setErrorText}
							error="This field is required"
						/>
						<TextField
							id="demo-disabled"
							label="Disabled"
							value="read only"
							onChange={noop}
							disabled
						/>
					</VStack>
				</DemoSection>

				<DemoSection index={9} title="Dropdown menu">
					<DropdownMenu>
						<DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onSelect={() => setName("New conversation")}>
								New conversation
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setName("")}>Clear</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem disabled>Disabled item</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</DemoSection>

				<DemoSection index={10} title="Dialog">
					<Dialog>
						<DialogTrigger>Open dialog</DialogTrigger>
						<DialogContent
							title="Dialog title"
							description="A token-styled modal on any theme."
						>
							<HStack gap="sm" justify="end">
								<Button label="Cancel" variant="secondary" />
								<Button label="Confirm" variant="accent" />
							</HStack>
						</DialogContent>
					</Dialog>
				</DemoSection>
			</VStack>
		</Container>
	);
};
