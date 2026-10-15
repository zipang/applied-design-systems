import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./Tabs.css";

/** One tab in a {@link Tabs} bar. */
export interface TabItem {
	key: string;
	label: string;
}

export interface TabsProps {
	tabs: TabItem[];
	active: string;
	onChange: (key: string) => void;
	className?: string;
}

/**
 * Token-styled tab bar. The active tab carries an underline.
 *
 * @param props The tabs, the active key, the change callback, and the optional class.
 * @returns The rendered element.
 */
export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, className }) => (
	<div className={clsx("ui-tabs", className)} role="tablist">
		{tabs.map((tab) => {
			const selected = active === tab.key;

			return (
				<button
					key={tab.key}
					type="button"
					role="tab"
					aria-selected={selected}
					className={clsx("ui-tabs__tab", { "is-active": selected })}
					onClick={() => onChange(tab.key)}
				>
					{tab.label}
					<span className="ui-tabs__underline" aria-hidden="true" />
				</button>
			);
		})}
	</div>
);
