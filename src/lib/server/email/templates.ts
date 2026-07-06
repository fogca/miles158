// Branded transactional email templates (ja). Returns {subject, html, text} per
// kind. HTML is max-width 600px, inline-styled, image-light — robust on JP carrier
// mail and aligned with the brand. A plain-text part is always provided.
// en/zh fall back to ja for now (i18n-ready: branch on locale when copy is ready).

import { formatJpy } from '$lib/time';
import type { EmailKind, Locale, RenderedEmail, TemplateData } from './types';

const BRAND = 'MILES 158';
const ADDRESS = '愛知県名古屋市西区（国道158号沿い）';
const SUPPORT = 'support@miles158.com';

const officeLabel = (o: string) =>
	o === 'nagoya' ? 'MILES 158 ラウンジ／名古屋市西区・国道158号沿い' : o;

function intervalLabel(min: number, max: number | null): string {
	if (max === null) return '7日前まで';
	if (min === 0) return '当日';
	if (min === 24) return '1〜2日前';
	if (min === 72) return '3〜6日前';
	return `${min}時間前〜`;
}

function shell(heading: string, inner: string, baseUrl: string): string {
	return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f6f7f9;font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',sans-serif;color:#000a26;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:10px;overflow:hidden;">
<tr><td style="background:#000a26;color:#e8f4f8;padding:18px 28px;font-size:18px;letter-spacing:.06em;">${BRAND}</td></tr>
<tr><td style="padding:28px;">
<h1 style="font-size:19px;margin:0 0 16px;font-weight:600;">${heading}</h1>
${inner}
</td></tr>
<tr><td style="background:#f6f7f9;color:#5a6472;padding:18px 28px;font-size:12px;line-height:1.8;">
${BRAND}　／　${ADDRESS}<br>お問い合わせ：<a href="mailto:${SUPPORT}" style="color:#3379e6;">${SUPPORT}</a><br>
<a href="${baseUrl}" style="color:#3379e6;">${baseUrl}</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

function kv(rows: [string, string][]): string {
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 16px;">${rows
		.map(
			([k, v]) =>
				`<tr><td style="padding:8px 0;border-bottom:1px solid #e6e9ee;font-size:13px;color:#5a6472;width:40%;">${k}</td><td style="padding:8px 0;border-bottom:1px solid #e6e9ee;font-size:14px;text-align:right;">${v}</td></tr>`
		)
		.join('')}</table>`;
}

const h2 = (t: string) => `<h2 style="font-size:14px;margin:20px 0 6px;font-weight:600;">${t}</h2>`;
const p = (t: string) => `<p style="font-size:14px;line-height:1.8;margin:0 0 12px;">${t}</p>`;
const cta = (href: string, label: string) =>
	`<p style="margin:20px 0;"><a href="${href}" style="display:inline-block;background:#000a26;color:#e8f4f8;text-decoration:none;padding:11px 28px;border-radius:8px;font-size:14px;">${label}</a></p>`;

function footerText(baseUrl: string): string {
	return `\n${BRAND}\n${ADDRESS}\nお問い合わせ: ${SUPPORT}\n${baseUrl}`;
}

function bookingConfirmation(d: TemplateData): RenderedEmail {
	const subject = `【${BRAND}】ご予約を承りました #${d.reservationCode}`;
	const rules = d.cancellationRules ?? [];
	const cancelRows: [string, string][] = [
		...rules.map((r) => [intervalLabel(r.hoursBeforeMin, r.hoursBeforeMax), `${r.feePercent}%`] as [string, string]),
		['無連絡不来店', '100%']
	];
	const inner =
		p(`${d.customerName} 様`) +
		p(`この度は ${BRAND} をご利用いただき、誠にありがとうございます。下記の内容でご予約を承りました。`) +
		kv([
			['予約番号', d.reservationCode],
			['車両', `${d.vehicleName}${d.vehicleSubtitle ? ` / ${d.vehicleSubtitle}` : ''}`],
			['貸出', `${d.pickupAtJst}<br><span style="color:#5a6472;font-size:12px;">${officeLabel(d.pickupOffice)}</span>`],
			['返却', `${d.returnAtJst}<br><span style="color:#5a6472;font-size:12px;">${officeLabel(d.returnOffice)}</span>`],
			['お支払い合計（税込）', formatJpy(d.total)],
			['保証金（与信枠）', formatJpy(d.deposit)]
		]) +
		h2('キャンセル規定（レンタル基本料金に対して）') +
		kv(cancelRows) +
		h2('ご来店時にご用意いただくもの') +
		`<ul style="font-size:13px;line-height:1.8;margin:0 0 12px;padding-left:1.2em;color:#333;"><li>運転免許証（取得から1年以上）</li><li>保証金確認用のクレジットカード</li><li>外国籍の方：パスポート・有効な運転資格書類</li></ul>` +
		cta(`${d.baseUrl}/reserve/${d.reservationCode}`, '予約内容を確認する') +
		p(`<span style="color:#5a6472;font-size:12px;">ご来店は ${officeLabel(d.pickupOffice)} にて承ります。ご不明点はお気軽にお問い合わせください。</span>`);

	const text = `${d.customerName} 様

この度は ${BRAND} をご利用いただきありがとうございます。下記の内容でご予約を承りました。

予約番号: ${d.reservationCode}
車両: ${d.vehicleName}${d.vehicleSubtitle ? ` / ${d.vehicleSubtitle}` : ''}
貸出: ${d.pickupAtJst}（${officeLabel(d.pickupOffice)}）
返却: ${d.returnAtJst}（${officeLabel(d.returnOffice)}）
お支払い合計（税込）: ${formatJpy(d.total)}
保証金（与信枠）: ${formatJpy(d.deposit)}

［キャンセル規定（基本料金に対して）］
${cancelRows.map(([k, v]) => `  ${k}: ${v}`).join('\n')}

［ご来店時にご用意いただくもの］
  ・運転免許証（取得から1年以上）
  ・保証金確認用のクレジットカード
  ・外国籍の方：パスポート・有効な運転資格書類

予約内容の確認: ${d.baseUrl}/reserve/${d.reservationCode}
${footerText(d.baseUrl)}`;

	return { subject, html: shell('ご予約を承りました', inner, d.baseUrl), text };
}

function cancellation(d: TemplateData): RenderedEmail {
	const subject = `【${BRAND}】ご予約キャンセルを承りました #${d.reservationCode}`;
	const fee = d.cancellationFee ?? 0;
	const refund = d.refundAmount ?? 0;
	const inner =
		p(`${d.customerName} 様`) +
		p(`下記のご予約のキャンセルを承りました。`) +
		kv([
			['予約番号', d.reservationCode],
			['車両', d.vehicleName],
			['貸出予定', d.pickupAtJst],
			['キャンセル料', formatJpy(fee)],
			['返金予定額', formatJpy(refund)]
		]) +
		p(`返金は、ご利用のお支払い方法に応じて通常5〜10営業日以内に行われます。`) +
		p(`<span style="color:#5a6472;font-size:12px;">ご不明点は ${SUPPORT} までお問い合わせください。またのご利用を心よりお待ちしております。</span>`);

	const text = `${d.customerName} 様

下記のご予約のキャンセルを承りました。

予約番号: ${d.reservationCode}
車両: ${d.vehicleName}
貸出予定: ${d.pickupAtJst}
キャンセル料: ${formatJpy(fee)}
返金予定額: ${formatJpy(refund)}

返金は通常5〜10営業日以内に行われます。
${footerText(d.baseUrl)}`;

	return { subject, html: shell('ご予約キャンセルを承りました', inner, d.baseUrl), text };
}

function reminder(d: TemplateData): RenderedEmail {
	const subject = `【${BRAND}】明日のご出発のご案内 #${d.reservationCode}`;
	const inner =
		p(`${d.customerName} 様`) +
		p(`いよいよ明日、ご出発の日となりました。お気をつけてお越しください。`) +
		kv([
			['予約番号', d.reservationCode],
			['車両', d.vehicleName],
			['貸出', `${d.pickupAtJst}<br><span style="color:#5a6472;font-size:12px;">${officeLabel(d.pickupOffice)}</span>`],
			['返却', d.returnAtJst]
		]) +
		h2('当日お持ちください') +
		`<ul style="font-size:13px;line-height:1.8;margin:0 0 12px;padding-left:1.2em;color:#333;"><li>運転免許証</li><li>保証金確認用のクレジットカード</li><li>外国籍の方：パスポート・運転資格書類</li></ul>` +
		cta(`${d.baseUrl}/reserve/${d.reservationCode}`, '予約内容・変更');

	const text = `${d.customerName} 様

いよいよ明日、ご出発の日となりました。

予約番号: ${d.reservationCode}
車両: ${d.vehicleName}
貸出: ${d.pickupAtJst}（${officeLabel(d.pickupOffice)}）
返却: ${d.returnAtJst}

当日は運転免許証・クレジットカード（外国籍の方はパスポート・運転資格書類）をお持ちください。

予約内容: ${d.baseUrl}/reserve/${d.reservationCode}
${footerText(d.baseUrl)}`;

	return { subject, html: shell('明日のご出発のご案内', inner, d.baseUrl), text };
}

function staffNewBooking(d: TemplateData): RenderedEmail {
	const subject = `[${BRAND}] 新規予約 #${d.reservationCode} / ${d.vehicleName} / ${d.pickupAtJst}`;
	const inner =
		p(`新規のご予約が確定しました。`) +
		kv([
			['予約番号', d.reservationCode],
			['お客様', d.customerName],
			['車両', d.vehicleName],
			['貸出', d.pickupAtJst],
			['返却', d.returnAtJst],
			['合計', formatJpy(d.total)]
		]) +
		(d.adminUrl ? cta(d.adminUrl, '管理画面で開く') : '');

	const text = `新規のご予約が確定しました。

予約番号: ${d.reservationCode}
お客様: ${d.customerName}
車両: ${d.vehicleName}
貸出: ${d.pickupAtJst}
返却: ${d.returnAtJst}
合計: ${formatJpy(d.total)}
${d.adminUrl ? `\n管理画面: ${d.adminUrl}` : ''}`;

	return { subject, html: shell('新規予約', inner, d.baseUrl), text };
}

export function renderEmail(kind: EmailKind, _locale: Locale, data: TemplateData): RenderedEmail {
	switch (kind) {
		case 'booking_confirmation':
			return bookingConfirmation(data);
		case 'cancellation':
			return cancellation(data);
		case 'reminder':
			return reminder(data);
		case 'staff_new_booking':
			return staffNewBooking(data);
	}
}
