import { Container } from "@components/layout/Container";
import { HStack } from "@components/layout/HStack";
import { Button } from "@components/ui/Button";
import { ThemeSwitcher } from "@components/ui/ThemeSwitcher";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./AppNav.css";

/** The pages the app can show. */
export type View = "chat" | "components";

interface AppNavProps {
	view: View;
	onNavigate: (view: View) => void;
	className?: string;
}

/**
 * The site navigation shared by every page: a switch between the demo pages and the
 * theme picker. Rendered inside a `SiteNavigationHeader`, so it collapses with the
 * scroll.
 *
 * @param props The navigation props.
 * @returns The rendered navigation.
 */
export const AppNav: React.FC<AppNavProps> = ({ view, onNavigate, className }) => (
	<Container as="nav" width="lg" className={clsx("demo-app-nav", className)}>
		<HStack gap="sm">
			<Button
				label="Chat"
				size="sm"
				variant={view === "chat" ? "primary" : "ghost"}
				onClick={() => onNavigate("chat")}
			/>
			<Button
				label="Components"
				size="sm"
				variant={view === "components" ? "primary" : "ghost"}
				onClick={() => onNavigate("components")}
			/>
		</HStack>
		<ThemeSwitcher />
	</Container>
);
