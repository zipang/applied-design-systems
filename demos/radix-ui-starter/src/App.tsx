import { ChatPage } from "@components/chat/ChatPage";
import type { View } from "@components/demo/AppNav";
import { AppNav } from "@components/demo/AppNav";
import { ComponentsPage } from "@components/demo/ComponentsPage";
import { PageHeader } from "@components/layout/PageHeader";
import { PageLayout } from "@components/layout/PageLayout";
import { SiteNavigationHeader } from "@components/layout/SiteNavigationHeader";
import type * as React from "react";
import { useState } from "react";

/**
 * Application shell. Composes the page layout and the shared site navigation, and
 * switches between the chat and components pages.
 *
 * @returns The rendered application shell.
 */
export const App: React.FC = () => {
	const [view, setView] = useState<View>("chat");

	return (
		<PageLayout>
			<PageHeader>
				<SiteNavigationHeader>
					<AppNav view={view} onNavigate={setView} />
				</SiteNavigationHeader>
			</PageHeader>
			{view === "chat" ? <ChatPage /> : <ComponentsPage />}
		</PageLayout>
	);
};
