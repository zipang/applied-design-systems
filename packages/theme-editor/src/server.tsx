#!/usr/bin/env bun
import index from "../index.html";
import { createDirectory, listDirectories } from "./lib/directories";
import { setHomeDirectory, shortenPath } from "./lib/paths";
import { readSystemInfo } from "./lib/system-info";
import { readTheme, saveTheme, ThemeApiError } from "./lib/theme-api";

const port = Number(process.env.PORT ?? 4444);

// Match the UI: shorten absolute paths in the console against the host home directory.
setHomeDirectory(readSystemInfo().home);

const json = (data: unknown, status = 200): Response =>
	new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

/** Timestamp prefix for console lines, in `HH:MM:SS` (UTC) form. */
const stamp = (): string => new Date().toISOString().slice(11, 19);

/** Log an informational or successful action, prefixed with an emoji. */
const log = (emoji: string, message: string): void => {
	console.log(`[${stamp()}] ${emoji} ${message}`);
};

/** Log a rejected or failed action, including the captured error message. */
const logError = (emoji: string, message: string): void => {
	console.error(`[${stamp()}] ${emoji} ${message}`);
};

const errorResponse = (error: unknown, action: string): Response => {
	const message = error instanceof Error ? error.message : "Unknown error";
	logError("❌", `${action} failed: ${message}`);

	if (error instanceof ThemeApiError) {
		return json({ message: error.message, issues: error.issues }, error.status);
	}

	return json({ message }, 500);
};

/**
 * Development and runtime server. Serves the HTML entrypoint and the theme API that
 * reads and writes a project's DESIGN.md and design-tokens.css.
 */
const server = Bun.serve({
	port,
	routes: {
		"/api/theme": {
			GET: async (request) => {
				const dir = new URL(request.url).searchParams.get("dir");

				if (!dir) {
					logError("🟠", "Load rejected: missing ?dir query parameter");

					return json({ message: "Missing ?dir query parameter" }, 400);
				}
				log("📂", `Loading theme from ${shortenPath(dir)}`);

				try {
					const theme = await readTheme(dir);
					const errors = theme.issues.filter((issue) => issue.level === "error").length;
					log(
						"✅",
						`Loaded theme from ${shortenPath(theme.dir)} — ${theme.issues.length} issue(s), ${errors} error(s)`
					);

					return json({
						dir: theme.dir,
						designMd: theme.designMd,
						tokensCss: theme.tokensCss,
						issues: theme.issues
					});
				} catch (error) {
					return errorResponse(error, `Load theme from ${shortenPath(dir)}`);
				}
			},
			POST: async (request) => {
				try {
					const body = (await request.json()) as {
						dir?: string;
						designMd?: string;
						tokensCss?: string;
					};

					if (!body.dir || body.designMd === undefined || body.tokensCss === undefined) {
						logError("🟠", "Save rejected: expected { dir, designMd, tokensCss }");

						return json({ message: "Expected { dir, designMd, tokensCss }" }, 400);
					}
					log("💾", `Saving theme to ${shortenPath(body.dir)}`);
					const issues = await saveTheme(body.dir, {
						designMd: body.designMd,
						tokensCss: body.tokensCss
					});
					const errors = issues.filter((issue) => issue.level === "error").length;
					log(
						"✅",
						`Saved theme to ${shortenPath(body.dir)} — ${issues.length} issue(s), ${errors} error(s)`
					);

					return json({ ok: true, issues });
				} catch (error) {
					return errorResponse(error, "Save theme");
				}
			}
		},
		"/api/system": {
			GET: () => json(readSystemInfo())
		},
		"/api/dirs": {
			GET: async (request) => {
				const path = new URL(request.url).searchParams.get("path") ?? undefined;
				log("📁", `Listing directories in ${shortenPath(path ?? process.cwd())}`);

				try {
					const listing = await listDirectories(path);

					return json(listing);
				} catch (error) {
					return errorResponse(
						error,
						`List directories in ${shortenPath(path ?? process.cwd())}`
					);
				}
			},
			POST: async (request) => {
				try {
					const body = (await request.json()) as { path?: string; name?: string };

					if (!body.path || !body.name) {
						logError("🟠", "Create rejected: expected { path, name }");

						return json({ message: "Expected { path, name }" }, 400);
					}
					log("📁", `Creating folder "${body.name}" in ${shortenPath(body.path)}`);
					const path = await createDirectory(body.path, body.name);
					log("✅", `Created folder ${shortenPath(path)}`);

					return json({ path });
				} catch (error) {
					return errorResponse(error, "Create folder");
				}
			}
		},
		"/*": index
	}
});

const banner = `
 ██████╗ ██████╗ ███████╗   ████████╗██╗  ██╗██████╗ ███╗   ███╗███████╗   ███████╗██████╗ ██╗████████╗ ██████╗ ██████╗
██╔═══██╗██╔══██╗██╔════╝   ╚══██╔══╝██║  ██║╚════██╗████╗ ████║██╔════╝   ██╔════╝██╔══██╗██║╚══██╔══╝██╔═══██╗██╔══██╗
██║██╗██║██║  ██║███████╗      ██║   ███████║ █████╔╝██╔████╔██║█████╗     █████╗  ██║  ██║██║   ██║   ██║   ██║██████╔╝
██║██║██║██║  ██║╚════██║      ██║   ██╔══██║ ╚═══██╗██║╚██╔╝██║██╔══╝     ██╔══╝  ██║  ██║██║   ██║   ██║   ██║██╔══██╗
╚██████╔╝██████╔╝███████║      ██║   ██║  ██║██████╔╝██║ ╚═╝ ██║███████╗   ███████╗██████╔╝██║   ██║   ╚██████╔╝██║  ██║
 ╚═════╝ ╚═════╝ ╚══════╝      ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚══════╝   ╚══════╝╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
`;

console.log(banner);
log("🎨", `Theme editor running at ${server.url}`);
log("🧭", "Load a project directory to edit its DESIGN.md and design-tokens.css.");
log("🛑", "Press Ctrl+C to stop.");
