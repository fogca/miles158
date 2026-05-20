<script lang="ts">
	import {
		FONT_SIZE_MIN,
		FONT_SIZE_MAX,
		LETTER_SPACING_MIN,
		LETTER_SPACING_MAX,
		LETTER_SPACING_STEP,
		LINE_HEIGHT_MIN,
		LINE_HEIGHT_MAX,
		LINE_HEIGHT_STEP,
		ALIGN_OPTIONS,
		MAX_CHARS,
		PRESETS,
		DEFAULT_TEXT
	} from './presets.js';
	import type { AlignValue } from './presets.js';

	interface Props {
		fontSize: number;
		letterSpacing: number;
		lineHeight: number;
		align: AlignValue;
		text: string;
		onFontSizeChange: (v: number) => void;
		onLetterSpacingChange: (v: number) => void;
		onLineHeightChange: (v: number) => void;
		onAlignChange: (v: AlignValue) => void;
		onTextChange: (v: string) => void;
	}

	let {
		fontSize,
		letterSpacing,
		lineHeight,
		align,
		text,
		onFontSizeChange,
		onLetterSpacingChange,
		onLineHeightChange,
		onAlignChange,
		onTextChange
	}: Props = $props();

	// Debounce timer for textarea input
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function handleTextInput(e: Event) {
		const val = (e.target as HTMLTextAreaElement).value;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			onTextChange(val.slice(0, MAX_CHARS));
		}, 100);
	}

	function applyPreset(key: string) {
		onTextChange(PRESETS[key]);
	}

	function resetText() {
		onTextChange(DEFAULT_TEXT);
	}
</script>

<aside class="ControlPanel" aria-label="Type Tester controls">
	<div class="ControlPanel__sliders">
		<!-- Font size -->
		<label class="ControlPanel__field">
			<span class="field-label">Size</span>
			<input
				type="range"
				min={FONT_SIZE_MIN}
				max={FONT_SIZE_MAX}
				step="1"
				value={fontSize}
				oninput={(e) => onFontSizeChange(Number((e.target as HTMLInputElement).value))}
				aria-label="Font size in pixels"
				aria-valuemin={FONT_SIZE_MIN}
				aria-valuemax={FONT_SIZE_MAX}
				aria-valuenow={fontSize}
			/>
			<span class="field-value">{fontSize}px</span>
		</label>

		<!-- Letter spacing -->
		<label class="ControlPanel__field">
			<span class="field-label">Tracking</span>
			<input
				type="range"
				min={LETTER_SPACING_MIN}
				max={LETTER_SPACING_MAX}
				step={LETTER_SPACING_STEP}
				value={letterSpacing}
				oninput={(e) => onLetterSpacingChange(Number((e.target as HTMLInputElement).value))}
				aria-label="Letter spacing in em units"
				aria-valuemin={LETTER_SPACING_MIN}
				aria-valuemax={LETTER_SPACING_MAX}
				aria-valuenow={letterSpacing}
			/>
			<span class="field-value">{letterSpacing.toFixed(3)}em</span>
		</label>

		<!-- Line height -->
		<label class="ControlPanel__field">
			<span class="field-label">Leading</span>
			<input
				type="range"
				min={LINE_HEIGHT_MIN}
				max={LINE_HEIGHT_MAX}
				step={LINE_HEIGHT_STEP}
				value={lineHeight}
				oninput={(e) => onLineHeightChange(Number((e.target as HTMLInputElement).value))}
				aria-label="Line height, unitless"
				aria-valuemin={LINE_HEIGHT_MIN}
				aria-valuemax={LINE_HEIGHT_MAX}
				aria-valuenow={lineHeight}
			/>
			<span class="field-value">{lineHeight.toFixed(2)}</span>
		</label>

		<!-- Alignment -->
		<div class="ControlPanel__field ControlPanel__field--align" role="group" aria-label="Text alignment">
			<span class="field-label">Align</span>
			<div class="align-buttons">
				{#each ALIGN_OPTIONS as opt}
					<button
						class="align-btn"
						class:is-active={align === opt}
						onclick={() => onAlignChange(opt)}
						aria-pressed={align === opt}
						aria-label="Align {opt}"
					>
						{opt.charAt(0).toUpperCase() + opt.slice(1)}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Text input -->
	<div class="ControlPanel__textarea-wrap">
		<textarea
			class="ControlPanel__textarea"
			maxlength={MAX_CHARS}
			rows="2"
			value={text}
			oninput={handleTextInput}
			aria-label="Preview text, applied to all weight rows"
			spellcheck="false"
		></textarea>
		<span class="char-count" aria-live="polite">{text.length} / {MAX_CHARS}</span>
	</div>

	<!-- Presets -->
	<div class="ControlPanel__presets" role="group" aria-label="Text presets">
		{#each Object.keys(PRESETS) as key}
			<button
				class="preset-btn"
				onclick={() => applyPreset(key)}
				aria-label="Load {key} preset"
			>
				{key.charAt(0).toUpperCase() + key.slice(1)}
			</button>
		{/each}
		<button class="preset-btn preset-btn--reset" onclick={resetText} aria-label="Reset to default text">
			Reset
		</button>
	</div>
</aside>

<style>
	.ControlPanel {
		position: sticky;
		bottom: 0;
		z-index: var(--z-header);
		background: var(--color-bg);
		border-top: 1px solid var(--color-line);
		padding: 12px var(--padding) 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	/* Slider row */
	.ControlPanel__sliders {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 20px;
		align-items: center;
	}

	.ControlPanel__field {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 1 1 auto;
		min-width: 160px;
	}

	.ControlPanel__field--align {
		flex: 0 0 auto;
	}

	.field-label {
		font-size: 10px;
		color: var(--color-text-mute);
		white-space: nowrap;
		min-width: 48px;
		font-family: var(--font-en), sans-serif;
	}

	.field-value {
		font-size: 10px;
		color: var(--color-text-mute);
		white-space: nowrap;
		min-width: 44px;
		text-align: right;
		font-family: var(--font-en), sans-serif;
	}

	input[type='range'] {
		flex: 1;
		accent-color: var(--color-text);
		height: 2px;
		cursor: pointer;
	}

	/* Alignment buttons */
	.align-buttons {
		display: flex;
		gap: 4px;
	}

	.align-btn {
		font-size: 10px;
		font-family: var(--font-en), sans-serif;
		padding: 3px 7px;
		border: 1px solid var(--color-line);
		color: var(--color-text-mute);
		transition: color var(--duration-fast), border-color var(--duration-fast);
		cursor: pointer;
	}

	.align-btn.is-active {
		color: var(--color-text);
		border-color: var(--color-text);
	}

	/* Textarea */
	.ControlPanel__textarea-wrap {
		position: relative;
	}

	.ControlPanel__textarea {
		width: 100%;
		border: 1px solid var(--color-line);
		padding: 8px 10px;
		font-size: 12px;
		font-family: var(--font-en), sans-serif;
		resize: vertical;
		min-height: 44px;
		line-height: 1.5;
	}

	.ControlPanel__textarea:focus {
		outline: 2px solid var(--color-text);
		outline-offset: -1px;
	}

	.char-count {
		position: absolute;
		bottom: 6px;
		right: 8px;
		font-size: 9px;
		color: var(--color-text-mute);
		pointer-events: none;
		font-family: var(--font-en), sans-serif;
	}

	/* Preset buttons */
	.ControlPanel__presets {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.preset-btn {
		font-size: 10px;
		font-family: var(--font-en), sans-serif;
		padding: 4px 10px;
		border: 1px solid var(--color-line);
		color: var(--color-text-mute);
		transition: color var(--duration-fast), border-color var(--duration-fast);
		cursor: pointer;
	}

	.preset-btn:hover {
		color: var(--color-text);
		border-color: var(--color-text);
	}

	.preset-btn--reset {
		margin-left: auto;
	}

	@media (min-width: 768px) {
		.ControlPanel {
			flex-direction: row;
			flex-wrap: wrap;
			align-items: flex-start;
			gap: 12px 32px;
		}

		.ControlPanel__sliders {
			flex: 1 1 auto;
		}

		.ControlPanel__textarea-wrap {
			flex: 0 0 240px;
		}

		.ControlPanel__presets {
			flex: 0 0 100%;
		}
	}
</style>
