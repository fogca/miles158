<script lang="ts">
	import { onMount } from 'svelte';

	type Slide = {
		image: string;
		title: string;
		description: string;
		label: string;
	};

	let { slides }: { slides: Slide[] } = $props();

	let containerEl = $state<HTMLElement | null>(null);
	let stageEl = $state<HTMLElement | null>(null);
	let activeIndex = $state(0);
	let currentProgress = $state(0);

	onMount(() => {
		if (!containerEl || !stageEl) return () => {};

		let cleanup: (() => void) | null = null;

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);
			gsap.registerPlugin(ScrollTrigger);

			// Entry: clip-path reveals from bottom → top while the previous
			// section (.cpara) is scrolling out. Keyed off the prev section's
			// bottom so there is no gap between Vis2 and the slider.
			gsap.set(stageEl!, { clipPath: 'inset(100% 0 0 0)' });
			const prevSection = document.querySelector<HTMLElement>('.cpara');
			const entryTrigger = prevSection
				? ScrollTrigger.create({
						trigger: prevSection,
						scroller: document.body,
						start: 'bottom bottom',
						end: 'bottom top',
						scrub: true,
						invalidateOnRefresh: true,
						onUpdate: (self) => {
							gsap.set(stageEl!, {
								clipPath: `inset(${(1 - self.progress) * 100}% 0 0 0)`
							});
						}
					})
				: null;

			// Pin: slide-driven activeIndex update
			const pinTrigger = ScrollTrigger.create({
				trigger: containerEl!,
				scroller: document.body,
				start: 'top top',
				end: () => `+=${(slides.length - 1) * window.innerHeight}`,
				pin: stageEl!,
				pinSpacing: true,
				scrub: 1,
				anticipatePin: 1,
				invalidateOnRefresh: true,
				onUpdate: (self) => {
					const segments = Math.max(1, slides.length - 1);
					const exact = self.progress * segments;
					const idx = Math.min(segments, Math.round(exact));
					activeIndex = idx;
					const localExact = exact - idx;
					currentProgress = Math.max(0, Math.min(1, localExact + 0.5));
				}
			});

			cleanup = () => {
				entryTrigger?.kill();
				pinTrigger.kill();
			};
		})();

		return () => cleanup?.();
	});

	function jumpTo(i: number) {
		if (!containerEl) return;
		const segments = Math.max(1, slides.length - 1);
		const targetProgress = i / segments;
		const totalScrollable = containerEl.offsetHeight - window.innerHeight;
		const targetScroll = containerEl.offsetTop + targetProgress * totalScrollable;
		window.scrollTo({ top: targetScroll, behavior: 'smooth' });
	}

	function barFill(i: number): number {
		if (i < activeIndex) return 100;
		if (i > activeIndex) return 0;
		return currentProgress * 100;
	}
</script>

<section class="slider" data-dark-section bind:this={containerEl}>
	<div class="stage" bind:this={stageEl}>
		{#each slides as slide, i (i)}
			<div class="bg" class:active={i === activeIndex} aria-hidden={i !== activeIndex}>
				<img src={slide.image} alt={slide.title} loading={i === 0 ? 'eager' : 'lazy'} />
			</div>
		{/each}

		<div class="overlay"></div>

		{#if slides[activeIndex]}
			{#key activeIndex}
				<div class="content">
					<h2 class="title">{@html slides[activeIndex].title}</h2>
					<p class="desc" lang="ja">{slides[activeIndex].description}</p>
				</div>
			{/key}
		{/if}

		<ul class="nav">
			{#each slides as slide, i (i)}
				<li>
					<button type="button" onclick={() => jumpTo(i)} class:active={i === activeIndex}>
						<span class="bar"><span class="fill" style="width:{barFill(i)}%"></span></span>
						<span class="label">{String(i + 1).padStart(2, '0')} · {slide.label}</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.slider {
		position: relative;
		width: 100%;
		padding-left: 0;
		padding-right: 0;
	}

	.stage {
		height: 100vh;
		width: 100%;
		overflow: hidden;
		background: var(--c-navy);
		color: var(--c-sky);
	}

	.bg {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.7s ease;
		pointer-events: none;
	}

	.bg.active {
		opacity: 1;
	}

	.bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(0, 10, 38, 0.15) 0%, rgba(0, 10, 38, 0.55) 100%);
		z-index: 4;
		pointer-events: none;
	}

	.content {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		text-align: left;
		padding: 0 var(--padding);
		z-index: 5;
		animation: fadeIn 0.7s ease both;
		pointer-events: none;
		color: var(--c-sky);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.title {
		font-size: var(--fs-h1);
		margin: 0 0 var(--space-4) 0;
		max-width: 18ch;
		color: var(--c-sky);
	}

	.desc {
		font-size: var(--fs-p);
		max-width: 55ch;
		opacity: 0.9;
		margin: 0;
		color: var(--c-sky);
		line-height: var(--lh-ja);
	}

	.nav {
		position: absolute;
		bottom: 4vh;
		left: var(--padding);
		right: var(--padding);
		display: flex;
		gap: 5px;
		padding: 0;
		margin: 0;
		z-index: 10;
	}

	.nav li {
		flex: 1;
	}

	.nav button {
		background: none;
		border: none;
		color: var(--c-sky);
		padding: 0;
		cursor: pointer;
		opacity: 0.5;
		transition: opacity 0.3s;
		text-align: left;
	}

	.nav button.active {
		opacity: 1;
	}

	.nav button {
		width: 100%;
	}

	.nav .bar {
		display: block;
		width: 100%;
		height: 2px;
		background: rgba(232, 244, 248, 0.22);
		position: relative;
		margin-bottom: 8px;
	}

	.nav .fill {
		display: block;
		height: 100%;
		background: var(--c-sky);
		transition: width 0.12s linear;
	}

	.nav .label {
		display: block;
		font-size: var(--fs-h6);
		white-space: nowrap;
	}

	@media (max-width: 767px) {
		.content {
			justify-content: flex-end;
			padding-bottom: 86px;
		}
		.desc {
			font-size: 10.5px;
		}
		.nav {
			bottom: 30px;
			gap: 5px;
		}
	}
</style>
