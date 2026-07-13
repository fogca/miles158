// Driver-license eligibility (Step 0). Verified fact driving this gate:
// a Chinese mainland license cannot be used to drive in Japan — China is not a
// party to the 1949 Geneva Convention, and it is NOT in the 6-region translation
// scheme (Switzerland/Germany/France/Belgium/Monaco/Taiwan). The only legal route
// is 外免切替 (residency + practical test), which a tourist cannot use.
// We therefore block china_mainland up front. NOTE: as a rent-a-car licensee we
// must NOT offer or broker driver-provided services — the block message only
// points to licensed hire/taxi operators as general information.

export type LicenseKind =
	| 'jp'
	| 'idp_geneva'
	| 'translation'
	| 'hk_macau_idp'
	| 'china_mainland';

export interface LicenseOption {
	kind: LicenseKind;
	eligible: boolean;
	label: { ja: string; en: string; 'zh-Hans': string; 'zh-Hant': string };
	requiredDocs: string[]; // ja
}

export const LICENSE_OPTIONS: LicenseOption[] = [
	{
		kind: 'jp',
		eligible: true,
		label: {
			ja: '日本の運転免許証',
			en: 'Japanese driver’s license',
			'zh-Hans': '日本驾照',
			'zh-Hant': '日本駕照'
		},
		requiredDocs: ['運転免許証（取得から3年以上経過）', '本人確認書類']
	},
	{
		kind: 'idp_geneva',
		eligible: true,
		label: {
			ja: 'ジュネーブ条約加盟国の国際運転免許証(IDP)',
			en: 'International Driving Permit (Geneva Convention)',
			'zh-Hans': '日内瓦公约国际驾照(IDP)',
			'zh-Hant': '日內瓦公約國際駕照(IDP)'
		},
		requiredDocs: ['国際運転免許証(IDP)', '本国の運転免許証', 'パスポート']
	},
	{
		kind: 'translation',
		eligible: true,
		label: {
			ja: '対象国の免許＋公式翻訳文（台湾・スイス・独・仏・ベルギー・モナコ）',
			en: 'Home license + official translation (TW/CH/DE/FR/BE/MC)',
			'zh-Hans': '本国驾照＋官方译文（台湾/瑞士/德/法/比/摩纳哥）',
			'zh-Hant': '本國駕照＋官方譯文（台灣/瑞士/德/法/比/摩納哥）'
		},
		requiredDocs: ['本国の運転免許証', 'JAF等による日本語翻訳文', 'パスポート']
	},
	{
		kind: 'hk_macau_idp',
		eligible: true,
		label: {
			ja: '香港・マカオの国際運転免許証(IDP)',
			en: 'Hong Kong / Macau IDP',
			'zh-Hans': '香港/澳门国际驾照(IDP)',
			'zh-Hant': '香港/澳門國際駕照(IDP)'
		},
		requiredDocs: ['国際運転免許証(IDP)', '本国の運転免許証', 'パスポート']
	},
	{
		kind: 'china_mainland',
		eligible: false,
		label: {
			ja: '中国本土の運転免許証のみ',
			en: 'Chinese mainland license only',
			'zh-Hans': '仅中国大陆驾照',
			'zh-Hant': '僅中國大陸駕照'
		},
		requiredDocs: []
	}
];

export function getLicenseOption(kind: string): LicenseOption | undefined {
	return LICENSE_OPTIONS.find((o) => o.kind === kind);
}

// ---- site-locale helpers (site uses ja/en/zh; zh maps to zh-Hans) ----
type SiteLocale = 'ja' | 'en' | 'zh';
const toDictLocale = (l: SiteLocale) => (l === 'zh' ? 'zh-Hans' : l) as 'ja' | 'en' | 'zh-Hans';

export function licenseLabel(opt: LicenseOption, locale: SiteLocale): string {
	return opt.label[toDictLocale(locale)] ?? opt.label.ja;
}

export function blockMessage(locale: SiteLocale): string {
	return BLOCK_MESSAGE[toDictLocale(locale)] ?? BLOCK_MESSAGE.ja;
}

const DOCS_I18N: Record<string, Record<SiteLocale, string>> = {
	'運転免許証（取得から3年以上経過）': {
		ja: '運転免許証（取得から3年以上経過）',
		en: 'Driver’s license (held for 3+ years)',
		zh: '驾照（取得满 3 年以上）'
	},
	本人確認書類: { ja: '本人確認書類', en: 'ID showing your address', zh: '身份证明文件' },
	'国際運転免許証(IDP)': { ja: '国際運転免許証(IDP)', en: 'International Driving Permit (IDP)', zh: '国际驾照（IDP）' },
	本国の運転免許証: { ja: '本国の運転免許証', en: 'Home-country driver’s license', zh: '本国驾照原件' },
	パスポート: { ja: 'パスポート', en: 'Passport', zh: '护照' },
	'JAF等による日本語翻訳文': {
		ja: 'JAF等による日本語翻訳文',
		en: 'Official Japanese translation (JAF etc.)',
		zh: '官方日语译文（JAF 等出具）'
	}
};

export function localizedDocs(opt: LicenseOption, locale: SiteLocale): string[] {
	return opt.requiredDocs.map((d) => DOCS_I18N[d]?.[locale] ?? d);
}

export function isEligible(kind: string): boolean {
	return getLicenseOption(kind)?.eligible ?? false;
}

// Shown when china_mainland is selected.
export const BLOCK_MESSAGE: Record<string, string> = {
	ja: '中国本土で発行された運転免許証では、日本国内で運転することができません（国際運転免許証・翻訳文いずれも対象外）。運転者付きの移動をご希望の場合は、許可を受けたハイヤー・タクシー事業者のご利用をご検討ください。',
	en: 'A driver’s license issued in mainland China cannot be used to drive in Japan (neither an IDP nor a translation qualifies). If you need transportation with a driver, please consider using a licensed hire-car or taxi operator.',
	'zh-Hans': '在中国大陆签发的驾照无法在日本驾车（国际驾照及译文均不适用）。如需配备司机的出行方式，请考虑使用持有许可的出租车或专车运营商。',
	'zh-Hant': '在中國大陸簽發的駕照無法在日本駕車（國際駕照及譯文均不適用）。如需配備司機的出行方式，請考慮使用持有許可的計程車或專車業者。'
};
