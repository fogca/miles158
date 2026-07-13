// MILES 158 — content registry
// Images alternate between car_10.png and LC500.png while final assets are pending.

const IMG_A = '/images/car_10.png';
const IMG_B = '/images/LC500.png';
const IMG_C = '/images/car_02.png';
const IMG_D = '/images/LM500.png';
const IMG_E = '/images/car_03.png';
const IMG_F = '/images/car_01.jpg';
const IMG_G = '/images/car_04.png';
const IMG_H = '/images/car_05.jpg';
const ROTATION = [IMG_A, IMG_B, IMG_C, IMG_D, IMG_E, IMG_F, IMG_G, IMG_H];
const alt = (i: number) => ROTATION[i % ROTATION.length];

export type Slide = {
	image: string;
	title: string;
	description: string;
	label: string;
};

export type Service = {
	id: string;
	number: string;
	name: string;
	description: string;
};

export type Car = {
	id: string;
	name: string;
	image: string;
	subtitle: string;
};

// Hero (Top)
export const hero = {
	brand: 'MILES 158',
	services: 'カーレンタル / カフェラウンジ / クラブコミュニティ',
	bigTitle: ['Discover', 'the Sky'],
	leadJa: ['車と走る喜びをもっと身近に。', 'さぁ旅にでよう'],
	ctaLabel: 'Explore',
	bgImage: IMG_F
};

// Concept Parallax (mirrors avatr's .home_para — text reveal then image)
export const conceptParallax = {
	texts: [
		'マイルズ158へようこそ。<br>車と走る喜びをもっと身近に。',
		'マイルズ158は<br class="sp-br">名古屋西区の国道158号線沿いに誕生した<br class="sp-br">車好きのためのカーラウンジです。<br class="sp-br"><br class="sp-br">カーレンタル、クラブカフェ、<br class="sp-br">クラブコミュニティ― 車と過ごす時間を<br class="sp-br">豊かに、そして身近にするためのサービスを、<br class="sp-br">ひとつの建物にまとめました。',
		'さぁ、車と旅にでよう。'
	],
	// Vis1: car_07 (Vis2 was removed; CTA now layers on top of Vis1)
	image: '/images/car_07.png'
};

// Concept Visual — 4 slides
export const conceptSlides: Slide[] = [
	{
		image: alt(0),
		title: 'The Sky at Dawn',
		description: '夜が明ける一瞬の青。走り出すために、もっとも静かな時間。',
		label: 'Dawn'
	},
	{
		image: alt(1),
		title: 'Clear Daylight',
		description: '昼の青。澄んだ空のもと、車と道がもっとも自由になる時間。',
		label: 'Day'
	},
	{
		image: alt(2),
		title: 'Twilight',
		description: '空と海が溶け合う、黄昏の青。一日のすべてを抱きしめる時間。',
		label: 'Twilight'
	},
	{
		image: alt(3),
		title: 'Deep Night',
		description: '夜の青。静けさの中を駆ける、もっとも深い時間。',
		label: 'Night'
	}
];

// 4 Services
export const services: Service[] = [
	{
		id: 'rental',
		number: '01',
		name: 'Car Rental',
		description:
			'私たちは、「車と走る喜びをもっと身近に」という想いのもと、上質な時間を過ごせる車両のレンタルサービスを行っております。期間は柔軟に対応しており、マンスリーサービスもございますので、お気軽にお問い合わせください。私たちの考えるカーレンタルは単に車そのものをお貸しするのではなく、その車と共に生まれる時間と体験をつくっていきたいと考えています。特別な瞬間 ― 記念日、旅、ただ走りたいその日 ― をより身近にするために活動しています。'
	},
	{
		id: 'community',
		number: '02',
		name: 'Club Community',
		description:
			'私たちは、「車を愛する気持ちが人と人を長く結びつける」という想いのもと、車好きが集うプライベートなクラブコミュニティを運営しております。会員制で、同じ情熱を持つ仲間と時間・知識・物語を交わせる空間を整えています。会員制度や定例イベントについてはお気軽にお問い合わせください。私たちの考えるコミュニティは、単なる会員サービスではなく、同好の士が長く共に在れる精神的な拠点でありたいと考えています。出会いと再会を、より豊かなものにするために活動しています。'
	},
	{
		id: 'cafe',
		number: '03',
		name: 'Club Cafe',
		description:
			'私たちは、「走る時間だけが車との時間ではない」という想いのもと、車文化が息づくカフェラウンジを運営しております。会員のみならず、一般のお客様にもご利用いただけますので、お気軽にお立ち寄りください。私たちの考えるカフェは、ただ飲食を提供する場ではなく、車と人が出会う「もうひとつの行程」を編み込む場所でありたいと考えています。走らない時間も豊かにするために活動しています。'
	},
	{
		id: 'cleaning',
		number: '04',
		name: 'Cleaning',
		description:
			'私たちは、「美しい状態を保つことは車への敬意そのもの」という想いのもと、丁寧な洗車とメンテナンスを行っております。基本の洗車から内外装の本格的なディテーリングまで承りますので、お気軽にお問い合わせください。私たちの考えるクリーニングは、単に表面を整えるだけではなく、その車の尊厳と価値を長く保つための営みであると考えています。走るその瞬間に純粋な喜びをもたらすために活動しています。'
	}
];

// Service slides — used by StorySlider
const serviceSlideImages: Record<string, string> = {
	rental: '/images/car_05.png',
	cafe: '/images/car_03.png',
	community: '/images/car_06.png',
	cleaning: '/images/cleaning.png'
};
export const serviceSlides: Slide[] = services.map((s, i) => ({
	image: serviceSlideImages[s.id] ?? alt(i),
	title: s.name,
	description: s.description,
	label: s.name
}));

// Cars — Land Cruiser FJ VX + Alphard Hybrid Z (2 cars).
// NOTE: the two image files below are pending generation; paths are final.
export const cars: Car[] = [
	{
		id: 'fj-vx',
		name: 'Land Cruiser FJ VX',
		image: '/images/LandCruiserFJ-VX.png',
		subtitle: 'Heritage Tourer · 2.7L 4WD'
	},
	{
		id: 'alphard-z',
		name: 'Alphard Hybrid Z',
		image: '/images/AlphardHybrid-Z.png',
		subtitle: 'Premium Lounge · Hybrid 7-Seater'
	}
];

// Place
export const place = {
	address: '愛知県名古屋市西区',
	roadHint: '国道158号沿い',
	mapImage: '/images/place.JPG'
};

// ─────────────────────────────────────────────────────────────────────────────
// Rental — pricing, flow, conditions
// Prices are tax-exclusive; the rental page renders straight from this.
// ─────────────────────────────────────────────────────────────────────────────

export type RentalRate = {
	tier: 'day' | 'weekend' | 'extraHour' | 'cdw';
	label: string; // English
	labelJa: string; // 日本語
	price: string; // tax-exclusive
	note?: string; // e.g. 走行距離 / 含まれるもの
};

export type CarRental = {
	carId: string; // matches cars[].id
	status: 'available' | 'coming-soon';
	rates?: RentalRate[]; // omitted when status === 'coming-soon'
};

const MILEAGE_NOTE = '走行距離 300km/日 まで / 超過は¥55/km';

export const rentalPricing: CarRental[] = [
	{
		carId: 'fj-vx',
		status: 'available',
		rates: [
			{ tier: 'day', label: 'Day', labelJa: '1日（24時間）', price: '¥32,000', note: MILEAGE_NOTE },
			{ tier: 'weekend', label: 'Weekend', labelJa: '週末（金土日）', price: '¥41,600', note: MILEAGE_NOTE },
			{ tier: 'extraHour', label: 'Extra Hour', labelJa: '延長（1時間）', price: '¥2,900' },
			{ tier: 'cdw', label: 'CDW', labelJa: '車両補償（CDW）/ 日', price: '¥2,400' }
		]
	},
	{
		carId: 'alphard-z',
		status: 'available',
		rates: [
			{ tier: 'day', label: 'Day', labelJa: '1日（24時間）', price: '¥36,000', note: MILEAGE_NOTE },
			{ tier: 'weekend', label: 'Weekend', labelJa: '週末（金土日）', price: '¥46,800', note: MILEAGE_NOTE },
			{ tier: 'extraHour', label: 'Extra Hour', labelJa: '延長（1時間）', price: '¥3,300' },
			{ tier: 'cdw', label: 'CDW', labelJa: '車両補償（CDW）/ 日', price: '¥2,700' }
		]
	}
];

export type FlowStep = {
	number: string;
	title: string; // English
	titleJa: string; // 日本語
	body: string;
};

export const rentalFlow: FlowStep[] = [
	{
		number: '01',
		title: 'Inquiry',
		titleJa: 'お問い合わせ・ご予約',
		body: 'ご希望の車両と利用期間をお知らせください。空き状況を確認のうえ、折り返しご連絡いたします。'
	},
	{
		number: '02',
		title: 'Confirmation',
		titleJa: '内容確認・お支払い',
		body: 'ご利用内容、料金、必要書類をご確認いただきます。お支払いは事前のオンライン決済にて承ります。'
	},
	{
		number: '03',
		title: 'Pick-up',
		titleJa: 'ご来店・お引き渡し',
		body: 'MILES 158 ラウンジにてお引き渡しいたします。運転免許証をご提示のうえ、車両の状態をご確認ください。'
	},
	{
		number: '04',
		title: 'Return',
		titleJa: 'ご返却',
		body: '満タンの状態でラウンジまでご返却ください。車両確認をもってご利用終了となります。'
	}
];

export const rentalConditions = {
	documents: [
		'運転免許証（取得から3年以上経過していること）',
		'本人確認書類（住所が確認できるもの）',
		'クレジットカード（保証金確認のため）'
	],
	requirements: [
		'満 25 歳以上であること',
		'日本国内で有効な運転資格をお持ちであること',
		'禁煙でのご利用にご協力ください'
	],
	notes: [
		'掲載の車両画像は一部イメージ・合成写真を含み、実際の車両・仕様・装備と異なる場合があります。',
		'表示料金はすべて税抜です。別途、消費税および保証金（与信枠）を申し受けます。',
		'走行距離は1日あたり300kmまでを含み、超過分は1kmにつき¥55を申し受けます。燃料は満タン返しの規定を超えた場合、別途料金が発生いたします。',
		'車両の配車・引き取りは当社が承ります。遠方への配車は別途配車費用が発生する場合があります。',
		'事故・破損が生じた際は、保険・補償制度および NOC（休業補償）の規定に基づきご負担をお願いする場合があります。詳しくは「保険・補償について」をご覧ください。'
	]
};
