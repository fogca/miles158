// Aether weight axis definitions (Variable Font wght axis values)
// Note: spec v1 §2.1 uses "axis value" distinct from OS/2 wght value
export interface WeightDef {
	id: number;
	name: string;
	axisValue: number;
}

export const WEIGHTS: WeightDef[] = [
	{ id: 10, name: 'Hairline', axisValue: 50 },
	{ id: 20, name: 'Thin', axisValue: 150 },
	{ id: 30, name: 'ExtraLight', axisValue: 250 },
	{ id: 40, name: 'Light', axisValue: 350 },
	{ id: 50, name: 'Book', axisValue: 400 },
	{ id: 55, name: 'Regular', axisValue: 450 },
	{ id: 60, name: 'Regular 2', axisValue: 500 },
	{ id: 70, name: 'Medium', axisValue: 550 },
	{ id: 80, name: 'Semi-Bold', axisValue: 650 },
	{ id: 90, name: 'Bold', axisValue: 750 },
	{ id: 100, name: 'Black', axisValue: 850 },
	{ id: 110, name: 'Ultra', axisValue: 950 }
];

// Default tester text — bridges Aether (medium) and Steiner's anthroposophy
export const DEFAULT_TEXT = 'The aether carries Rudolf Steiner anthroposophy.';

// Maximum characters allowed in the textarea
export const MAX_CHARS = 500;

// Control defaults and ranges
export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 240;
// Viewport-dependent defaults: chairman directive 2026-05-07
export const FONT_SIZE_DEFAULT_DESKTOP = 36;
export const FONT_SIZE_DEFAULT_MOBILE = 20;
export const FONT_SIZE_DEFAULT = FONT_SIZE_DEFAULT_DESKTOP;
// Breakpoint at which mobile default applies
export const MOBILE_BREAKPOINT_PX = 768;

export const LETTER_SPACING_MIN = -0.05;
export const LETTER_SPACING_MAX = 0.2;
export const LETTER_SPACING_DEFAULT = 0;
export const LETTER_SPACING_STEP = 0.005;

export const LINE_HEIGHT_MIN = 0.9;
export const LINE_HEIGHT_MAX = 2.0;
export const LINE_HEIGHT_DEFAULT = 1.2;
export const LINE_HEIGHT_STEP = 0.05;

export type AlignValue = 'left' | 'center' | 'right' | 'justify';
export const ALIGN_OPTIONS: AlignValue[] = ['left', 'center', 'right', 'justify'];
export const ALIGN_DEFAULT: AlignValue = 'left';

// Preset texts (bilingual intentional — .notdef shows for unsupported chars)
export const PRESETS: Record<string, string> = {
	pangram: 'The quick brown fox jumps over the lazy dog 1234567890',
	word: 'Aether',
	numbers: '0123456789',
	symbols: '. , - ; : ! ? & @ # $ %',
	bilingual: 'Aether — 意味を運ぶ媒質\nThe aether carries meaning before sight.'
};
