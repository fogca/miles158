// MILES 158 — content registry
// Images are placeholder paths; replace with actual assets in /static/images/

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
	bgImage: '/images/car_10.png'
};

// Concept Parallax (mirrors avatr's .home_para — text reveal then image)
export const conceptParallax = {
	texts: [
		'車と走る喜びをもっと身近に。マイルズ158へようこそ。',
		'国道158号線沿いに新たに誕生した、車好きのためのサービスプレイス。',
		'カーレンタル、クラブコミュニティ、カフェラウンジ、メンテナンス ― 車と過ごす時間そのものを豊かにする4つの場を、ひとつの建物にまとめました。'
	],
	textEn: ['We are the service place for', 'all who love the time with cars.'],
	finalText: 'さぁ、旅にでよう。',
	image: '/images/car_10.png'
};

// Concept Visual — 4 slides covering "from day blue to night blue"
export const conceptSlides: Slide[] = [
	{
		image: '/images/car_10.png',
		title: 'The Sky at Dawn',
		description: '夜が明ける一瞬の青。走り出すために、もっとも静かな時間。',
		label: 'Dawn'
	},
	{
		image: '/images/car_10.png',
		title: 'Clear Daylight',
		description: '昼の青。澄んだ空のもと、車と道がもっとも自由になる時間。',
		label: 'Day'
	},
	{
		image: '/images/car_10.png',
		title: 'Twilight',
		description: '空と海が溶け合う、黄昏の青。一日のすべてを抱きしめる時間。',
		label: 'Twilight'
	},
	{
		image: '/images/car_10.png',
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

// Service slides — used by StorySlider in place of the temporary "sky" slides
export const serviceSlides: Slide[] = services.map((s) => ({
	image: `/images/car_10.png`,
	title: s.name,
	description: s.description,
	label: s.name
}));

// Cars — Lexus LC500 + LM500 (2 cars for now)
export const cars: Car[] = [
	{
		id: 'lc500',
		name: 'Lexus LC500',
		image: '/images/car_10.png',
		subtitle: 'Grand Tourer · V8 Coupé'
	},
	{
		id: 'lm500',
		name: 'Lexus LM500',
		image: '/images/car_10.png',
		subtitle: 'Luxury Lounge · Chauffeured Minivan'
	}
];

// Place
export const place = {
	address: '愛知県名古屋市西区',
	roadHint: '国道158号沿い',
	mapImage: '/images/car_10.png'
};
