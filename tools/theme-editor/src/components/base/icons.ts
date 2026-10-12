import addIcon from "@assets/icons/add.svg" with { type: "text" };
import checkIcon from "@assets/icons/check.svg" with { type: "text" };
import chevronDownIcon from "@assets/icons/chevron-down.svg" with { type: "text" };
import crossIcon from "@assets/icons/cross.svg" with { type: "text" };
import ellipsisIcon from "@assets/icons/ellipsis.svg" with { type: "text" };
import fileIcon from "@assets/icons/file.svg" with { type: "text" };
import folderIcon from "@assets/icons/folder.svg" with { type: "text" };
import resetIcon from "@assets/icons/reset.svg" with { type: "text" };
import sendIcon from "@assets/icons/send.svg" with { type: "text" };

/**
 * Inline SVG markup, keyed by icon name. The SVGs are imported as text so the Icon
 * component can render them inline and let `currentColor` style their strokes.
 */
export const icons = {
	add: addIcon,
	check: checkIcon,
	"chevron-down": chevronDownIcon,
	cross: crossIcon,
	ellipsis: ellipsisIcon,
	file: fileIcon,
	folder: folderIcon,
	reset: resetIcon,
	send: sendIcon
} as const;
