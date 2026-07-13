// Locale-aware getters over the ja source of truth in $lib/data/content.
// EN/ZH brand copy below are DRAFTS for review — edit freely; structure and
// image wiring stay in content.ts.

import {
	hero as heroJa,
	conceptParallax as cpJa,
	conceptSlides as slidesJa,
	services as servicesJa,
	serviceSlides as serviceSlidesJa,
	rentalFlow as flowJa,
	rentalConditions as condJa,
	type Slide,
	type Service,
	type FlowStep
} from '$lib/data/content';
import { t } from './index';
import type { Locale } from './index';

export function getHero(locale: Locale) {
	return {
		...heroJa,
		services: t(locale, 'home.services'),
		leadJa: [t(locale, 'home.lead1'), t(locale, 'home.lead2')]
	};
}

const CP_TEXTS: Record<Exclude<Locale, 'ja'>, string[]> = {
	en: [
		'Welcome to MILES 158.<br>Bringing the joy of driving closer.',
		'MILES 158 is a car lounge<br class="sp-br">born on Route 158 in Nishi-ku, Nagoya,<br class="sp-br">made for people who love cars.<br class="sp-br"><br class="sp-br">Car rental, a club cafe,<br class="sp-br">a members’ community — everything that makes<br class="sp-br">time with cars richer and closer,<br class="sp-br">gathered under one roof.',
		'Now — let’s go for a drive.'
	],
	zh: [
		'欢迎来到 MILES 158。<br>让驾驶的乐趣触手可及。',
		'MILES 158 诞生于名古屋西区<br class="sp-br">国道158号沿线，<br class="sp-br">是一间为爱车之人而设的汽车俱乐部。<br class="sp-br"><br class="sp-br">汽车租赁、俱乐部咖啡、<br class="sp-br">车主社区——让与车相处的时光<br class="sp-br">更丰盈、更亲近的一切，<br class="sp-br">都汇聚在同一屋檐下。',
		'现在，与车一起出发吧。'
	]
};

export function getConceptParallax(locale: Locale) {
	if (locale === 'ja') return cpJa;
	return { ...cpJa, texts: CP_TEXTS[locale] };
}

const SLIDE_DESC: Record<Exclude<Locale, 'ja'>, string[]> = {
	en: [
		'The blue of daybreak — the quietest hour to set off.',
		'Midday blue. Under a clear sky, car and road are at their freest.',
		'Twilight blue, where sky and sea dissolve — an hour that holds the whole day.',
		'The blue of night. The deepest hours, running through the stillness.'
	],
	zh: [
		'破晓之蓝——启程前最安静的时刻。',
		'白昼之蓝。晴空之下，车与路最为自由。',
		'暮色之蓝，天与海交融——将一整天温柔收拢的时刻。',
		'夜之蓝。在寂静中飞驰的、最深的时刻。'
	]
};

export function getConceptSlides(locale: Locale): Slide[] {
	if (locale === 'ja') return slidesJa;
	return slidesJa.map((s, i) => ({ ...s, description: SLIDE_DESC[locale][i] ?? s.description }));
}

const SERVICE_DESC: Record<Exclude<Locale, 'ja'>, Record<string, string>> = {
	en: {
		rental:
			'Guided by “bringing the joy of driving closer”, we rent out cars made for quality time. Terms are flexible — monthly plans included — so feel free to ask. For us a rental is never just the car: it is the time and the experience born around it. We exist to bring the special moments — anniversaries, journeys, or simply a day you want to drive — within reach.',
		community:
			'We run a private members’ community for people who love cars, in the belief that a shared passion keeps people connected for a long time. Members exchange time, knowledge and stories with others who feel the same. Ask us about membership and regular events — we want this to be less a service than a lasting home ground for kindred spirits.',
		cafe:
			'Driving is not the only time you spend with cars. Our cafe lounge, open to members and visitors alike, is a place where car culture breathes. More than food and drink, it weaves “another leg of the journey” where cars and people meet — making even the hours off the road rich.',
		cleaning:
			'Keeping a car beautiful is itself a form of respect for it. From a careful wash to full interior and exterior detailing, we look after the dignity and value of each car over time — so that the moment you drive, the joy is pure.'
	},
	zh: {
		rental:
			'秉持“让驾驶的乐趣触手可及”的理念，我们提供可安心享受美好时光的车辆租赁。租期灵活，亦有包月方案，欢迎垂询。我们所理解的租车，从来不只是把车借给您——而是与这台车一同诞生的时间与体验。纪念日、旅行、或只是一个想开车的日子，我们希望让这些特别的瞬间更加亲近。',
		community:
			'我们相信“对车的热爱能让人与人长久相连”，因此运营着一个爱车人士的私密会员社区。在这里，志同道合的伙伴交换时间、知识与故事。会员制度与定期活动欢迎咨询——我们希望它不止是一项服务，而是同好们可以长久归属的精神据点。',
		cafe:
			'与车相处的时光，不只在路上。我们经营着一间浸润着汽车文化的咖啡俱乐部，会员与普通访客都可光临。它不只是提供餐饮的场所，更是编织“旅程的另一段行程”、让车与人相遇的地方——让不开车的时间也同样丰盈。',
		cleaning:
			'保持车的美丽状态，本身就是对车的敬意。从基础洗车到内外装的深度养护，我们悉心守护每一台车的尊严与价值——只为让您握上方向盘的那一刻，纯粹地感到喜悦。'
	}
};

export function getServices(locale: Locale): Service[] {
	if (locale === 'ja') return servicesJa;
	return servicesJa.map((s) => ({ ...s, description: SERVICE_DESC[locale][s.id] ?? s.description }));
}

export function getServiceSlides(locale: Locale): Slide[] {
	if (locale === 'ja') return serviceSlidesJa;
	const desc = SERVICE_DESC[locale];
	return serviceSlidesJa.map((s, i) => ({
		...s,
		description: desc[servicesJa[i]?.id] ?? s.description
	}));
}

// ---- rental page ----
const FLOW: Record<Exclude<Locale, 'ja'>, { titleJa: string; body: string }[]> = {
	en: [
		{ titleJa: 'Inquiry & Booking', body: 'Tell us the car and dates you have in mind. We’ll confirm availability and get back to you.' },
		{ titleJa: 'Confirmation & Payment', body: 'Review the details, price and required documents. Payment is settled in advance.' },
		{ titleJa: 'Pickup', body: 'Handover at the MILES 158 lounge. Please present your driver’s license and check the car together with us.' },
		{ titleJa: 'Return', body: 'Return the car to the lounge with a full tank. The rental ends after a joint inspection.' }
	],
	zh: [
		{ titleJa: '咨询/预约', body: '告知您想租的车辆与日期，我们确认空档后尽快回复。' },
		{ titleJa: '确认/支付', body: '确认租赁内容、费用与所需证件，费用需提前支付。' },
		{ titleJa: '到店取车', body: '在 MILES 158 门店交车。请出示驾照，并与我们共同确认车况。' },
		{ titleJa: '还车', body: '请加满油后归还至门店，共同验车后租赁结束。' }
	]
};

export function getRentalFlow(locale: Locale): FlowStep[] {
	if (locale === 'ja') return flowJa;
	return flowJa.map((s, i) => ({ ...s, titleJa: FLOW[locale][i].titleJa, body: FLOW[locale][i].body }));
}

const COND: Record<Exclude<Locale, 'ja'>, typeof condJa> = {
	en: {
		documents: [
			'Driver’s license (held for 3+ years)',
			'ID showing your current address',
			'Credit card (for the security deposit hold)'
		],
		requirements: ['Aged 25 or over', 'Valid driving qualification for Japan', 'Non-smoking in all cars'],
		notes: [
			'Some photos are for illustration and may differ from the actual car.',
			'All prices exclude tax. Consumption tax and a deposit (card hold) apply separately.',
			'Mileage includes 300km per day; excess is billed at ¥55/km. Extra fees also apply beyond the fuel (full-to-full) policy.',
			'Delivery/collection is available; distant locations may incur a delivery fee.',
			'In case of accident or damage, costs may apply per the insurance / NOC policy — see “Insurance & Coverage”.'
		]
	},
	zh: {
		documents: ['驾照（取得满 3 年以上）', '可确认现住址的身份证件', '信用卡（用于押金预授权）'],
		requirements: ['年满 25 周岁', '持有可在日本驾驶的有效资格', '全车禁烟，敬请配合'],
		notes: [
			'部分图片仅供参考，可能与实际车辆、配置不同。',
			'所示价格均不含税；消费税及押金（信用卡预授权）另计。',
			'每日含 300km 里程，超出部分按每公里 ¥55 收费；未满油归还时也将另行收费。',
			'可提供送取车服务，远距离将产生配送费用。',
			'如发生事故、损伤，将依保险与 NOC（营业损失补偿）规定承担相应费用，详见“保险与保障”页面。'
		]
	}
};

export function getRentalConditions(locale: Locale) {
	if (locale === 'ja') return condJa;
	return COND[locale];
}

const RATE_LABEL: Record<Exclude<Locale, 'ja'>, Record<string, { labelJa: string; note?: string }>> = {
	en: {
		day: { labelJa: '1 day (24h)', note: '300km/day included; excess ¥55/km' },
		weekend: { labelJa: 'Weekend (Fri–Sun)', note: '300km/day included; excess ¥55/km' },
		extraHour: { labelJa: 'Extension (per hour)' },
		cdw: { labelJa: 'CDW coverage / day' }
	},
	zh: {
		day: { labelJa: '1 天（24小时）', note: '每日含 300km，超出 ¥55/km' },
		weekend: { labelJa: '周末（周五至周日）', note: '每日含 300km，超出 ¥55/km' },
		extraHour: { labelJa: '延长（每小时）' },
		cdw: { labelJa: '车辆保障（CDW）/ 天' }
	}
};

export function localizeRate(locale: Locale, rate: { tier: string; labelJa: string; note?: string }) {
	if (locale === 'ja') return rate;
	const o = RATE_LABEL[locale][rate.tier];
	return o ? { ...rate, labelJa: o.labelJa, note: rate.note ? o.note : undefined } : rate;
}
