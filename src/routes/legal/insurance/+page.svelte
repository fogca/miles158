<script lang="ts">
	import LegalPage from '$lib/components/LegalPage.svelte';

	const coverage = [
		{ title: '対人補償', value: '1名につき 無制限', note: '自動車損害賠償責任保険を含みます' },
		{ title: '対物補償', value: '1事故につき 無制限', note: '免責額 50,000円' },
		{ title: '車両補償', value: '車両時価額', note: '免責額 50,000円' },
		{ title: '人身傷害補償', value: '1名につき 3,000万円', note: '乗車中の事故による傷害（死亡・後遺障害を含む）を補償' }
	];

	// Original, concise list of standard exclusions (not copied from any source).
	const exclusions = [
		'事故時に警察・当社への所定のご連絡など必要な手続きを行わなかった場合',
		'貸渡約款に違反した場合',
		'飲酒・酒気帯び運転、薬物使用下での運転',
		'無免許運転（免許停止期間・運転できる車種に違反する場合を含む）',
		'契約書記載の運転者・副運転者以外による運転、または又貸し',
		'各種テスト・競技での使用、他車のけん引・後押しに使用した場合',
		'故意・重過失による事故、無断での示談・修理',
		'パンク・タイヤの損傷、ホイール（キャップ）の紛失・破損、鍵の紛失',
		'車内・装備品の汚損や紛失、給油時の油種誤りによる補修費',
		'海岸・河川敷・林間など、車道以外を走行したことによる車両損害',
		'施錠せず・鍵を付けたまま駐車したことによる盗難など、管理上の落ち度があった場合',
		'保険約款の免責事項に該当する場合、補償限度額を超える損害'
	];

	const accidentSteps = [
		{ n: '01', t: '負傷者の救護・安全確保', b: 'まず負傷者の救護を行い、車両を安全な場所へ移動してください。' },
		{ n: '02', t: '警察への通報・届出', b: '加害・被害にかかわらず警察へ届け出てください。後日、事故証明書が必要になります。' },
		{ n: '03', t: 'MILES 158 への連絡', b: '速やかに当社までご連絡ください。保険・補償の適用に必要な手続きをご案内します。' }
	];
</script>

<svelte:head>
	<title>保険・補償について — MILES 158</title>
	<meta name="description" content="MILES 158 カーレンタルの保険・補償制度、NOC、事故時の対応について。" />
</svelte:head>

<LegalPage title="保険・補償について" eyebrow="Insurance">
	<h2>保険補償制度について</h2>
	<p>
		当社の車両には、下記の金額を限度として保険その他の制度による補償が付いています。ただし、補償の限度額を超える損害、保険約款の免責事項に該当する事故、貸渡約款に違反する事故、および警察の事故証明が取得できない場合の損害は、すべてお客様のご負担となります。
	</p>

	<div class="cov-grid">
		{#each coverage as c (c.title)}
			<div class="cov">
				<p class="cov__title">{c.title}</p>
				<p class="cov__value">{c.value}</p>
				<p class="cov__note">{c.note}</p>
			</div>
		{/each}
	</div>

	<h2>車両補償（CDW）— オプション</h2>
	<p>
		CDW（車両損害補償制度）にご加入いただくと、万一の事故の際の対物・車両損害の自己負担（免責額・各50,000円）が免除されます。料金は車両クラスにより異なり、ご予約画面で選択いただけます。
	</p>

	<h2>休業補償（NOC／ノンオペレーションチャージ）</h2>
	<p>
		事故・盗難・故障・汚損・車両装備の損害などにより、当社の責任によらず車両の修理・清掃が必要となった場合、その期間の営業補償として下記の金額をご負担いただきます。
	</p>
	<dl>
		<dt>自走して営業所に返還できた場合</dt>
		<dd>20,000円</dd>
		<dt>自走不能（レッカー等）の場合</dt>
		<dd>50,000円（別途、当社指定工場までのレッカー代をご負担いただきます）</dd>
	</dl>
	<p class="placeholder">
		NOC は、CDW（免責補償）にご加入の場合でも別途ご負担いただきます。NOC 自体の免除をご希望の場合は「NOC 免除」オプションにご加入ください。
	</p>

	<h2>保険補償制度が適用できないケース</h2>
	<p>以下の場合、補償が適用されない損害、または補償の限度額を超える損害は、お客様のご負担となります。</p>
	<ul>
		{#each exclusions as e}<li>{e}</li>{/each}
	</ul>

	<h2>事故・接触があった場合の対応</h2>
	<p>キズ・へこみの大小や相手の有無にかかわらず、すべて「事故扱い」となります。下記の手続きを必ず行ってください（手続きが取られていない場合、保険・補償が適用できず、お客様のご負担となります）。</p>
	<ol class="steps">
		{#each accidentSteps as s (s.n)}
			<li class="step">
				<span class="step__n">{s.n}</span>
				<div>
					<p class="step__t">{s.t}</p>
					<p class="step__b">{s.b}</p>
				</div>
			</li>
		{/each}
	</ol>
	<p>なお、上記対応の有無にかかわらず、損傷の程度や修理時間にかかわらず NOC を申し受けます。</p>

	<p class="placeholder">
		※ 本ページは雛形です。実際の保険契約内容・免責額・NOC 金額に合わせて確定してください。
	</p>
</LegalPage>

<style>
	.cov-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-4);
		margin: var(--space-5) 0 var(--space-7);
	}
	@media (min-width: 560px) {
		.cov-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	.cov {
		border: 1px solid var(--color-line);
		border-radius: 8px;
		overflow: hidden;
		text-align: center;
	}
	.cov__title {
		background: var(--c-navy);
		color: var(--c-sky) !important;
		margin: 0 !important;
		padding: var(--space-3) !important;
		font-size: var(--fs-h5) !important;
		opacity: 1 !important;
	}
	.cov__value {
		font-size: var(--fs-h3) !important;
		color: var(--color-accent) !important;
		margin: var(--space-5) 0 var(--space-2) !important;
		opacity: 1 !important;
	}
	.cov__note {
		font-size: var(--fs-h6) !important;
		opacity: 0.6 !important;
		margin: 0 0 var(--space-4) !important;
		padding-inline: var(--space-4);
	}
	.steps {
		list-style: none !important;
		padding: 0 !important;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin: var(--space-4) 0;
	}
	.step {
		list-style: none !important;
		display: grid;
		grid-template-columns: 2.4em 1fr;
		gap: var(--space-4);
	}
	.step__n {
		font-size: var(--fs-h3);
		opacity: 0.35;
		font-feature-settings: 'tnum';
	}
	.step__t {
		font-size: var(--fs-h5) !important;
		margin: 0 !important;
		opacity: 1 !important;
	}
	.step__b {
		font-size: var(--fs-h6) !important;
		opacity: 0.75 !important;
		margin: var(--space-1) 0 0 !important;
	}
</style>
