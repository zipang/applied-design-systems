import { Heading } from "@components/base/Heading";
import type * as React from "react";
import "./DemoSection.css";

interface DemoSectionProps {
	index: number;
	title: string;
	children: React.ReactNode;
}

/**
 * A numbered, titled section of the components demo.
 *
 * @param props The section props.
 * @returns The rendered section.
 */
export const DemoSection: React.FC<DemoSectionProps> = ({ index, title, children }) => (
	<section className="demo-section">
		<Heading level={2}>
			{index}. {title}
		</Heading>
		<div className="demo-section__content">{children}</div>
	</section>
);
