// Trilingual UI dictionary — key-first so every string's three variants sit
// side by side. Marketing long-copy lives in ./marketing.ts, not here.

type Tri = { ja: string; en: string; zh: string };

export const dict = {
	// ---- common / chrome ----
	'common.reserveCta': { ja: '来店予約', en: 'Reserve', zh: '预约到店' },
	'common.back': { ja: '戻る', en: 'Back', zh: '返回' },
	'footer.tagline': {
		ja: '名古屋・西区 国道158号沿い\n車と過ごす時間のためのラウンジ。',
		en: 'Route 158, Nishi-ku, Nagoya.\nA lounge for time spent with cars.',
		zh: '名古屋市西区国道158号沿线\n为与车共度的时光而设的车主俱乐部。'
	},
	'footer.legalPrivacy': { ja: 'プライバシーポリシー', en: 'Privacy Policy', zh: '隐私政策' },
	'footer.legalTokushohou': { ja: '特定商取引法に基づく表記', en: 'Legal Notice', zh: '特定商业交易法标示' },
	'footer.legalTerms': { ja: '貸渡約款', en: 'Terms', zh: '租赁条款' },
	'footer.legalInsurance': { ja: '保険・補償', en: 'Insurance', zh: '保险与保障' },
	'meta.title': {
		ja: 'MILES 158 — 名古屋・西区のカーラウンジ＆カーレンタル',
		en: 'MILES 158 — Car Lounge & Rental · Nagoya',
		zh: 'MILES 158 — 名古屋汽车俱乐部与租车'
	},
	'meta.desc': {
		ja: 'MILES 158 — 名古屋・西区に生まれた車好きのためのカーラウンジ。カーレンタル、クラブコミュニティ、カフェラウンジ、メンテナンス。',
		en: 'MILES 158 — a car lounge in Nishi-ku, Nagoya, for people who love cars. Car rental, club community, cafe lounge and maintenance.',
		zh: 'MILES 158 — 诞生于名古屋西区、为爱车之人而设的汽车俱乐部。汽车租赁、车主社区、咖啡俱乐部与车辆养护。'
	},
	'err.404Title': { ja: 'ページが見つかりません', en: 'Page not found', zh: '未找到页面' },
	'err.404Body': {
		ja: 'お探しのページは移動または削除された可能性があります。',
		en: 'The page you are looking for may have been moved or removed.',
		zh: '您要访问的页面可能已被移动或删除。'
	},
	'err.500Title': { ja: 'エラーが発生しました', en: 'Something went wrong', zh: '发生错误' },
	'err.500Body': {
		ja: '一時的な問題が発生しています。時間をおいて再度お試しください。',
		en: 'A temporary problem occurred. Please try again in a moment.',
		zh: '出现暂时性问题，请稍后重试。'
	},
	'footer.visitNote': {
		ja: 'ご来店・試乗・ご相談はお気軽にお問い合わせください。',
		en: 'Feel free to contact us for visits, test drives and consultations.',
		zh: '到店参观、试驾与咨询，欢迎随时联系我们。'
	},
	'legal.nonJaNotice': {
		ja: '',
		en: 'This page is provided in Japanese. The Japanese text is the authoritative version.',
		zh: '本页面以日文提供，日文版本为正式文本。'
	},

	// ---- home ----
	'home.services': {
		ja: 'カーレンタル / カフェラウンジ / クラブコミュニティ',
		en: 'Car Rental / Cafe Lounge / Club Community',
		zh: '汽车租赁 / 咖啡俱乐部 / 车主社区'
	},
	'home.lead1': { ja: '車と走る喜びをもっと身近に。', en: 'Bringing the joy of driving closer.', zh: '让驾驶的乐趣触手可及。' },
	'home.lead2': { ja: 'さぁ旅にでよう', en: 'Let’s hit the road.', zh: '出发，去旅行吧。' },
	'home.ctaTitle': {
		ja: 'さぁ、カーレンタルで<br class="sp-br" />旅にでよう。',
		en: 'Let’s hit the road<br class="sp-br" /> with a rental car.',
		zh: '出发，租一台车<br class="sp-br" />去旅行吧。'
	},
	'common.viewMore': { ja: '詳しく見る', en: 'Learn more', zh: '了解更多' },
	'home.carsLead': {
		ja: '厳選された2台のトヨタ — 走る喜びを最大化するラインアップです。',
		en: 'Two carefully chosen Toyotas, selected to maximize the joy of driving.',
		zh: '两台精选丰田座驾，将驾驶的乐趣最大化。'
	},
	'home.place': {
		ja: '愛知県名古屋市西区・国道158号沿い',
		en: 'Route 158, Nishi-ku, Nagoya, Aichi',
		zh: '爱知县名古屋市西区国道158号沿线'
	},

	// ---- about ----
	'about.introTitle': {
		ja: 'MILES 158 は、<br />名古屋・西区に生まれた<br />車好きのためのカーラウンジ。',
		en: 'MILES 158 is a car lounge<br />born in Nishi-ku, Nagoya,<br />made for people who love cars.',
		zh: 'MILES 158 诞生于名古屋西区，<br />是一间为爱车之人而设的<br />汽车俱乐部。'
	},
	'about.introBody': {
		ja: '「車と走る喜びをもっと身近に」 ― 私たちが見つめているのは、距離や所有の量ではなく、車と共に流れる時間の質です。カーレンタル、クラブコミュニティ、カフェラウンジ、メンテナンスという4つのサービスを通じて、車と過ごすあらゆる時間を豊かにしていきたいと考えています。',
		en: '“Bringing the joy of driving closer” — what we care about is not distance or ownership, but the quality of time that flows with a car. Through four services — car rental, club community, cafe lounge and maintenance — we want to enrich every moment spent with cars.',
		zh: '“让驾驶的乐趣触手可及”——我们在意的不是里程与拥有，而是与车共度时光的质量。通过汽车租赁、车主社区、咖啡俱乐部与养护这四项服务，让与车相处的每一刻都更加丰盈。'
	},
	'about.companyTitle': { ja: '会社概要', en: 'Company', zh: '公司概要' },
	'about.coName': { ja: '商号', en: 'Name', zh: '名称' },
	'about.coAddress': { ja: '所在地', en: 'Address', zh: '地址' },
	'about.coAddressV': {
		ja: '愛知県名古屋市西区 国道158号沿い',
		en: 'Route 158, Nishi-ku, Nagoya, Aichi, Japan',
		zh: '日本爱知县名古屋市西区 国道158号沿线'
	},
	'about.coBiz': { ja: '事業内容', en: 'Business', zh: '业务内容' },
	'about.coBizV': {
		ja: 'カーレンタル / クラブコミュニティ / カフェラウンジ / メンテナンス',
		en: 'Car Rental / Club Community / Cafe Lounge / Maintenance',
		zh: '汽车租赁 / 车主社区 / 咖啡俱乐部 / 车辆养护'
	},
	'about.coFounded': { ja: '設立', en: 'Founded', zh: '成立' },
	'about.coContact': { ja: 'お問い合わせ', en: 'Contact', zh: '联系方式' },

	// ---- community ----
	'community.placeholder': {
		ja: '※ 入会案内 / メンバー特典 / イベント情報 はこのページに追加予定。',
		en: '※ Membership guide, member benefits and event information will be added here.',
		zh: '※ 入会指南、会员权益与活动信息将陆续在此页面发布。'
	},

	// ---- rental page ----
	'rental.lineup': { ja: '取扱車両と料金', en: 'Fleet & Pricing', zh: '车辆与价格' },
	'rental.flow': { ja: 'ご利用フロー', en: 'How It Works', zh: '使用流程' },
	'rental.conditions': { ja: '必要書類とご利用条件', en: 'Requirements', zh: '所需证件与使用条件' },
	'rental.docs': { ja: '必要書類', en: 'Documents', zh: '所需证件' },
	'rental.reqs': { ja: 'ご利用条件', en: 'Conditions', zh: '使用条件' },
	'rental.comingSoon': {
		ja: '料金・受付開始時期は準備中です。',
		en: 'Pricing and availability are being prepared.',
		zh: '价格与开放时间正在筹备中。'
	},

	// ---- reserve: landing ----
	'rsv.title': { ja: 'ご予約', en: 'Reservation', zh: '在线预约' },
	'rsv.expired': {
		ja: '仮押さえの有効期限（15分）が切れたため、お手続きを最初からやり直してください。選択いただいた日程は解放されています。',
		en: 'Your 15-minute hold has expired — please start over. The dates you selected have been released.',
		zh: '15 分钟的临时锁定已过期，请重新操作。您选择的日期已被释放。'
	},
	'rsv.s1': { ja: '運転免許の確認', en: 'Driver’s License', zh: '确认驾照' },
	'rsv.s1Lead': {
		ja: '日本国内での運転可否を確認します。お持ちの運転免許の種類をお選びください。',
		en: 'First, let’s confirm you can drive in Japan. Select the type of license you hold.',
		zh: '首先确认您能否在日本驾车。请选择您持有的驾照类型。'
	},
	'rsv.docsTitle': { ja: 'ご来店時にご用意いただくもの', en: 'Please bring on the day', zh: '到店时请携带' },
	'rsv.s2': { ja: '車両を選ぶ', en: 'Choose Your Car', zh: '选择车辆' },
	'rsv.perDay': { ja: '1日', en: 'per day', zh: '每日' },
	'rsv.fromPrice': { ja: '{price}〜', en: 'From {price}', zh: '{price} 起' },
	'rsv.stepperAria': { ja: '予約ステップ', en: 'Reservation steps', zh: '预约步骤' },
	'rsv.taxExcl': { ja: '(税抜)', en: '(excl. tax)', zh: '（不含税）' },
	'rsv.s3': { ja: '期間を選ぶ', en: 'Choose Your Dates', zh: '选择日期' },
	'rsv.pickupTime': { ja: '貸出時刻', en: 'Pickup time', zh: '取车时间' },
	'rsv.returnTime': { ja: '返却時刻', en: 'Return time', zh: '还车时间' },
	'rsv.calTaxNote': {
		ja: '※ カレンダーの料金はすべて税抜表示です（消費税は右の合計に含みます）。金土日は週末料金、繁忙期は割増となります。',
		en: '※ Calendar prices exclude tax (tax is included in the total). Fri–Sun and peak seasons carry a surcharge.',
		zh: '※ 日历所示价格均不含税（合计中已含消费税）。周五至周日及旺季有加价。'
	},
	'rsv.calLeadNote': {
		ja: '※ オンライン予約はご利用開始の3日前まで承ります。3日以内のご利用は',
		en: '※ Online booking closes 3 days before pickup. For sooner dates, please ',
		zh: '※ 在线预约最晚受理至用车前 3 天。3 天以内的用车请'
	},
	'rsv.calLeadLink': { ja: 'お電話・メールにてお問い合わせ', en: 'contact us by phone or email', zh: '来电或邮件咨询' },
	'rsv.calLeadTail': { ja: 'ください。', en: '.', zh: '。' },
	'rsv.cartTitle': { ja: 'ご予約内容', en: 'Your Booking', zh: '预约内容' },
	'rsv.cartRental': { ja: 'レンタル料金（{d}日）', en: 'Rental ({d} days)', zh: '租金（{d} 天）' },
	'rsv.cartDiscount': { ja: '長期割引 {p}%', en: 'Long-stay {p}% off', zh: '长租折扣 {p}%' },
	'rsv.cartTax': { ja: '消費税', en: 'Tax', zh: '消费税' },
	'rsv.cartSubtotal': { ja: '小計', en: 'Subtotal', zh: '小计' },
	'rsv.cartNote': {
		ja: 'オプション・補償は次の画面で追加できます。別途、保証金 {dep} を与信枠として確保します。',
		en: 'Options and coverage can be added on the next screen. A {dep} deposit will be held on your card.',
		zh: '选装与保障可在下一步添加。另将以信用卡预授权方式冻结押金 {dep}。'
	},
	'rsv.cartEmpty': {
		ja: 'カレンダーで貸出日と返却日を選択してください。',
		en: 'Select your pickup and return dates on the calendar.',
		zh: '请在日历中选择取车与还车日期。'
	},
	'rsv.proceed': { ja: 'この内容で進む', en: 'Continue', zh: '继续' },
	'rsv.errIneligible': {
		ja: 'ご選択の免許では予約手続きを進められません。',
		en: 'Bookings cannot proceed with the selected license type.',
		zh: '所选驾照类型无法继续预约。'
	},
	'rsv.errDates': { ja: '車両と期間を正しく選択してください。', en: 'Please select a car and valid dates.', zh: '请正确选择车辆与日期。' },
	'rsv.errLead': {
		ja: 'ご利用開始まで3日未満のご予約はオンラインでは承れません。お電話・メールにてお問い合わせください。',
		en: 'Online bookings must be made at least 3 days before pickup. Please contact us by phone or email.',
		zh: '距取车不足 3 天时无法在线预约，请来电或邮件咨询。'
	},
	'rsv.errTaken': {
		ja: '申し訳ありません。この車両は選択期間に予約できません。',
		en: 'Sorry — this car is not available for the selected dates.',
		zh: '抱歉，所选日期该车辆无法预约。'
	},

	// ---- stepper ----
	'step.1': { ja: '車両・期間', en: 'Car & Dates', zh: '车辆/日期' },
	'step.2': { ja: 'オプション・お客様情報', en: 'Options & Details', zh: '选装/客户信息' },
	'step.3': { ja: 'お支払い', en: 'Payment', zh: '支付' },
	'step.4': { ja: '完了', en: 'Done', zh: '完成' },

	// ---- calendar ----
	'cal.open': { ja: '空き', en: 'Available', zh: '可约' },
	'cal.booked': { ja: '予約済み', en: 'Booked', zh: '已约满' },
	'cal.soon': { ja: '直前は要電話', en: 'Call for near dates', zh: '近期请来电' },
	'cal.selected': { ja: '選択中', en: 'Selected', zh: '已选择' },
	'cal.soonTip': {
		ja: 'オンライン予約はご利用開始3日前まで（3日以内はお電話で）',
		en: 'Online booking closes 3 days before pickup; within 3 days, please call us.',
		zh: '在线预约最晚受理至用车前 3 天，3 天以内请来电。'
	},
	'cal.rangeBlocked': {
		ja: '選択期間に予約済みの日が含まれます。別の期間をお選びください。',
		en: 'Your range includes booked days — please choose different dates.',
		zh: '所选期间包含已约满的日期，请重新选择。'
	},
	'cal.prev': { ja: '前の月', en: 'Previous month', zh: '上个月' },
	'cal.next': { ja: '次の月', en: 'Next month', zh: '下个月' },

	// ---- configure ----
	'cfg.title': { ja: 'オプションとお客様情報', en: 'Options & Your Details', zh: '选装与客户信息' },
	'cfg.days': { ja: '{d}日', en: '{d} days', zh: '{d} 天' },
	'cfg.coverage': { ja: '補償', en: 'Coverage', zh: '保障' },
	'cfg.coverageLink': { ja: '補償内容について ↗', en: 'About coverage ↗', zh: '保障说明 ↗' },
	'cfg.cdw': { ja: '車両補償（CDW）', en: 'Collision Damage Waiver (CDW)', zh: '车辆免赔保障（CDW）' },
	'cfg.noc': { ja: 'NOC（営業補償）免除', en: 'NOC (downtime fee) waiver', zh: 'NOC（营业损失）免除' },
	'cfg.perDaySuffix': { ja: '/ 日', en: '/ day', zh: '/ 天' },
	'cfg.perRentalSuffix': { ja: '/ 回', en: '/ rental', zh: '/ 次' },
	'cfg.options': { ja: 'オプション', en: 'Options', zh: '选装' },
	'cfg.customer': { ja: 'お客様情報（借受人・運転者）', en: 'Your Details (renter & driver)', zh: '客户信息（承租人/驾驶人）' },
	'cfg.fFamily': { ja: '姓 *', en: 'Family name *', zh: '姓 *' },
	'cfg.fGiven': { ja: '名 *', en: 'Given name *', zh: '名 *' },
	'cfg.fEmail': { ja: 'メール *', en: 'Email *', zh: '邮箱 *' },
	'cfg.fPhone': { ja: '電話 *', en: 'Phone *', zh: '电话 *' },
	'cfg.fAddress': { ja: '住所 *', en: 'Address *', zh: '地址 *' },
	'cfg.fLicense': { ja: '免許番号 *', en: 'License number *', zh: '驾照号码 *' },
	'cfg.fLicenseType': { ja: '免許種類', en: 'License class', zh: '驾照类型' },
	'cfg.fLicenseExp': { ja: '免許有効期限', en: 'License expiry', zh: '驾照有效期' },
	'cfg.fPassengers': { ja: '乗車人数', en: 'Passengers', zh: '乘车人数' },
	'cfg.fNationality': { ja: '国籍', en: 'Nationality', zh: '国籍' },
	'cfg.fPassport': { ja: 'パスポート番号', en: 'Passport number', zh: '护照号码' },
	'cfg.fEntry': { ja: '入国日', en: 'Date of entry to Japan', zh: '入境日本日期' },
	'cfg.price': { ja: '料金', en: 'Price', zh: '费用' },
	'cfg.coverageLine': { ja: '補償', en: 'Coverage', zh: '保障' },
	'cfg.optionsLine': { ja: 'オプション', en: 'Options', zh: '选装' },
	'cfg.total': { ja: '合計', en: 'Total', zh: '合计' },
	'cfg.depositNote': {
		ja: '別途、保証金 {dep} を与信枠として確保します（ご返却後に解放）。',
		en: 'A {dep} deposit is held on your card and released after return.',
		zh: '另以信用卡预授权冻结押金 {dep}，还车后解除。'
	},
	'cfg.mileageNote': {
		ja: '走行距離は1日300kmまで含み、超過分は1kmにつき¥55を申し受けます。',
		en: 'Mileage includes 300km per day; excess is billed at ¥55/km.',
		zh: '每日含 300km 里程，超出部分按每公里 ¥55 收费。'
	},
	'cfg.submit': { ja: '確認画面へ進む', en: 'Continue to payment', zh: '前往支付' },
	'cfg.back': { ja: '← 車両選択に戻る', en: '← Back to car selection', zh: '← 返回选择车辆' },
	'cfg.errRequired': { ja: '必須項目をすべてご入力ください。', en: 'Please fill in all required fields.', zh: '请填写所有必填项。' },
	'cfg.errTaken': {
		ja: '選択期間がちょうど埋まりました。別の期間でお試しください。',
		en: 'Those dates were just taken — please try different dates.',
		zh: '所选日期刚被预订，请尝试其他日期。'
	},

	// ---- payment ----
	'pay.title': { ja: 'お支払い', en: 'Payment', zh: '支付' },
	'pay.mock': {
		ja: 'これはテスト決済（疑似）です。Stripe 連携前のため、実際の請求は発生しません。',
		en: 'This is a test (mock) payment — no real charge will be made until Stripe is connected.',
		zh: '当前为测试（模拟）支付，接入 Stripe 前不会产生真实扣款。'
	},
	'pay.cancelPolicy': { ja: 'キャンセルポリシー', en: 'Cancellation Policy', zh: '取消政策' },
	'pay.noShow': { ja: '無連絡不来店（ノーショー）', en: 'No-show', zh: '未到店（无联络）' },
	'pay.feeNote': {
		ja: '※ キャンセル料はレンタル基本料金を基準に計算します。',
		en: '※ Cancellation fees are calculated on the base rental price.',
		zh: '※ 取消费按基础租金计算。'
	},
	'pay.iv.sameday': { ja: '当日', en: 'Same day', zh: '当天' },
	'pay.iv.1to2': { ja: '1〜2日前', en: '1–2 days before', zh: '1〜2 天前' },
	'pay.iv.3to6': { ja: '3〜6日前', en: '3–6 days before', zh: '3〜6 天前' },
	'pay.iv.7plus': { ja: '7日以上前', en: '7+ days before pickup', zh: '提前 7 天以上' },
	'pay.iv.noshow': { ja: '無連絡不来店（ノーショー）', en: 'No-show', zh: '未到店（无联络）' },
	'pay.method': { ja: 'お支払い方法', en: 'Payment Method', zh: '支付方式' },
	'pay.card': { ja: 'クレジットカード', en: 'Credit card', zh: '信用卡' },
	'pay.walletNote': {
		ja: 'WeChat Pay / Alipay は保証金の与信保留ができないため、保証金は即時課金され、ご返却後に返金されます。',
		en: 'WeChat Pay / Alipay can’t hold a deposit, so the deposit is charged now and refunded after return.',
		zh: '微信支付／支付宝无法做押金预授权，押金将先行扣款，还车后退还。'
	},
	'pay.total': { ja: 'お支払い合計', en: 'Total', zh: '支付合计' },
	'pay.deposit': { ja: '保証金（与信）', en: 'Deposit (hold)', zh: '押金（预授权）' },
	'pay.depositNote': {
		ja: '保証金 {dep} はクレジットカードの与信枠として確保するもので、請求は行いません。ご返却確認後、通常5〜10営業日を目安に解放されます。',
		en: 'The {dep} deposit is an authorization hold on your card, not a charge. It is released within approximately 5–10 business days after the return is confirmed.',
		zh: '押金 {dep} 仅为信用卡预授权冻结，不会实际扣款。确认还车后，通常约 5〜10 个工作日内解除。'
	},
	'pay.langNote': {
		ja: '※ 各規約の正文は日本語版です。',
		en: 'The Japanese text is the official version of these terms.',
		zh: '相关条款以日文版本为准。'
	},
	'pay.agreePre': { ja: '', en: 'I agree to the ', zh: '我同意' },
	'pay.terms': { ja: '貸渡約款', en: 'Rental Terms', zh: '《租赁条款》' },
	'pay.and': { ja: '・', en: ' and ', zh: '与' },
	'pay.privacy': { ja: 'プライバシーポリシー', en: 'Privacy Policy', zh: '《隐私政策》' },
	'pay.agreePost': { ja: 'に同意します', en: '.', zh: '。' },
	'pay.submit': { ja: '予約を確定する', en: 'Confirm booking', zh: '确认预约' },
	'pay.back': { ja: '← 入力に戻る', en: '← Back', zh: '← 返回修改' },
	'pay.errAgree': { ja: '貸渡約款への同意が必要です。', en: 'Please agree to the rental terms.', zh: '请先同意租赁条款。' },
	'pay.errState': { ja: 'この予約は決済できない状態です。', en: 'This booking can’t be paid in its current state.', zh: '该预约当前状态无法支付。' },
	'pay.errFailed': { ja: '決済に失敗しました。もう一度お試しください。', en: 'Payment failed — please try again.', zh: '支付失败，请重试。' },

	// ---- confirmation ----
	'done.confirmedEyebrow': { ja: 'Reservation Confirmed', en: 'Reservation Confirmed', zh: 'Reservation Confirmed' },
	'done.confirmedTitle': { ja: 'ご予約ありがとうございます', en: 'Thank you — your booking is confirmed', zh: '感谢您的预约，已确认' },
	'done.cancelledTitle': { ja: 'このご予約はキャンセルされています', en: 'This booking has been cancelled', zh: '该预约已取消' },
	'done.completedTitle': { ja: 'ご利用ありがとうございました', en: 'Thank you for renting with us', zh: '感谢您的使用' },
	'done.pickup': { ja: '貸出', en: 'Pickup', zh: '取车' },
	'done.return': { ja: '返却', en: 'Return', zh: '还车' },
	'done.total': { ja: 'お支払い合計', en: 'Total', zh: '支付合计' },
	'done.deposit': { ja: '保証金（与信）', en: 'Deposit (hold)', zh: '押金（预授权）' },
	'done.nextConfirmed': {
		ja: 'ご予約確認メールをお送りしました。当日は MILES 158 ラウンジにて、必要書類のご提示と車両確認のうえお引き渡しいたします。',
		en: 'A confirmation email is on its way. On the day, we’ll check your documents and the car together at the MILES 158 lounge before handover.',
		zh: '确认邮件已发送。取车当日请携带证件到 MILES 158 门店，核验后交车。'
	},
	'done.nextCancelled': {
		ja: 'このご予約はキャンセル済みです。返金がある場合は、お支払い方法に応じて通常5〜10営業日以内に処理されます。再度のご予約は<a href="{href}">こちら</a>から。',
		en: 'This booking is cancelled. Any refund is processed within 5–10 business days depending on your payment method. Book again <a href="{href}">here</a>.',
		zh: '该预约已取消。如有退款，通常将在 5〜10 个工作日内按原支付方式退回。再次预约请点击<a href="{href}">这里</a>。'
	},
	'done.home': { ja: 'トップへ戻る', en: 'Back to Home', zh: '返回首页' },

	// ---- dashboard chrome ----
	'dash.navTimeline': { ja: 'タイムライン', en: 'Calendar', zh: '预约日历' },
	'dash.navBookings': { ja: '予約一覧', en: 'Bookings', zh: '预约列表' },
	'dash.navVehicles': { ja: '車両', en: 'Vehicles', zh: '车辆' },
	'dash.logout': { ja: 'ログアウト', en: 'Log out', zh: '退出登录' },
	'dash.title': { ja: '予約カレンダー', en: 'Booking Calendar', zh: '预约日历' },
	'dash.manualCta': { ja: '＋ 手動予約', en: '+ Manual booking', zh: '＋ 手动预约' },
	'dash.sumHeld': { ja: '仮押さえ', en: 'Held', zh: '临时锁定' },
	'dash.sumConfirmed': { ja: '確定', en: 'Confirmed', zh: '已确认' },
	'dash.sumCheckedOut': { ja: '貸出', en: 'Out', zh: '已交车' },
	'dash.sumActive': { ja: '貸出中', en: 'Active', zh: '租赁中' },
	'dash.sumReturned': { ja: '返却検査', en: 'Inspection', zh: '还车检查' },
	'dash.sumCompleted': { ja: '完了', en: 'Completed', zh: '已完成' },
	'dash.legRental': { ja: '予約', en: 'Booking', zh: '预约' },
	'dash.legBuffer': { ja: '整備バッファ', en: 'Turnaround', zh: '整备缓冲' },
	'dash.legBlackout': { ja: '予約不可', en: 'Blocked', zh: '不可预约' },
	'dash.legHint': {
		ja: '空き日をクリックで「予約不可」に切替（保存するまで反映されません）',
		en: 'Click an open day to toggle “blocked” — changes apply when you save.',
		zh: '点击空闲日期切换为“不可预约”——保存后生效。'
	},
	'dash.pending': { ja: '未保存', en: 'Unsaved', zh: '未保存' },
	'dash.errSaveMissing': {
		ja: '保存に必要な情報が不足しています。',
		en: 'Missing information required to save.',
		zh: '缺少保存所需的信息。'
	},
	'dash.savedMsg': { ja: '保存しました（追加 {a} 件 / 解除 {r} 件）。', en: 'Saved ({a} added / {r} removed).', zh: '已保存（新增 {a} 项/解除 {r} 项）。' },
	'dash.conflictMsg': {
		ja: '次の日付は予約が入っているため設定できませんでした：{days}',
		en: 'These days are booked and could not be blocked: {days}',
		zh: '以下日期已有预约，无法设为不可预约：{days}'
	},
	'dash.unsaved': { ja: '未保存の変更 {n} 件', en: '{n} unsaved change(s)', zh: '未保存的更改 {n} 项' },
	'dash.allSaved': { ja: 'すべて保存済み', en: 'All changes saved', zh: '已全部保存' },
	'dash.reset': { ja: 'リセット', en: 'Reset', zh: '重置' },
	'dash.save': { ja: '保存する', en: 'Save', zh: '保存' },
	'dash.navGuard': {
		ja: '未保存の変更があります。移動すると破棄されます。続けますか？',
		en: 'You have unsaved changes — leaving will discard them. Continue?',
		zh: '存在未保存的更改，离开将丢失。是否继续？'
	},
	'dash.cellMaint': { ja: '整備', en: 'Maint.', zh: '整备' },
	'dash.cellBlocked': { ja: '予約不可', en: 'Blocked', zh: '不可预约' },
	'dash.cellBlockedX': { ja: '予約不可 ✕', en: 'Blocked ✕', zh: '不可预约 ✕' },
	'dash.cellAdd': { ja: '＋不可', en: '+ block', zh: '＋设不可' },
	'dash.tipUnblock': { ja: 'クリックで解除', en: 'Click to unblock', zh: '点击解除' },
	'dash.tipBlock': { ja: 'クリックで予約不可にする', en: 'Click to block', zh: '点击设为不可预约' },

	// ---- dashboard: bookings list ----
	'bk.title': { ja: '予約一覧', en: 'Bookings', zh: '预约列表' },
	'bk.search': { ja: '予約番号で検索', en: 'Search by code', zh: '按预约号搜索' },
	'bk.allStatus': { ja: 'すべての状態', en: 'All statuses', zh: '全部状态' },
	'bk.filter': { ja: '絞り込み', en: 'Filter', zh: '筛选' },
	'bk.hCode': { ja: '予約番号', en: 'Code', zh: '预约号' },
	'bk.hStatus': { ja: '状態', en: 'Status', zh: '状态' },
	'bk.hVehicle': { ja: '車両', en: 'Vehicle', zh: '车辆' },
	'bk.hCustomer': { ja: 'お客様', en: 'Customer', zh: '客户' },
	'bk.hPickup': { ja: '貸出', en: 'Pickup', zh: '取车' },
	'bk.hReturn': { ja: '返却', en: 'Return', zh: '还车' },
	'bk.hTotal': { ja: '合計', en: 'Total', zh: '合计' },
	'bk.empty': { ja: '該当する予約がありません。', en: 'No bookings found.', zh: '没有符合条件的预约。' },

	// ---- dashboard: detail ----
	'dt.back': { ja: '← 予約一覧', en: '← Bookings', zh: '← 预约列表' },
	'dt.vehiclePeriod': { ja: '車両・期間', en: 'Vehicle & Period', zh: '车辆/期间' },
	'dt.customer': { ja: 'お客様（借受人）', en: 'Customer (renter)', zh: '客户（承租人）' },
	'dt.price': { ja: '料金', en: 'Price', zh: '费用' },
	'dt.payments': { ja: '決済・返金', en: 'Payments & Refunds', zh: '支付/退款' },
	'dt.history': { ja: '履歴', en: 'History', zh: '历史记录' },
	'dt.actions': { ja: '操作', en: 'Actions', zh: '操作' },
	'dt.kVehicle': { ja: '車両', en: 'Vehicle', zh: '车辆' },
	'dt.kPickup': { ja: '貸出', en: 'Pickup', zh: '取车' },
	'dt.kReturn': { ja: '返却', en: 'Return', zh: '还车' },
	'dt.kMileage': { ja: '走行', en: 'Mileage', zh: '里程' },
	'dt.kName': { ja: '氏名', en: 'Name', zh: '姓名' },
	'dt.kContact': { ja: '連絡先', en: 'Contact', zh: '联系方式' },
	'dt.kAddress': { ja: '住所', en: 'Address', zh: '地址' },
	'dt.kLicense': { ja: '免許', en: 'License', zh: '驾照' },
	'dt.kBase': { ja: '基本', en: 'Base', zh: '基础租金' },
	'dt.kOptions': { ja: 'オプション・補償', en: 'Options & coverage', zh: '选装/保障' },
	'dt.kTax': { ja: '消費税', en: 'Tax', zh: '消费税' },
	'dt.kTotal': { ja: '合計', en: 'Total', zh: '合计' },
	'dt.kDeposit': { ja: '保証金', en: 'Deposit', zh: '押金' },
	'dt.kCancelFee': { ja: 'キャンセル料', en: 'Cancellation fee', zh: '取消费' },
	'dt.kMileageOverage': {
		ja: '走行距離超過（1日300km・超過¥55/km）',
		en: 'Mileage overage (300km/day incl., ¥55/km beyond)',
		zh: '超里程费（每日含 300km，超出 ¥55/km）'
	},
	'dt.none': { ja: 'なし', en: 'None', zh: '无' },
	'dt.unregistered': { ja: '未登録', en: 'Not registered', zh: '未登记' },
	'dt.noActions': { ja: 'この予約に対する操作はありません。', en: 'No actions available for this booking.', zh: '该预约当前没有可执行的操作。' },
	'dt.mOutKm': { ja: '出発時 走行(km)', en: 'Mileage out (km)', zh: '出发里程(km)' },
	'dt.mOutFuel': { ja: '出発時 燃料(0-8)', en: 'Fuel out (0–8)', zh: '出发油量(0-8)' },
	'dt.mInKm': { ja: '返却時 走行(km)', en: 'Mileage in (km)', zh: '还车里程(km)' },
	'dt.mInFuel': { ja: '返却時 燃料(0-8)', en: 'Fuel in (0–8)', zh: '还车油量(0-8)' },
	'dt.cancelBtn': { ja: 'キャンセル（返金）', en: 'Cancel (refund)', zh: '取消（退款）' },
	'dt.cancelConfirm': {
		ja: 'キャンセルしますか？キャンセル料が自動計算され、差額が返金されます。',
		en: 'Cancel this booking? The fee is calculated automatically and the balance refunded.',
		zh: '确定取消？系统将自动计算取消费并退还差额。'
	},
	'tr.quote': { ja: '見積に戻す', en: 'Back to quote', zh: '退回报价' },
	'tr.held': { ja: '仮押さえに戻す', en: 'Back to held', zh: '退回锁定' },
	'tr.pending_payment': { ja: '決済中にする', en: 'Mark paying', zh: '标记支付中' },
	'tr.confirmed': { ja: '確定にする', en: 'Mark confirmed', zh: '标记已确认' },
	'tr.checked_out': { ja: '出発（貸渡）', en: 'Check out (handover)', zh: '出发（交车）' },
	'tr.active': { ja: '貸出中にする', en: 'Mark active', zh: '标记租赁中' },
	'tr.returned': { ja: '返却（検査）', en: 'Return (inspect)', zh: '还车（检查）' },
	'tr.completed': { ja: '精算完了', en: 'Settle & complete', zh: '结算完成' },
	'tr.no_show': { ja: '不来店にする', en: 'Mark no-show', zh: '标记未到店' },

	// ---- dashboard: manual booking ----
	'nb.back': { ja: '← タイムライン', en: '← Calendar', zh: '← 预约日历' },
	'nb.title': { ja: '手動予約（スタッフ代理）', en: 'Manual Booking (staff)', zh: '手动预约（员工代录）' },
	'nb.lead': {
		ja: '電話・WeChat 等で受けた予約をその場で登録します。確定済みとして在庫を確保し、お支払いはオフラインで処理します。',
		en: 'Register bookings taken by phone / WeChat. Inventory is secured as confirmed; payment is handled offline.',
		zh: '现场录入电话/微信渠道的预约。录入即确认并锁定库存，付款线下处理。'
	},
	'nb.errRequired': {
		ja: '車両・期間・お名前は必須です。',
		en: 'Vehicle, dates and name are required.',
		zh: '车辆、日期与姓名为必填项。'
	},
	'nb.errNoVehicle': { ja: '車両が見つかりません。', en: 'Vehicle not found.', zh: '未找到该车辆。' },
	'nb.errTaken': {
		ja: '選択期間はすでに予約済みです。',
		en: 'Those dates are already booked.',
		zh: '所选期间已被预约。'
	},
	'nb.vehicle': { ja: '車両', en: 'Vehicle', zh: '车辆' },
	'nb.select': { ja: '選択', en: 'Select', zh: '请选择' },
	'nb.pickupDate': { ja: '貸出日', en: 'Pickup date', zh: '取车日期' },
	'nb.returnDate': { ja: '返却日', en: 'Return date', zh: '还车日期' },
	'nb.time': { ja: '時刻', en: 'Time', zh: '时间' },
	'nb.family': { ja: '姓', en: 'Family name', zh: '姓' },
	'nb.given': { ja: '名', en: 'Given name', zh: '名' },
	'nb.phone': { ja: '電話', en: 'Phone', zh: '电话' },
	'nb.email': { ja: 'メール', en: 'Email', zh: '邮箱' },
	'nb.cdw': { ja: '車両補償（CDW）を付帯', en: 'Include CDW coverage', zh: '附加车辆保障（CDW）' },
	'nb.submit': { ja: '予約を登録（確定）', en: 'Register (confirm)', zh: '登记预约（确认）' },

	// ---- dashboard: vehicles ----
	'vh.title': { ja: '車両管理', en: 'Vehicles', zh: '车辆管理' },
	'vh.hName': { ja: '車名', en: 'Vehicle', zh: '车名' },
	'vh.hClass': { ja: 'クラス', en: 'Class', zh: '级别' },
	'vh.hReg': { ja: '登録番号', en: 'Plate', zh: '牌照号' },
	'vh.hStatus': { ja: '状態', en: 'Status', zh: '状态' },
	'vh.stActive': { ja: '稼働', en: 'Active', zh: '运营中' },
	'vh.stMaint': { ja: '整備', en: 'Maintenance', zh: '维修中' },
	'vh.stRetired': { ja: '退役', en: 'Retired', zh: '已退役' },
	'vh.addTitle': { ja: '車両を追加', en: 'Add vehicle', zh: '新增车辆' },
	'vh.fName': { ja: '車名', en: 'Name', zh: '车名' },
	'vh.fSubtitle': { ja: 'サブタイトル', en: 'Subtitle', zh: '副标题' },
	'vh.fClass': { ja: 'クラス', en: 'Class', zh: '级别' },
	'vh.fReg': { ja: '登録番号', en: 'Plate number', zh: '牌照号' },
	'vh.fColor': { ja: 'カラー', en: 'Color', zh: '颜色' },
	'vh.add': { ja: '追加', en: 'Add', zh: '添加' },
	'vh.added': { ja: '追加しました。', en: 'Added.', zh: '已添加。' },
	'vh.errRequired': {
		ja: '車名・クラス・登録番号は必須です。',
		en: 'Name, class and plate number are required.',
		zh: '车名、级别与牌照号为必填项。'
	},
	'vh.errDupReg': {
		ja: 'この登録番号は既に存在します。',
		en: 'This plate number already exists.',
		zh: '该牌照号已存在。'
	},
	'vh.errBadStatus': { ja: '不正な状態です。', en: 'Invalid status.', zh: '状态无效。' },

	// ---- login ----
	'lg.setupTitle': { ja: '管理者の初期設定', en: 'Set up the first admin', zh: '初始化管理员' },
	'lg.setupLead': { ja: '最初の管理者アカウントを作成します。', en: 'Create the first administrator account.', zh: '创建第一个管理员账号。' },
	'lg.name': { ja: 'お名前', en: 'Name', zh: '姓名' },
	'lg.email': { ja: 'メールアドレス', en: 'Email', zh: '邮箱' },
	'lg.password': { ja: 'パスワード', en: 'Password', zh: '密码' },
	'lg.password8': { ja: 'パスワード（8文字以上）', en: 'Password (8+ characters)', zh: '密码（8 位以上）' },
	'lg.createBtn': { ja: '作成してログイン', en: 'Create & log in', zh: '创建并登录' },
	'lg.loginTitle': { ja: 'ログイン', en: 'Log in', zh: '登录' },
	'lg.loginBtn': { ja: 'ログイン', en: 'Log in', zh: '登录' },
	'lg.errBadCreds': {
		ja: 'メールアドレスまたはパスワードが違います。',
		en: 'Incorrect email or password.',
		zh: '邮箱或密码不正确。'
	},
	'lg.errExists': {
		ja: 'すでに管理者が存在します。',
		en: 'An administrator already exists.',
		zh: '管理员已存在。'
	},
	'lg.errWeak': {
		ja: 'メールアドレスと8文字以上のパスワードを入力してください。',
		en: 'Enter an email address and a password of at least 8 characters.',
		zh: '请输入邮箱和至少 8 位的密码。'
	},

	// ---- status labels ----
	'st.draft': { ja: '下書き', en: 'Draft', zh: '草稿' },
	'st.quote': { ja: '見積', en: 'Quote', zh: '报价' },
	'st.held': { ja: '仮押さえ', en: 'Held', zh: '临时锁定' },
	'st.pending_payment': { ja: '決済中', en: 'Paying', zh: '支付中' },
	'st.confirmed': { ja: '確定', en: 'Confirmed', zh: '已确认' },
	'st.checked_out': { ja: '貸出', en: 'Out', zh: '已交车' },
	'st.active': { ja: '貸出中', en: 'Active', zh: '租赁中' },
	'st.returned': { ja: '返却検査', en: 'Inspection', zh: '还车检查' },
	'st.completed': { ja: '完了', en: 'Completed', zh: '已完成' },
	'st.cancelled': { ja: 'キャンセル', en: 'Cancelled', zh: '已取消' },
	'st.no_show': { ja: '不来店', en: 'No-show', zh: '未到店' }
} as const satisfies Record<string, Tri>;

export type DictKey = keyof typeof dict;
