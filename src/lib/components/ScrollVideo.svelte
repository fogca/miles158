<script lang="ts">
	// Scroll-driven, viewport-pinned video.
	//
	// Implementation: transform-based pseudo-pin (no GSAP pin, no CSS sticky).
	//   - Outer reserves total scroll height (100vh + scrollDistance).
	//   - Inner stage is `position: absolute; top: 0; height: 100vh`.
	//   - On every scroll frame we compute how many px the section top has
	//     scrolled past viewport top (= "offset"), then translateY the stage
	//     by that offset. The stage therefore sticks at viewport top while
	//     the section scrolls past, then releases naturally at the bottom.
	//   - This avoids `position: fixed` (which breaks under transformed
	//     ancestors like Stock's PageTransition wrapper) and CSS sticky
	//     (which breaks under Lenis hijacked scroll).
	//   - video.currentTime is mapped from scroll progress 0→1 across
	//     the pin range; scrolling up rewinds, scrolling speed = play speed.
	import { onMount } from 'svelte';

	interface Props {
		src: string;
		scrollDistance?: number;
		poster?: string;
		label?: string;
		fit?: 'cover' | 'contain';
		background?: string;
		debug?: boolean;
	}

	let {
		src,
		scrollDistance = 2400,
		poster,
		label = 'Aether scroll specimen',
		fit = 'cover',
		background = '#000',
		debug = false
	}: Props = $props();

	let outer: HTMLDivElement;
	let stage: HTMLDivElement;
	let video: HTMLVideoElement;
	let vh = $state(0);

	onMount(() => {
		let killed = false;
		let rafId = 0;
		let onMetadata: (() => void) | null = null;
		let onResize: (() => void) | null = null;
		let scrollHandler: (() => void) | null = null;
		type LenisLike = {
			on: (event: string, fn: () => void) => void;
			off?: (event: string, fn: () => void) => void;
		};
		let lenisRef: LenisLike | null = null;

		const prefersReduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const measure = () => {
			vh = window.innerHeight;
		};
		measure();
		onResize = measure;
		window.addEventListener('resize', onResize);

		// If user prefers reduced motion, skip the scrub and just play once
		if (prefersReduced) {
			(async () => {
				try {
					await video?.play();
				} catch {
					/* autoplay blocked */
				}
			})();
			return () => {
				if (onResize) window.removeEventListener('resize', onResize);
			};
		}

		const update = () => {
			if (!outer || !video || !stage || !video.duration) return;
			const rect = outer.getBoundingClientRect();
			const total = outer.offsetHeight - vh; // total px the section can be scrolled past pin
			const offset = Math.max(0, Math.min(total, -rect.top));
			const progress = total > 0 ? offset / total : 0;

			stage.style.transform = `translate3d(0, ${offset}px, 0)`;

			const t = video.duration * progress;
			if (Math.abs(video.currentTime - t) > 0.01) {
				video.currentTime = t;
			}

			if (debug && progress > 0 && progress < 1 && Math.random() < 0.02) {
				console.log('[ScrollVideo] progress', progress.toFixed(3), 'offset', offset);
			}
		};

		const requestUpdate = () => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(update);
		};

		const setup = () => {
			if (killed) return;
			if (debug) {
				console.log('[ScrollVideo] setup', {
					duration: video.duration,
					scrollDistance,
					outerHeight: outer.offsetHeight,
					vh
				});
			}
			update();
		};

		// Wait for video metadata
		if (video.readyState >= 1 && isFinite(video.duration) && video.duration > 0) {
			setup();
		} else {
			onMetadata = () => setup();
			video.addEventListener('loadedmetadata', onMetadata, { once: true });
		}

		// Hook into Lenis scroll if available, otherwise native scroll
		const lenisInstance = (window as Window & { __lenisInstance?: LenisLike })
			.__lenisInstance;
		if (lenisInstance) {
			lenisRef = lenisInstance;
			scrollHandler = () => requestUpdate();
			lenisRef.on('scroll', scrollHandler);
		} else {
			scrollHandler = () => requestUpdate();
			window.addEventListener('scroll', scrollHandler, { passive: true });
		}

		// Kick once
		requestUpdate();

		return () => {
			killed = true;
			cancelAnimationFrame(rafId);
			if (onMetadata) video?.removeEventListener('loadedmetadata', onMetadata);
			if (onResize) window.removeEventListener('resize', onResize);
			if (scrollHandler) {
				if (lenisRef && typeof lenisRef.off === 'function') {
					lenisRef.off('scroll', scrollHandler);
				} else {
					window.removeEventListener('scroll', scrollHandler);
				}
			}
		};
	});
</script>

<div
	class="ScrollVideo"
	class:is-contain={fit === 'contain'}
	bind:this={outer}
	style="height: calc(100vh + {scrollDistance}px); --scroll-video-bg: {background};"
>
	<div class="ScrollVideo__stage" bind:this={stage}>
		<video
			bind:this={video}
			{src}
			{poster}
			aria-label={label}
			muted
			playsinline
			preload="auto"
			disablepictureinpicture
		></video>
	</div>
</div>

<style>
	.ScrollVideo {
		position: relative;
		width: 100%;
		background: var(--scroll-video-bg, #000);
		overflow: hidden;
	}

	.ScrollVideo__stage {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		will-change: transform;
		transform: translate3d(0, 0, 0);
	}

	.ScrollVideo__stage video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.ScrollVideo.is-contain .ScrollVideo__stage video {
		object-fit: contain;
	}
</style>
