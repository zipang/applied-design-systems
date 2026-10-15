import { Icon } from "@components/base/Icon";
import { clsx } from "@lib/clsx";
import { useTheme } from "@lib/theme/ThemeProvider";
import type * as React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from "./DropdownMenu";
import "./ThemeSwitcher.css";

interface ThemeSwitcherProps {
	className?: string;
}

/**
 * Dropdown that selects the active theme from the registry, marking the active one.
 *
 * @param props The theme switcher props.
 * @returns The rendered theme switcher.
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
	const { theme, available, setTheme } = useTheme();
	const active = available.find((item) => item.id === theme);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className={clsx("ui-theme-switcher", className)}>
				{active?.label ?? theme}
				<Icon name="chevron-down" size="sm" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Choose a theme</DropdownMenuLabel>
				{available.map((item) => (
					<DropdownMenuItem key={item.id} onSelect={() => setTheme(item.id)}>
						<span className="ui-theme-switcher__item">
							<span>{item.label}</span>
							{theme === item.id ? <Icon name="check" size="sm" /> : null}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
