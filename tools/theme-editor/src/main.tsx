import { AppStateProvider } from "@lib/app-state";
import { createRoot } from "react-dom/client";
import DEFAULT_TOKENS_CSS from "../design-tokens.css" with { type: "text" };
import { App } from "./App";
import "@styles/color-variants.css";
import "@styles/reset.css";
import "@styles/utilities.css";

// The tool's own Design System is injected at runtime from the real contract files,
// which are also the theme store's seed — a single source of truth.
const themeElt = document.createElement("style");
themeElt.textContent = DEFAULT_TOKENS_CSS;
document.head.prepend(themeElt);

const rootElt = document.getElementById("root");

if (rootElt) {
	createRoot(rootElt).render(
		<AppStateProvider>
			<App />
		</AppStateProvider>
	);
}
