<script lang="ts">
	import { onMount } from 'svelte';

	// =========================================================
	// Stock / animation / scroll-video / ScrollVideo.svelte
	// ---------------------------------------------------------
	// Scroll-driven video playback (awwwards-style):
	//   - Scroll down → video plays forward
	//   - Stop scrolling → video pauses
	//   - Scroll back → video reverses
	//
	// Implementation:
	//   - `position: sticky` stage + self-computed scroll progress
	//   - Per-tick: `video.currentTime = duration * progress`
	//   - Lenis-flow (no GSAP ScrollTrigger) — same race-free pattern as
	//     ParallaxStack.
	//
	// USAGE
	//   <ScrollVideo
	//     src="/images/hero.mp4"
	//     scrollDistance="300%"
	//     overlay
	//   />
	//
	// NOTES
	//   - For reliable seeking, the mp4 should be encoded h.264 baseline
	//     with `+faststart` (moov atom first). Otherwise iOS / Safari may
	//     stutter during scroll-seek.
	// =========================================================

	let {
		src,
		poster,
		scrollDistance = '300%',
		background = '#000',
		overlay = false,
		debug = false,
		children
	}: {
		src: string;
		poster?: string;
		scrollDistance?: string;
		background?: string;
		overlay?: boolean;
		debug?: boolean;
		/** Optional snippet rendered on top of the video; receives `progress` (0–1) and `duration` (seconds). */
		children?: import('svelte').Snippet<[{ progress: number; duration: number }]>;
	} = $props();

	let containerEl = $state<HTMLElement | null>(null);
	let videoEl = $state<HTMLVideoElement | null>(null);
	let progress = $state(0);
	let duration = $state(0);

	const totalHeightVh = parseFloat(scrollDistance) || 300;

	// Coalesce scroll events into rAF — without this we issue one `currentTime`
	// seek per scroll event, which the decoder can't keep up with → stutter.
	let targetTime = 0;
	let rafScheduled = false;

	function applyTime() {
		rafScheduled = false;
		if (!videoEl) return;
		// Threshold (~16ms of video) avoids redundant seeks within the same frame
		if (Math.abs(videoEl.currentTime - targetTime) > 0.02) {
			videoEl.currentTime = targetTime;
		}
	}

	function update() {
		if (!containerEl || !videoEl) return;
		const rect = containerEl.getBoundingClientRect();
		const vh = window.innerHeight;
		const total = containerEl.offsetHeight - vh;
		const scrolled = Math.max(0, Math.min(total, -rect.top));
		const p = total > 0 ? scrolled / total : 0;
		progress = p;
		if (videoEl.duration > 0 && Number.isFinite(videoEl.duration)) {
			duration = videoEl.duration;
			targetTime = videoEl.duration * p;
			if (!rafScheduled) {
				rafScheduled = true;
				requestAnimationFrame(applyTime);
			}
		}
	}

	onMount(() => {
		if (!containerEl || !videoEl) return () => {};

		const onMeta = () => {
			duration = videoEl?.duration ?? 0;
			update();
		};
		videoEl.addEventListener('loadedmetadata', onMeta);

		// iOS Safari: video.currentTime scrub via scroll is blocked until the
		// video has been "started" once. Calling play() then immediately pausing
		// (allowed on muted + playsinline) unlocks seeking. Also re-paint once
		// the first frame can decode so the initial state matches scroll progress.
		const unlock = () => {
			videoEl
				?.play()
				.then(() => videoEl?.pause())
				.catch(() => {});
		};
		const onCanPlay = () => {
			unlock();
			update();
		};
		videoEl.addEventListener('canplay', onCanPlay, { once: true });
		// Fallback: any first user gesture also unlocks (covers cases where
		// canplay races with autoplay-blocked policies).
		const firstGesture = () => {
			unlock();
			window.removeEventListener('touchstart', firstGesture);
			window.removeEventListener('pointerdown', firstGesture);
		};
		window.addEventListener('touchstart', firstGesture, { passive: true, once: true });
		window.addEventListener('pointerdown', firstGesture, { once: true });

		type LenisLike = {
			on: (event: string, fn: (...args: unknown[]) => void) => void;
			off: (event: string, fn: (...args: unknown[]) => void) => void;
		};
		const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;

		if (lenis) {
			lenis.on('scroll', update);
		} else {
			window.addEventListener('scroll', update, { passive: true });
		}
		window.addEventListener('resize', update);
		update();

		return () => {
			videoEl?.removeEventListener('loadedmetadata', onMeta);
			videoEl?.removeEventListener('canplay', onCanPlay);
			window.removeEventListener('touchstart', firstGesture);
			window.removeEventListener('pointerdown', firstGesture);
			if (lenis) lenis.off('scroll', update);
			else window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<section
	class="ScrollVideo"
	bind:this={containerEl}
	style="--bg:{background}; height: {totalHeightVh}vh;"
	data-dark-section
>
	<div class="ScrollVideo__sticky">
		<div class="ScrollVideo__stage">
			<video
				class="ScrollVideo__video"
				bind:this={videoEl}
				{src}
				{poster}
				muted
				playsinline
				preload="auto"
				disablepictureinpicture
				disableremoteplayback
			></video>

			{#if overlay}
				<div class="ScrollVideo__overlay"></div>
			{/if}

			{#if children}
				<div class="ScrollVideo__slot">
					{@render children({ progress, duration })}
				</div>
			{/if}

			{#if debug}
				<div class="ScrollVideo__hud">
					<p>progress: {progress.toFixed(3)}</p>
					<p>duration: {duration.toFixed(2)}s</p>
					<p>time: {(duration * progress).toFixed(2)}s</p>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.ScrollVideo {
		position: relative;
		width: 100%;
		background: var(--bg, #000);
	}

	.ScrollVideo__sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		min-height: 100dvh;
	}

	.ScrollVideo__stage {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.ScrollVideo__video {
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		display: block;
	}

	.ScrollVideo__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(0, 10, 38, 0.15) 0%, rgba(0, 10, 38, 0.5) 100%);
		pointer-events: none;
	}

	.ScrollVideo__slot {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
	}

	.ScrollVideo__slot :global(*) {
		pointer-events: auto;
	}

	.ScrollVideo__hud {
		position: absolute;
		bottom: 24px;
		left: 24px;
		z-index: 10;
		color: #fff;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 12px;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(12px);
		padding: 12px 16px;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}

	.ScrollVideo__hud p {
		margin: 0;
		color: #fff;
	}
</style>
