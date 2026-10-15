import { homedir } from "node:os";

/** Host filesystem facts the browser cannot read on its own. */
export interface SystemInfo {
	/** The server user's home directory; display helpers shorten paths against it. */
	home: string;
	/** The directory the server was started in, the picker's default root. */
	cwd: string;
}

/**
 * Read the host filesystem facts the theme editor displays. This is the server's job
 * because only the server can read the filesystem; the client fetches the result.
 *
 * @returns The host home directory and the server's working directory.
 */
export const readSystemInfo = (): SystemInfo => ({ home: homedir(), cwd: process.cwd() });
