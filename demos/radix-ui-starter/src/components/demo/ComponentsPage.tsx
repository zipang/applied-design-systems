import { PageBody } from "@components/layout/PageBody";
import type * as React from "react";
import { ComponentsDemo } from "./ComponentsDemo";

/**
 * The components page: the library gallery scrolls in the page body.
 *
 * @returns The rendered components page.
 */
export const ComponentsPage: React.FC = () => (
	<PageBody>
		<ComponentsDemo />
	</PageBody>
);
