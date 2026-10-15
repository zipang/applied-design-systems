/**
 * A compact ELIZA-style conversational engine. It adapts the pattern-matching idea of
 * Joseph Weizenbaum's ELIZA (MIT, 1966): a keyword triggers a rule, the captured phrase
 * is reflected back, and repeated patterns fall through to generic prompts. It is a
 * faithful-in-spirit demo, not a port of the original DOCTOR script.
 */

const REFLECTIONS: Record<string, string> = {
	am: "are",
	are: "am",
	i: "you",
	"i'm": "you are",
	"i've": "you have",
	"i'll": "you will",
	me: "you",
	my: "your",
	mine: "yours",
	myself: "yourself",
	you: "I",
	"you're": "I am",
	"you've": "I have",
	"you'll": "I will",
	your: "my",
	yours: "mine",
	yourself: "myself",
	was: "were",
	were: "was"
};

interface ElizaRule {
	pattern: RegExp;
	responses: string[];
	/** Store the captured phrase in memory (used by the "my ..." rule). */
	memory?: boolean;
	/** End the conversation when this rule matches (used by the goodbye rule). */
	ends?: boolean;
}

const RULES: ElizaRule[] = [
	{
		pattern: /\bi(?:'m| am| feel) (.+)/i,
		responses: ["How long have you felt {1}?", "Why do you feel {1}?"]
	},
	{
		pattern: /\bmy (.+)/i,
		responses: ["Tell me more about your {1}.", "Why do you mention your {1}?"],
		memory: true
	},
	{
		pattern: /\bi (?:need|want|wish) (.+)/i,
		responses: ["Why do you need {1}?", "What would it mean to you to get {1}?"]
	},
	{
		pattern: /\byou are (.+)/i,
		responses: ["What makes you think I am {1}?", "Does it please you to think I am {1}?"]
	},
	{
		pattern: /\bi (?:cannot|can't) (.+)/i,
		responses: ["How do you know you cannot {1}?"]
	},
	{
		pattern: /\b(?:hello|hi|hey)\b/i,
		responses: ["Hello. What is on your mind today?", "Hi. How are you feeling?"]
	},
	{
		pattern: /\b(?:bye|goodbye|exit|quit)\b/i,
		responses: ["Goodbye. Thank you for talking with me."],
		ends: true
	}
];

const DEFAULT_RESPONSES = [
	"Please, go on.",
	"I see. Tell me more.",
	"What does that suggest to you?",
	"Can you elaborate on that?"
];

const OPENING = "Good afternoon. I am Eliza. What would you like to discuss?";

/**
 * Reflect a captured phrase so the answer addresses the speaker.
 *
 * @param phrase The captured phrase.
 * @returns The reflected phrase.
 */
export const reflect = (phrase: string): string =>
	phrase
		.trim()
		.toLowerCase()
		.split(/\s+/)
		.map((word) => REFLECTIONS[word] ?? word)
		.join(" ");

/** The conversational engine surface used by the chat UI. */
export interface Eliza {
	readonly opening: string;
	reply: (input: string) => string;
	isFinished: () => boolean;
	reset: () => void;
}

/**
 * Create a fresh ELIZA engine. Responses cycle deterministically, so a fresh engine
 * always answers the same way to the same input.
 *
 * @returns A fresh ELIZA engine.
 */
export const createEliza = (): Eliza => {
	let turn = 0;
	let memory: string | null = null;
	let finished = false;

	const reply = (input: string): string => {
		const text = input.trim();

		for (const rule of RULES) {
			const match = text.match(rule.pattern);

			if (!match) {
				continue;
			}

			const captured = reflect(match[1] ?? "");
			const response = (rule.responses[turn % rule.responses.length] ?? "").replaceAll(
				"{1}",
				captured
			);

			if (rule.memory) {
				memory = `your ${captured}`;
			}

			if (rule.ends) {
				finished = true;
			}

			turn += 1;

			return response;
		}

		const fallback = memory
			? `Earlier you mentioned ${memory}. Tell me more about that.`
			: (DEFAULT_RESPONSES[turn % DEFAULT_RESPONSES.length] ?? "Please, go on.");

		turn += 1;

		return fallback;
	};

	const reset = (): void => {
		turn = 0;
		memory = null;
		finished = false;
	};

	return { opening: OPENING, reply, isFinished: () => finished, reset };
};
