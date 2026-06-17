/* ========================================
   AISubHub - Main Application
   ======================================== */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    // Products data
    products: {
      chatgpt: [
        {
          id: 'gpt-plus',
          name: 'ChatGPT Plus',
          price: 12,
          originalPrice: 20,
          currency: 'USD',
          period: 'month',
          savePercent: 40,
          badge: 'Save 40%',
          features: [
            'Access to GPT-5, GPT-4o & Image 2',
            'Codex CLI & Codex App support',
            'Projects & custom GPTs',
            'Up to 5x more capacity than free',
            'No credentials required — secure',
          ],
          featured: false,
        },
        {
          id: 'gpt-pro-60',
          name: 'ChatGPT Pro',
          price: 60,
          originalPrice: 200,
          currency: 'USD',
          period: 'month',
          savePercent: 70,
          badge: 'Save 70%',
          features: [
            'Unlimited GPT-5 Pro access',
            '5x usage vs Plus plan',
            'Priority access to new features',
            'Codex unlimited usage',
            'Best for demanding workflows',
          ],
          featured: false,
        },
        {
          id: 'gpt-pro-120',
          name: 'ChatGPT Pro',
          price: 120,
          originalPrice: 200,
          currency: 'USD',
          period: 'month',
          savePercent: 40,
          badge: 'Save 40%',
          features: [
            'Unlimited GPT-5 Pro access',
            '10x usage vs Plus plan ($200 tier)',
            'Priority access to new features',
            'Codex unlimited usage',
            'Built for teams & power users',
          ],
          featured: true,
        },
      ],
      claude: [
        {
          id: 'claude-pro',
          name: 'Claude Pro',
          price: 12,
          originalPrice: 20,
          currency: 'USD',
          period: 'month',
          savePercent: 40,
          badge: 'Save 40%',
          features: [
            'Access to Claude Opus 4.8 & Sonnet',
            'Higher usage limits than free tier',
            'Projects & knowledge base',
            'Priority during peak usage',
            'No credentials required',
          ],
          featured: false,
        },
        {
          id: 'claude-max',
          name: 'Claude Max',
          price: 60,
          originalPrice: 100,
          currency: 'USD',
          period: 'month',
          savePercent: 40,
          badge: 'Save 40%',
          features: [
            'All Pro features + extended usage',
            '5x more conversations than Pro',
            'Longer context windows',
            'Priority support',
            'Best for heavy daily use',
          ],
          featured: true,
        },
      ],
      gemini: [
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          price: 12,
          originalPrice: 20,
          currency: 'USD',
          period: 'month',
          savePercent: 40,
          badge: 'Save 40%',
          features: [
            'Access to Gemini Ultra & Pro 2.0',
            '1TB Google Drive storage',
            'Integration with Google ecosystem',
            'Advanced data analysis',
            'No credentials required',
          ],
          featured: false,
        },
      ],
    },

    // Languages
    languages: {
      en: { label: 'English', flag: '🇬🇧', dir: 'ltr' },
      'zh-CN': { label: '中文', flag: '🇨🇳', dir: 'ltr' },
      ru: { label: 'Русский', flag: '🇷🇺', dir: 'ltr' },
      de: { label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
      es: { label: 'Español', flag: '🇪🇸', dir: 'ltr' },
      fr: { label: 'Français', flag: '🇫🇷', dir: 'ltr' },
      ar: { label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
      ja: { label: '日本語', flag: '🇯🇵', dir: 'ltr' },
    },

    // FAQ data
    faq: [
      {
        q: 'Is this a personal account subscription? Not a mirror/shared account?',
        a: 'Yes, it\'s credited directly to your personal account — not a mirror or shared account. You use your own login credentials.',
      },
      {
        q: 'How do I get a refund if there\'s an issue?',
        a: 'Go to [Order Lookup] → enter the contact info you provided at checkout → copy the order number and contact [Support]. We offer full refund if recharge fails.',
      },
      {
        q: 'Is this safe? Will my account get banned?',
        a: 'We use official gift card and enterprise channels to complete the recharge — no account credentials required at any point, all handled automatically. If recharge fails, immediate full refund is issued.',
      },
      {
        q: 'Why don\'t I need to enter my account credentials?',
        a: 'After placing your order, the card key and redemption guide are sent to your email. Simply redeem it with your own account to activate — no need to share credentials.',
      },
      {
        q: 'After recharging, it still shows "Upgrade" — why hasn\'t it taken effect?',
        a: 'Try refreshing the page or logging out and back in (re-logging often helps). If it still hasn\'t taken effect, check your account settings or contact support with a screenshot.',
      },
    ],
  };

  // ============================================
  // State
  // ============================================
  let state = {
    currentLang: 'en',
    currentProduct: 'chatgpt',
    selectedProduct: null,
    selectedPayment: null,
    orderStep: 'form', // 'form' | 'payment' | 'success'
    captchaValue: '',
    serviceFeePercent: 0.8,
    timerInterval: null,
    timerSeconds: 900, // 15 minutes
    orderNumber: null,
  };

  // ============================================
  // Affiliate / Referral Tracking
  // ============================================
  const AFFILIATE_KEY = 'aisubhub_affiliate';
  const REF_CLICKS_KEY = 'aisubhub_ref_clicks';

  function getAffiliateData() {
    try {
      const d = localStorage.getItem(AFFILIATE_KEY);
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  }

  function saveAffiliateData(data) {
    try { localStorage.setItem(AFFILIATE_KEY, JSON.stringify(data)); } catch {}
  }

  function getRefClicks() {
    try {
      const d = localStorage.getItem(REF_CLICKS_KEY);
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  }

  function saveRefClicks(clicks) {
    try { localStorage.setItem(REF_CLICKS_KEY, JSON.stringify(clicks)); } catch {}
  }

  /**
   * Track an incoming referral click from URL param `?ref=USERNAME`
   * Stores ref in sessionStorage for attribution, records click in affiliate's data
   */
  function trackReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref || !/^[a-zA-Z0-9_]+$/.test(ref)) return;

    // Store current referral in sessionStorage (persists during this visit)
    try { sessionStorage.setItem('aisubhub_ref', ref); } catch {}

    // Record click in affiliate's localStorage data
    const refClicks = getRefClicks();
    // Dedup: only record one click per ref per session
    const existing = refClicks.find(c => c.ref === ref && c.session === getSessionId());
    if (!existing) {
      refClicks.push({
        ref: ref,
        time: new Date().toISOString(),
        session: getSessionId(),
        action: 'click',
        page: window.location.pathname || '/',
      });
      saveRefClicks(refClicks);

      // Also update the affiliate's own stats (if they're logged in as affiliate)
      const affData = getAffiliateData();
      if (affData && affData.username !== ref) {
        // This is a different affiliate's click — only update if we have their data
        // (In a real system this would go to a server)
      }
    }
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('aisubhub_sid');
    if (!sid) {
      sid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      sessionStorage.setItem('aisubhub_sid', sid);
    }
    return sid;
  }

  function getCurrentRef() {
    try { return sessionStorage.getItem('aisubhub_ref'); } catch { return null; }
  }

  // ============================================
  // DOM Cache
  // ============================================
  let DOM = {};

  function cacheDOM() {
    DOM = {
      // Header
      langToggle: document.getElementById('langToggle'),
      langMenu: document.getElementById('langMenu'),
      menuToggle: document.getElementById('menuToggle'),
      mobileNav: document.getElementById('mobileNav'),

      // Products
      productTabs: document.querySelectorAll('.product-tab'),
      productGrids: {
        chatgpt: document.querySelector('#tab-chatgpt .product-grid'),
        claude: document.querySelector('#tab-claude .product-grid'),
        gemini: document.querySelector('#tab-gemini .product-grid'),
      },
      tabPanes: document.querySelectorAll('.tab-pane'),

      // Modal
      modalOverlay: document.getElementById('modalOverlay'),
      modalBody: document.getElementById('modalBody'),
      modalClose: document.getElementById('modalClose'),

      // FAQ
      faqContainer: document.getElementById('faqContainer'),

      // Trust section (for stats animation)
      stats: document.querySelectorAll('.stat-number'),

      // Support widget
      supportBtn: document.getElementById('supportBtn'),
      supportPanel: document.getElementById('supportPanel'),
      supportClose: document.getElementById('supportClose'),
      supportTabs: document.querySelectorAll('.support-tab'),
      supportPanes: document.querySelectorAll('.support-pane'),

      // Toast
      toast: document.getElementById('toast'),
    };
  }

  // ============================================
  // I18n (lightweight)
  // ============================================
  const i18n = {
    en: {
      hero_title: 'Premium AI Subscriptions,\nAt Wholesale Prices',
      hero_sub: 'Top up your personal ChatGPT, Claude, or Gemini account with crypto — no credentials needed, instant delivery.',
      orders_completed: 'Completed Orders',
      service_uptime: 'Service Availability',
      avg_activation: 'Average Activation',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      buy: 'Buy',
      per_month: '/mo',
      per_year: '/yr',
      why_title: 'Why Choose AISubHub',
      trust_guarantee: 'Full Refund Guarantee',
      trust_guarantee_desc: '100% full refund guaranteed if recharge fails — shop with complete confidence.',
      trust_crypto: 'Crypto Payment',
      trust_crypto_desc: 'Every transaction recorded on the blockchain — transparent, verifiable, tamper-proof.',
      trust_safe: 'Safe & Reliable',
      trust_safe_desc: 'Official recharge channels — no credentials required, your account stays yours.',
      trust_savings: 'Maximum Savings',
      trust_savings_desc: 'Bulk procurement passes the savings directly to you — up to 40% off retail.',
      faq_title: 'Frequently Asked Questions',
      footer_tagline: 'Safe, simple, and on-chain — buy AI subscriptions with crypto.',
      footer_nav: 'Navigation',
      footer_contact: 'Contact',
      footer_languages: 'Languages',
      order_lookup: 'Order Lookup',
      affiliate: 'Affiliate',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      now_buying: 'Now Buying',
      product_amount: 'Product Amount',
      service_fee: 'Service Fee',
      waived: 'Waived',
      amount_due: 'Amount Due',
      choose_payment: 'Choose Payment Method',
      delivery_email: 'Delivery Email',
      email_placeholder: 'you@example.com',
      email_hint: 'Used to deliver your product and look up your order (no marketing).',
      verification_code: 'Verification Code',
      captcha_hint: 'Enter the 4 digits shown in the image. Click to refresh.',
      confirm_order: 'Confirm Order',
      agree_terms: 'By clicking "Confirm Order" you agree to the',
      and: 'and',
      order_created: 'Order Created — Complete Your Payment',
      pay_within: 'Pay within',
      minutes: 'minutes',
      seconds: 'seconds',
      receiving_address: 'Receiving Address',
      copy: 'Copy',
      copied: 'Copied!',
      send_exact: 'Send the exact amount to the address above using the corresponding network.',
      view_order: 'View Order',
      done: 'Done',
      order_success_title: 'Order Placed Successfully!',
      order_success_desc: 'Please complete the payment within the time limit. Once we confirm the transfer on-chain, you\'ll receive an email with your subscription.',
      support_title: 'Support',
      support_message: 'Message',
      support_faq: 'FAQ',
      support_name: 'Name (optional)',
      support_email: 'Email (optional)',
      support_subject: 'Subject (optional)',
      support_message_placeholder: 'Your question or message…',
      support_send: 'Send',
      support_sent: 'Message sent — we\'ll get back to you shortly.',
      copied_address: 'Address copied to clipboard!',
      // Product descriptions
      gpt_plus_desc: 'Official channel recharge — one-click upgrade for personal accounts.',
      gpt_pro_desc: 'Unlock the full power of GPT-5 Pro with priority access.',
      claude_pro_desc: 'Access Claude\'s latest models at a fraction of the retail price.',
      claude_max_desc: 'Extended usage limits for power users who need more.',
      gemini_pro_desc: 'Google\'s most capable AI models with Drive storage included.',
      toast_order_created: 'Order #{{number}} created successfully!',
      toast_payment_method: 'Please select a payment method',
      // Nav
      nav_products: 'Products',
      nav_orders: 'Orders',
      nav_faq: 'FAQ',
      // Footer
      footer_legal: 'Legal',
      refund_policy: 'Refund Policy',
      complete_order: 'Complete Order',
      support_reply: 'We reply as soon as we can.',
      share_label: 'Share:',
      // FAQ
      faq_q_0: 'Is this my own personal account subscription?',
      faq_a_0: 'Yes, it\'s credited directly to your personal account — not a mirror or shared account.',
      faq_q_1: 'How do I get a refund if there\'s an issue?',
      faq_a_1: 'Go to Order Lookup → enter your contact info → copy the order number and contact Support. We offer full refund if recharge fails.',
      faq_q_2: 'Is this safe? Will my account get banned?',
      faq_a_2: 'We use official gift card and enterprise channels — no account credentials required. If recharge fails, immediate full refund.',
      faq_q_3: 'Why don\'t I need to enter my account credentials?',
      faq_a_3: 'After placing your order, the card key and redemption guide are sent to your email. Simply redeem it with your own account.',
      faq_q_4: 'After recharging, it still shows "Upgrade" — why hasn\'t it taken effect?',
      faq_a_4: 'Try refreshing the page or logging out and back in. If it still hasn\'t taken effect, contact support with a screenshot.',
      // Support FAQ
      sfq_q_refund: 'How do I get a refund?',
      sfq_a_refund: 'Go to Order Lookup → enter your contact info → copy the order number and contact Support.',
      sfq_q_safe: 'Is it safe? Will my account get banned?',
      sfq_a_safe: 'We use official channels. No credentials needed. If recharge fails, immediate refund.',
    },
    'zh-CN': {
      hero_title: '高级 AI 订阅\n全场批发价',
      hero_sub: '用加密货币充值你的 ChatGPT、Claude 或 Gemini 个人账户 — 无需密码，极速到账。',
      orders_completed: '已完成订单',
      service_uptime: '服务可用性',
      avg_activation: '平均激活',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      buy: '购买',
      per_month: '/月',
      why_title: '为什么选择 AISubHub',
      trust_guarantee: '全额退款保障',
      trust_guarantee_desc: '充值失败 100% 全额退款 — 放心下单。',
      trust_crypto: '加密货币支付',
      trust_crypto_desc: '每笔交易记录在区块链上 — 透明可查，不可篡改。',
      trust_safe: '安全可靠',
      trust_safe_desc: '官方充值渠道 — 无需提供账户密码，你的账户安全无忧。',
      trust_savings: '最大优惠',
      trust_savings_desc: '批量采购将省下的费用直接让利给你 — 最高省 40%。',
      faq_title: '常见问题',
      footer_tagline: '安全、简单、上链 — 用加密货币购买 AI 订阅。',
      footer_nav: '导航',
      footer_contact: '联系我们',
      footer_languages: '语言',
      order_lookup: '订单查询',
      affiliate: '推广联盟',
      terms: '服务条款',
      privacy: '隐私政策',
      now_buying: '正在购买',
      product_amount: '商品金额',
      service_fee: '服务费',
      waived: '免收',
      amount_due: '应付金额',
      choose_payment: '选择支付方式',
      delivery_email: '接收邮箱',
      email_placeholder: 'you@example.com',
      email_hint: '用于接收商品和查询订单（不会发送营销邮件）。',
      verification_code: '验证码',
      captcha_hint: '输入图片中的 4 位数字。点击图片刷新。',
      confirm_order: '确认订单',
      agree_terms: '点击"确认订单"即表示你同意',
      and: '和',
      order_created: '订单已创建 — 请完成支付',
      pay_within: '请在',
      minutes: '分钟',
      seconds: '秒',
      receiving_address: '收款地址',
      copy: '复制',
      copied: '已复制！',
      send_exact: '请使用对应网络将准确金额发送到以上地址。',
      view_order: '查看订单',
      done: '完成',
      order_success_title: '下单成功！',
      order_success_desc: '请在有效时间内完成支付。链上确认到账后，你将收到包含订阅信息的邮件。',
      support_title: '客服支持',
      support_message: '留言',
      support_faq: 'FAQ',
      support_name: '姓名（可选）',
      support_email: '邮箱（可选）',
      support_subject: '主题（可选）',
      support_message_placeholder: '你的问题或留言…',
      support_send: '发送',
      support_sent: '消息已发送 — 我们会尽快回复。',
      copied_address: '地址已复制到剪贴板！',
      gpt_plus_desc: '官方渠道充值，一键升级 Plus 个人账户。',
      gpt_pro_desc: '解锁 GPT-5 Pro 全部能力，优先体验新功能。',
      claude_pro_desc: '以零售价零头获得 Claude 最新模型访问权限。',
      claude_max_desc: '为重度用户提供更多使用额度。',
      gemini_pro_desc: 'Google 最强 AI 模型，附带云端存储空间。',
      toast_order_created: '订单 #{{number}} 创建成功！',
      toast_payment_method: '请选择支付方式',
      // Nav
      nav_products: '商品',
      nav_orders: '订单',
      nav_faq: '常见问题',
      // Footer
      footer_legal: '法律条款',
      refund_policy: '退款政策',
      complete_order: '完成订单',
      support_reply: '我们会尽快回复。',
      share_label: '分享：',
      // FAQ
      faq_q_0: '这是个人账户订阅吗？不是共享账户？',
      faq_a_0: '是的，直接充值到你的个人账户 — 不是镜像或共享账户。',
      faq_q_1: '有问题怎么退款？',
      faq_a_1: '前往"订单查询" → 输入下单时留的联系方式 → 复制订单号联系客服。充值失败全额退款。',
      faq_q_2: '安全吗？账号会被封吗？',
      faq_a_2: '我们通过官方礼品卡和企业渠道完成充值 — 全程无需账户密码。如果充值失败，立即全额退款。',
      faq_q_3: '为什么不需要输入账户密码？',
      faq_a_3: '下单后，卡密和兑换指南会发送到你的邮箱。用你自己的账户兑换即可激活 — 无需分享凭证。',
      faq_q_4: '充值后还显示"Upgrade" — 为什么没生效？',
      faq_a_4: '尝试刷新页面或重新登录。如果仍未生效，请联系客服并提供截图。',
      sfq_q_refund: '如何退款？',
      sfq_a_refund: '前往"订单查询" → 输入联系方式 → 复制订单号并联系客服。',
      sfq_q_safe: '安全吗？账号会被封吗？',
      sfq_a_safe: '我们使用官方渠道。无需密码。充值失败立即退款。',
    },
    de: {
      hero_title: 'Premium AI-Abos\nzum Großhandelspreis',
      hero_sub: 'Lade dein persönliches ChatGPT-, Claude- oder Gemini-Konto mit Krypto auf — keine Zugangsdaten nötig, sofortige Lieferung.',
      orders_completed: 'Abgeschlossene Bestellungen',
      service_uptime: 'Verfügbarkeit',
      avg_activation: 'Durchschn. Aktivierung',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      buy: 'Kaufen',
      per_month: '/Monat',
      why_title: 'Warum AISubHub?',
      trust_guarantee: 'Geld-zurück-Garantie',
      trust_guarantee_desc: '100% vollständige Rückerstattung, falls die Aufladung fehlschlägt — kauf mit völligem Vertrauen.',
      trust_crypto: 'Krypto-Zahlung',
      trust_crypto_desc: 'Jede Transaktion wird auf der Blockchain aufgezeichnet — transparent, überprüfbar, manipulationssicher.',
      trust_safe: 'Sicher & Zuverlässig',
      trust_safe_desc: 'Offizielle Aufladekanäle — keine Zugangsdaten erforderlich, dein Konto bleibt deins.',
      trust_savings: 'Maximale Ersparnis',
      trust_savings_desc: 'Großeinkäufe geben die Ersparnis direkt an dich weiter — bis zu 40% Rabatt.',
      faq_title: 'Häufig gestellte Fragen',
      footer_tagline: 'Sicher, einfach und auf der Blockchain — KI-Abos mit Krypto kaufen.',
      footer_nav: 'Navigation',
      footer_contact: 'Kontakt',
      footer_languages: 'Sprachen',
      order_lookup: 'Bestellung suchen',
      affiliate: 'Affiliate',
      terms: 'Nutzungsbedingungen',
      privacy: 'Datenschutz',
      now_buying: 'Jetzt kaufen',
      product_amount: 'Produktbetrag',
      service_fee: 'Servicegebühr',
      waived: 'Erlassen',
      amount_due: 'Gesamtbetrag',
      choose_payment: 'Zahlungsmethode wählen',
      delivery_email: 'E-Mail für Lieferung',
      email_placeholder: 'you@example.com',
      email_hint: 'Wird für die Lieferung und Bestellungssuche verwendet (kein Marketing).',
      verification_code: 'Verifizierungscode',
      captcha_hint: 'Gib die 4 Ziffern aus dem Bild ein. Klicke zum Aktualisieren.',
      confirm_order: 'Bestellung bestätigen',
      agree_terms: 'Mit Klick auf "Bestellung bestätigen" stimmst du den',
      and: 'und',
      order_created: 'Bestellung erstellt — Zahlung abschließen',
      pay_within: 'Zahlen innerhalb',
      minutes: 'Minuten',
      seconds: 'Sekunden',
      receiving_address: 'Empfangsadresse',
      copy: 'Kopieren',
      copied: 'Kopiert!',
      send_exact: 'Sende den genauen Betrag an die obige Adresse über das entsprechende Netzwerk.',
      view_order: 'Bestellung ansehen',
      done: 'Fertig',
      order_success_title: 'Bestellung erfolgreich aufgegeben!',
      order_success_desc: 'Bitte schließe die Zahlung innerhalb der Frist ab. Sobald wir die Überweisung auf der Chain bestätigt haben, erhältst du eine E-Mail mit deinem Abo.',
      support_title: 'Support',
      support_message: 'Nachricht',
      support_faq: 'FAQ',
      support_name: 'Name (optional)',
      support_email: 'E-Mail (optional)',
      support_subject: 'Betreff (optional)',
      support_message_placeholder: 'Deine Frage oder Nachricht…',
      support_send: 'Senden',
      support_sent: 'Nachricht gesendet — wir melden uns bald bei dir.',
      copied_address: 'Adresse in die Zwischenablage kopiert!',
      gpt_plus_desc: 'Offizieller Kanal — One-Click-Upgrade für persönliche Konten.',
      gpt_pro_desc: 'Schalte die volle Leistung von GPT-5 Pro frei.',
      claude_pro_desc: 'Zugriff auf Cluades neueste Modelle zu einem Bruchteil des Preises.',
      claude_max_desc: 'Erweiterte Nutzungslimits für Power-User.',
      gemini_pro_desc: 'Googles leistungsfähigste KI-Modelle inklusive Cloud-Speicher.',
      toast_order_created: 'Bestellung #{{number}} erfolgreich erstellt!',
      toast_payment_method: 'Bitte wähle eine Zahlungsmethode',
      nav_products: 'Produkte',
      nav_orders: 'Bestellungen',
      nav_faq: 'FAQ',
      footer_legal: 'Rechtliches',
      refund_policy: 'Rückgaberecht',
      complete_order: 'Bestellung abschließen',
      support_reply: 'Wir antworten so schnell wie möglich.',
      share_label: 'Teilen:',
      faq_q_0: 'Ist das ein persönliches Account-Abonnement?',
      faq_a_0: 'Ja, es wird direkt deinem persönlichen Konto gutgeschrieben.',
      faq_q_1: 'Wie erhalte ich eine Rückerstattung?',
      faq_a_1: 'Gehe zur Bestellungssuche, gib deine Kontaktdaten ein und kontaktiere den Support.',
      faq_q_2: 'Ist das sicher? Wird mein Konto gesperrt?',
      faq_a_2: 'Wir verwenden offizielle Kanäle. Keine Zugangsdaten erforderlich. Bei Fehlschlag sofortige Rückerstattung.',
      faq_q_3: 'Warum muss ich keine Zugangsdaten eingeben?',
      faq_a_3: 'Nach der Bestellung erhältst du den Schlüssel per E-Mail. Mit deinem eigenen Konto einlösen.',
      faq_q_4: 'Nach der Aufladung wird immer noch "Upgrade" angezeigt?',
      faq_a_4: 'Seite aktualisieren oder neu anmelden. Kontaktiere bei Problemen den Support.',
      sfq_q_refund: 'Wie erhalte ich eine Rückerstattung?',
      sfq_a_refund: 'Gehe zur Bestellungssuche, gib deine Daten ein und kontaktiere den Support.',
      sfq_q_safe: 'Ist das sicher? Wird mein Konto gesperrt?',
      sfq_a_safe: 'Wir verwenden offizielle Kanäle. Keine Zugangsdaten nötig. Sofortige Rückerstattung.',
    },
    es: {
      hero_title: 'Suscripciones AI Premium\na Precios de Mayoreo',
      hero_sub: 'Recarga tu cuenta personal de ChatGPT, Claude o Gemini con cripto — sin necesidad de credenciales, entrega instantánea.',
      orders_completed: 'Pedidos Completados',
      service_uptime: 'Disponibilidad',
      avg_activation: 'Activación Promedio',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      buy: 'Comprar',
      per_month: '/mes',
      why_title: '¿Por qué AISubHub?',
      trust_guarantee: 'Garantía de Reembolso',
      trust_guarantee_desc: '100% de reembolso si la recarga falla — compra con total confianza.',
      trust_crypto: 'Pago con Cripto',
      trust_crypto_desc: 'Cada transacción registrada en la blockchain — transparente, verificable, a prueba de manipulaciones.',
      trust_safe: 'Seguro y Confiable',
      trust_safe_desc: 'Canales de recarga oficiales — no se requieren credenciales, tu cuenta sigue siendo tuya.',
      trust_savings: 'Máximo Ahorro',
      trust_savings_desc: 'Las compras al por mayor te pasan el ahorro directamente — hasta 40% de descuento.',
      faq_title: 'Preguntas Frecuentes',
      footer_tagline: 'Seguro, simple y en cadena — compra suscripciones AI con cripto.',
      footer_nav: 'Navegación',
      footer_contact: 'Contacto',
      footer_languages: 'Idiomas',
      order_lookup: 'Buscar Pedido',
      affiliate: 'Afiliados',
      terms: 'Términos de Servicio',
      privacy: 'Política de Privacidad',
      now_buying: 'Comprando',
      product_amount: 'Monto del Producto',
      service_fee: 'Comisión de Servicio',
      waived: 'Exento',
      amount_due: 'Total a Pagar',
      choose_payment: 'Elige Método de Pago',
      delivery_email: 'Correo de Entrega',
      email_placeholder: 'you@example.com',
      email_hint: 'Se usa para entregar tu producto y consultar tu pedido (sin marketing).',
      verification_code: 'Código de Verificación',
      captcha_hint: 'Ingresa los 4 dígitos de la imagen. Haz clic para actualizar.',
      confirm_order: 'Confirmar Pedido',
      agree_terms: 'Al hacer clic en "Confirmar Pedido" aceptas los',
      and: 'y',
      order_created: 'Pedido Creado — Completa tu Pago',
      pay_within: 'Pagar dentro de',
      minutes: 'minutos',
      seconds: 'segundos',
      receiving_address: 'Dirección de Recepción',
      copy: 'Copiar',
      copied: '¡Copiado!',
      send_exact: 'Envía el monto exacto a la dirección usando la red correspondiente.',
      view_order: 'Ver Pedido',
      done: 'Listo',
      order_success_title: '¡Pedido Realizado con Éxito!',
      order_success_desc: 'Completa el pago dentro del plazo. Cuando confirmemos la transferencia en la chain, recibirás un correo con tu suscripción.',
      support_title: 'Soporte',
      support_message: 'Mensaje',
      support_faq: 'FAQ',
      support_name: 'Nombre (opcional)',
      support_email: 'Correo (opcional)',
      support_subject: 'Asunto (opcional)',
      support_message_placeholder: 'Tu pregunta o mensaje…',
      support_send: 'Enviar',
      support_sent: 'Mensaje enviado — te responderemos pronto.',
      copied_address: '¡Dirección copiada al portapapeles!',
      gpt_plus_desc: 'Recarga por canal oficial — actualización con un clic para cuentas personales.',
      gpt_pro_desc: 'Desbloquea todo el poder de GPT-5 Pro.',
      claude_pro_desc: 'Accede a los últimos modelos de Claude a una fracción del precio.',
      claude_max_desc: 'Límites de uso extendidos para usuarios avanzados.',
      gemini_pro_desc: 'Los modelos AI más potentes de Google con almacenamiento en la nube.',
      toast_order_created: '¡Pedido #{{number}} creado exitosamente!',
      toast_payment_method: 'Por favor selecciona un método de pago',
      nav_products: 'Productos',
      nav_orders: 'Pedidos',
      nav_faq: 'FAQ',
      footer_legal: 'Legal',
      refund_policy: 'Política de Reembolso',
      complete_order: 'Completar Pedido',
      support_reply: 'Respondemos tan pronto como sea posible.',
      share_label: 'Compartir:',
      faq_q_0: '¿Es una suscripción de cuenta personal?',
      faq_a_0: 'Sí, se acredita directamente a tu cuenta personal.',
      faq_q_1: '¿Cómo obtengo un reembolso?',
      faq_a_1: 'Ve a Buscar Pedido, ingresa tus datos y contacta al Soporte.',
      faq_q_2: '¿Es seguro? ¿Me pueden banear?',
      faq_a_2: 'Usamos canales oficiales. Sin credenciales. Reembolso inmediato si falla.',
      faq_q_3: '¿Por qué no necesito ingresar credenciales?',
      faq_a_3: 'La clave se envía a tu email. Canjéala con tu propia cuenta.',
      faq_q_4: 'Después de recargar, aún muestra "Upgrade"',
      faq_a_4: 'Actualiza la página o vuelve a iniciar sesión. Contacta al soporte si persiste.',
      sfq_q_refund: '¿Cómo obtener un reembolso?',
      sfq_a_refund: 'Ve a Buscar Pedido, ingresa tus datos y contacta al Soporte.',
      sfq_q_safe: '¿Es seguro? ¿Me pueden banear?',
      sfq_a_safe: 'Usamos canales oficiales. Sin credenciales. Reembolso inmediato.',
    },
    fr: {
      hero_title: 'Abonnements AI Premium\naux Prix de Gros',
      hero_sub: 'Recharge ton compte personnel ChatGPT, Claude ou Gemini avec crypto — sans identifiants, livraison instantanée.',
      orders_completed: 'Commandes terminées',
      service_uptime: 'Disponibilité',
      avg_activation: 'Activation moyenne',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      buy: 'Acheter',
      per_month: '/mois',
      why_title: 'Pourquoi AISubHub ?',
      trust_guarantee: 'Garantie de Remboursement',
      trust_guarantee_desc: 'Remboursement intégral à 100% si le rechargement échoue — achète en toute confiance.',
      trust_crypto: 'Paiement Crypto',
      trust_crypto_desc: 'Chaque transaction enregistrée sur la blockchain — transparente, vérifiable, inviolable.',
      trust_safe: 'Sûr & Fiable',
      trust_safe_desc: 'Canaux de recharge officiels — aucun identifiant requis, ton compte reste le tien.',
      trust_savings: 'Économies Maximales',
      trust_savings_desc: 'Les achats en gros te reversent directement les économies — jusqu\'à 40% de réduction.',
      faq_title: 'Questions Fréquentes',
      footer_tagline: 'Sûr, simple et sur la chaîne — achète des abonnements AI avec crypto.',
      footer_nav: 'Navigation',
      footer_contact: 'Contact',
      footer_languages: 'Langues',
      order_lookup: 'Rechercher commande',
      affiliate: 'Affiliation',
      terms: 'Conditions d\'utilisation',
      privacy: 'Politique de confidentialité',
      now_buying: 'Achat en cours',
      product_amount: 'Montant du produit',
      service_fee: 'Frais de service',
      waived: 'Exempté',
      amount_due: 'Montant dû',
      choose_payment: 'Choisir le mode de paiement',
      delivery_email: 'Email de livraison',
      email_placeholder: 'you@example.com',
      email_hint: 'Utilisé pour livrer ton produit et consulter ta commande (pas de marketing).',
      verification_code: 'Code de vérification',
      captcha_hint: 'Saisis les 4 chiffres de l\'image. Clique pour actualiser.',
      confirm_order: 'Confirmer la commande',
      agree_terms: 'En cliquant sur "Confirmer la commande" tu acceptes les',
      and: 'et',
      order_created: 'Commande créée — Effectue ton paiement',
      pay_within: 'Payer dans',
      minutes: 'minutes',
      seconds: 'secondes',
      receiving_address: 'Adresse de réception',
      copy: 'Copier',
      copied: 'Copié !',
      send_exact: 'Envoie le montant exact à l\'adresse ci-dessus en utilisant le réseau correspondant.',
      view_order: 'Voir la commande',
      done: 'Terminé',
      order_success_title: 'Commande passée avec succès !',
      order_success_desc: 'Veuillez effectuer le paiement dans les délais. Dès confirmation du transfert sur la chaîne, vous recevrez un email avec votre abonnement.',
      support_title: 'Support',
      support_message: 'Message',
      support_faq: 'FAQ',
      support_name: 'Nom (facultatif)',
      support_email: 'Email (facultatif)',
      support_subject: 'Sujet (facultatif)',
      support_message_placeholder: 'Ta question ou message…',
      support_send: 'Envoyer',
      support_sent: 'Message envoyé — nous te répondrons rapidement.',
      copied_address: 'Adresse copiée dans le presse-papiers !',
      gpt_plus_desc: 'Recharge par canal officiel — mise à niveau en un clic pour comptes personnels.',
      gpt_pro_desc: 'Débloque toute la puissance de GPT-5 Pro.',
      claude_pro_desc: 'Accède aux derniers modèles Claude à une fraction du prix.',
      claude_max_desc: 'Limites d\'utilisation étendues pour les utilisateurs intensifs.',
      gemini_pro_desc: 'Les modèles AI les plus puissants de Google avec stockage cloud inclus.',
      toast_order_created: 'Commande #{{number}} créée avec succès !',
      toast_payment_method: 'Veuillez sélectionner un mode de paiement',
      nav_products: 'Produits',
      nav_orders: 'Commandes',
      nav_faq: 'FAQ',
      footer_legal: 'Mentions légales',
      refund_policy: 'Politique de remboursement',
      complete_order: 'Finaliser la commande',
      support_reply: 'Nous répondons dès que possible.',
      share_label: 'Partager :',
      faq_q_0: 'Est-ce un abonnement personnel ?',
      faq_a_0: 'Oui, crédité directement sur ton compte personnel.',
      faq_q_1: 'Comment obtenir un remboursement ?',
      faq_a_1: 'Va à Rechercher commande, entre tes coordonnées et contacte le Support.',
      faq_q_2: 'Est-ce sûr ? Mon compte sera-t-il banni ?',
      faq_a_2: 'Nous utilisons des canaux officiels. Aucun identifiant requis. Remboursement immédiat.',
      faq_q_3: 'Pourquoi n\'ai-je pas besoin d\'identifiants ?',
      faq_a_3: 'La clé est envoyée par email. Utilise-la avec ton propre compte.',
      faq_q_4: 'Après recharge, "Upgrade" s\'affiche encore ?',
      faq_a_4: 'Actualise la page ou reconnecte-toi. Contacte le support si nécessaire.',
      sfq_q_refund: 'Comment obtenir un remboursement ?',
      sfq_a_refund: 'Va à Rechercher commande, entre tes coordonnées et contacte le Support.',
      sfq_q_safe: 'Est-ce sûr ? Mon compte sera-t-il banni ?',
      sfq_a_safe: 'Nous utilisons des canaux officiels. Aucun identifiant requis. Remboursement immédiat.',
    },
    ar: {
      hero_title: 'اشتراكات الذكاء الاصطناعي المميزة\nبأسعار الجملة',
      hero_sub: 'اشحن حسابك الشخصي في ChatGPT أو Claude أو Gemini بالعملات الرقمية — بدون حاجة لبيانات الدخول، توصيل فوري.',
      orders_completed: 'الطلبات المكتملة',
      service_uptime: 'توفر الخدمة',
      avg_activation: 'متوسط التفعيل',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      buy: 'شراء',
      per_month: '/شهر',
      why_title: 'لماذا AISubHub؟',
      trust_guarantee: 'ضمان استرداد كامل',
      trust_guarantee_desc: 'استرداد كامل 100% إذا فشل الشحن — تسوق بثقة تامة.',
      trust_crypto: 'دفع بالعملات الرقمية',
      trust_crypto_desc: 'كل معاملة مسجلة على البلوكتشين — شفافة، قابلة للتحقق، ومقاومة للتلاعب.',
      trust_safe: 'آمن وموثوق',
      trust_safe_desc: 'قنوات شحن رسمية — لا حاجة لبيانات الدخول، حسابك يبقى لك.',
      trust_savings: 'أقصى توفير',
      trust_savings_desc: 'الشراء بالجملة ينقل التوفير إليك مباشرة — خصم يصل إلى 40%.',
      faq_title: 'الأسئلة الشائعة',
      footer_tagline: 'آمن، بسيط، وعلى السلسلة — اشتر اشتراكات الذكاء الاصطناعي بالعملات الرقمية.',
      footer_nav: 'التنقل',
      footer_contact: 'اتصل بنا',
      footer_languages: 'اللغات',
      order_lookup: 'البحث عن طلب',
      affiliate: 'التسويق بالعمولة',
      terms: 'شروط الخدمة',
      privacy: 'سياسة الخصوصية',
      now_buying: 'الشراء الآن',
      product_amount: 'قيمة المنتج',
      service_fee: 'رسوم الخدمة',
      waived: 'معفاة',
      amount_due: 'المبلغ المستحق',
      choose_payment: 'اختر طريقة الدفع',
      delivery_email: 'البريد الإلكتروني للتوصيل',
      email_placeholder: 'you@example.com',
      email_hint: 'يستخدم لتوصيل منتجك والبحث عن طلبك (بدون تسويق).',
      verification_code: 'رمز التحقق',
      captcha_hint: 'أدخل الأرقام الأربعة الظاهرة في الصورة. انقر للتحديث.',
      confirm_order: 'تأكيد الطلب',
      agree_terms: 'بالنقر على "تأكيد الطلب" فإنك توافق على',
      and: 'و',
      order_created: 'تم إنشاء الطلب — أكمل الدفع',
      pay_within: 'الدفع خلال',
      minutes: 'دقائق',
      seconds: 'ثوان',
      receiving_address: 'عنوان الاستلام',
      copy: 'نسخ',
      copied: 'تم النسخ!',
      send_exact: 'أرسل المبلغ المحدد إلى العنوان أعلاه باستخدام الشبكة المناسبة.',
      view_order: 'عرض الطلب',
      done: 'تم',
      order_success_title: 'تم تقديم الطلب بنجاح!',
      order_success_desc: 'يرجى إكمال الدفع خلال المهلة المحددة. بمجرد تأكيد التحويل على السلسلة، ستتلقى بريداً إلكترونياً يحتوي على اشتراكك.',
      support_title: 'الدعم',
      support_message: 'رسالة',
      support_faq: 'الأسئلة الشائعة',
      support_name: 'الاسم (اختياري)',
      support_email: 'البريد الإلكتروني (اختياري)',
      support_subject: 'الموضوع (اختياري)',
      support_message_placeholder: 'سؤالك أو رسالتك…',
      support_send: 'إرسال',
      support_sent: 'تم إرسال الرسالة — سنرد عليك قريباً.',
      copied_address: 'تم نسخ العنوان إلى الحافظة!',
      gpt_plus_desc: 'شحن عبر القنوات الرسمية — ترقية بنقرة واحدة للحسابات الشخصية.',
      gpt_pro_desc: 'أطلق العنان لقوة GPT-5 Pro الكاملة.',
      claude_pro_desc: 'الوصول إلى أحدث نماذج Claude بجزء بسيط من السعر.',
      claude_max_desc: 'حدود استخدام موسعة للمستخدمين المكثفين.',
      gemini_pro_desc: 'نماذج الذكاء الاصطناعي الأكثر قدرة من Google مع تخزين سحابي.',
      toast_order_created: 'تم إنشاء الطلب #{{number}} بنجاح!',
      toast_payment_method: 'يرجى اختيار طريقة دفع',
      nav_products: 'المنتجات',
      nav_orders: 'الطلبات',
      nav_faq: 'الأسئلة الشائعة',
      footer_legal: 'قانوني',
      refund_policy: 'سياسة الاسترداد',
      complete_order: 'إكمال الطلب',
      support_reply: 'نرد في أقرب وقت ممكن.',
      share_label: 'مشاركة:',
      faq_q_0: 'هل هذا اشتراك حساب شخصي؟',
      faq_a_0: 'نعم، يُضاف مباشرة إلى حسابك الشخصي.',
      faq_q_1: 'كيف أحصل على استرداد؟',
      faq_a_1: 'اذهب إلى البحث عن طلب، أدخل بياناتك وتواصل مع الدعم.',
      faq_q_2: 'هل هذا آمن؟ هل سيتم حظر حسابي؟',
      faq_a_2: 'نستخدم قنوات رسمية. لا حاجة لبيانات الدخول. استرداد فوري في حالة الفشل.',
      faq_q_3: 'لماذا لا أحتاج لإدخال بيانات الدخول؟',
      faq_a_3: 'يتم إرسال المفتاح إلى بريدك الإلكتروني. استخدمه مع حسابك الخاص.',
      faq_q_4: 'بعد الشحن، لا يزال يظهر "ترقية"؟',
      faq_a_4: 'قم بتحديث الصفحة أو إعادة تسجيل الدخول. تواصل مع الدعم إذا استمرت المشكلة.',
      sfq_q_refund: 'كيف أحصل على استرداد؟',
      sfq_a_refund: 'اذهب إلى البحث عن طلب، أدخل بياناتك وتواصل مع الدعم.',
      sfq_q_safe: 'هل هذا آمن؟ هل سيتم حظر حسابي؟',
      sfq_a_safe: 'نستخدم قنوات رسمية. لا حاجة لبيانات الدخول. استرداد فوري.',
    },
    ja: {
      hero_title: 'プレミアムAIサブスクリプション\n卸売価格で',
      hero_sub: '暗号通貨でChatGPT、Claude、Geminiの個人アカウントをチャージ — 認証情報不要、即時配信。',
      orders_completed: '完了済み注文',
      service_uptime: 'サービス稼働率',
      avg_activation: '平均アクティベーション',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      buy: '購入',
      per_month: '/月',
      why_title: 'AISubHubを選ぶ理由',
      trust_guarantee: '全額返金保証',
      trust_guarantee_desc: 'チャージ失敗時は100%全額返金 — 安心してお買い求めください。',
      trust_crypto: '暗号通貨支払い',
      trust_crypto_desc: 'すべての取引はブロックチェーンに記録 — 透明、検証可能、改ざん不可。',
      trust_safe: '安全・信頼',
      trust_safe_desc: '公式チャージチャネル — 認証情報不要、あなたのアカウントはあなたのまま。',
      trust_savings: '最大の節約',
      trust_savings_desc: '大量仕入れによる割引をそのままお届け — 最大40%オフ。',
      faq_title: 'よくある質問',
      footer_tagline: '安全、シンプル、オンチェーン — 暗号通貨でAIサブスクを購入。',
      footer_nav: 'ナビゲーション',
      footer_contact: 'お問い合わせ',
      footer_languages: '言語',
      order_lookup: '注文照会',
      affiliate: 'アフィリエイト',
      terms: '利用規約',
      privacy: 'プライバシーポリシー',
      now_buying: '購入中',
      product_amount: '商品金額',
      service_fee: '手数料',
      waived: '無料',
      amount_due: 'お支払い額',
      choose_payment: '支払い方法を選択',
      delivery_email: '配信メール',
      email_placeholder: 'you@example.com',
      email_hint: '商品の配信と注文照会に使用されます（マーケティングは行いません）。',
      verification_code: '認証コード',
      captcha_hint: '画像に表示された4桁の数字を入力してください。クリックで更新。',
      confirm_order: '注文を確認',
      agree_terms: '「注文を確認」をクリックすることで、',
      and: 'および',
      order_created: '注文作成完了 — お支払いをお願いします',
      pay_within: '以下の時間内にお支払いください',
      minutes: '分',
      seconds: '秒',
      receiving_address: '受取アドレス',
      copy: 'コピー',
      copied: 'コピーしました！',
      send_exact: '対応するネットワークを使用して、上記のアドレスに正確な金額を送金してください。',
      view_order: '注文を見る',
      done: '完了',
      order_success_title: '注文が正常に完了しました！',
      order_success_desc: '期限内にお支払いを完了してください。チェーン上の送金を確認後、サブスクリプション情報をメールでお送りします。',
      support_title: 'サポート',
      support_message: 'メッセージ',
      support_faq: 'よくある質問',
      support_name: '名前（任意）',
      support_email: 'メール（任意）',
      support_subject: '件名（任意）',
      support_message_placeholder: '質問やメッセージ…',
      support_send: '送信',
      support_sent: 'メッセージを送信しました — すぐにご返信いたします。',
      copied_address: 'アドレスをクリップボードにコピーしました！',
      gpt_plus_desc: '公式チャネルチャージ — 個人アカウントをワンクリックでアップグレード。',
      gpt_pro_desc: 'GPT-5 Proのフルパワーを解放。',
      claude_pro_desc: 'Claudeの最新モデルに格安でアクセス。',
      claude_max_desc: 'ヘビーユーザー向けの拡張利用制限。',
      gemini_pro_desc: 'Googleの最も強力なAIモデル、クラウドストレージ付き。',
      toast_order_created: '注文 #{{number}} が正常に作成されました！',
      toast_payment_method: '支払い方法を選択してください',
      nav_products: '商品',
      nav_orders: '注文',
      nav_faq: 'よくある質問',
      footer_legal: '法的情報',
      refund_policy: '返金ポリシー',
      complete_order: '注文を完了',
      support_reply: 'できるだけ早くご返信いたします。',
      share_label: 'シェア:',
      faq_q_0: 'これは個人アカウントのサブスクリプションですか？',
      faq_a_0: 'はい、個人アカウントに直接反映されます。',
      faq_q_1: '返金はどうすればいいですか？',
      faq_a_1: '注文照会から連絡先情報を入力し、サポートにお問い合わせください。',
      faq_q_2: '安全ですか？アカウントは停止されますか？',
      faq_a_2: '公式チャネルを使用。認証情報不要。失敗時は即時返金。',
      faq_q_3: 'なぜ認証情報を入力する必要がないのですか？',
      faq_a_3: 'キーがメールで送信されます。自分のアカウントで引き換えてください。',
      faq_q_4: 'チャージ後も「Upgrade」が表示されます',
      faq_a_4: 'ページを更新するか、ログインし直してください。解決しない場合はサポートにお問い合わせください。',
      sfq_q_refund: '返金はどうすればいいですか？',
      sfq_a_refund: '注文照会から連絡先情報を入力し、サポートにお問い合わせください。',
      sfq_q_safe: '安全ですか？アカウントは停止されますか？',
      sfq_a_safe: '公式チャネルを使用。認証情報不要。失敗時は即時返金。',
    },
  };

  function t(key, lang) {
    const l = lang || state.currentLang;
    const keys = key.split('.');
    let val = i18n[l] || i18n['en'];
    for (const k of keys) {
      val = val[k];
      if (val === undefined) return key;
    }
    return val || key;
  }

  function tt(key, vars = {}) {
    let text = t(key);
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{{${k}}}`, v);
    }
    return text;
  }

  // ============================================
  // Render Functions
  // ============================================

  function renderProducts(targetTab) {
    const tab = targetTab || state.currentProduct;

    // Render all product grids
    for (const [key, grid] of Object.entries(DOM.productGrids)) {
      if (!grid) continue;
      const products = CONFIG.products[key];
      if (!products) continue;

      grid.innerHTML = products.map((p, idx) => `
        <div class="product-card${p.featured ? ' featured' : ''}" style="animation-delay: ${idx * 0.06}s">
          ${p.badge ? `<span class="badge-save">${p.badge}</span>` : ''}
          <h3>${p.name}</h3>
          <div class="price">
            $${p.price}
            <span class="price-period">${t('per_month')}</span>
          </div>
          <div class="price-original">$${p.originalPrice}${t('per_month')}</div>
          <ul class="features">
            ${p.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
          <button class="buy-btn" data-product='${JSON.stringify(p).replace(/'/g, '&#39;')}'>
            ${t('buy')}
          </button>
        </div>
      `).join('');

      // Attach buy events to this grid
      grid.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const product = JSON.parse(btn.dataset.product);
          openModal(product);
        });
      });
    }
  }

  function renderFAQ() {
    DOM.faqContainer.innerHTML = CONFIG.faq.map((item, i) => {
      const q = t(`faq_q_${i}`) || item.q;
      const a = t(`faq_a_${i}`) || item.a;
      return `
      <div class="faq-item">
        <button class="faq-question" data-index="${i}">
          <span>${q}</span>
          <svg class="faq-arrow" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div class="faq-answer">
          <div class="faq-answer-inner">${a}</div>
        </div>
      </div>
    `}).join('');

    DOM.faqContainer.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        // Close all
        DOM.faqContainer.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  function generateCaptcha() {
    state.captchaValue = String(Math.floor(1000 + Math.random() * 9000));
    const el = document.getElementById('captchaImage');
    if (el) {
      el.textContent = state.captchaValue;
    }
  }

  // ============================================
  // Modal (Buy Flow)
  // ============================================

  function openModal(product) {
    state.selectedProduct = product;
    state.selectedPayment = null;
    state.orderStep = 'form';

    renderModalForm();
    DOM.modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    generateCaptcha();
  }

  function closeModal() {
    DOM.modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function renderModalForm() {
    const p = state.selectedProduct;
    if (!p) return;

    const lang = state.currentLang;

    DOM.modalBody.innerHTML = `
      <div class="payment-step active" id="stepForm">
        <!-- Order Summary -->
        <div class="order-summary">
          <div class="order-summary-row">
            <span class="label">${t('now_buying')}</span>
            <span class="value">${p.name}</span>
          </div>
          <div class="order-summary-row">
            <span class="label">${t('product_amount')}</span>
            <span class="value">$${p.price} ${t('per_month')}</span>
          </div>
          <div class="order-summary-row">
            <span class="label">
              ${t('service_fee')}
              (${state.serviceFeePercent}%)
            </span>
            <span class="value" style="color:var(--success);font-size:0.8rem">${t('waived')}</span>
          </div>
          <div class="order-summary-row total">
            <span class="label">${t('amount_due')}</span>
            <span class="value">$${p.price.toFixed(2)} USD</span>
          </div>
          <div class="service-fee-info">💡 ${t('service_fee')} ${t('waived')}</div>
          ${getCurrentRef() ? `<div style="margin-top:8px;font-size:0.75rem;color:var(--accent);text-align:center">🤝 Referred by <strong>${getCurrentRef()}</strong></div>` : ''}
        </div>

        <!-- Payment Method -->
        <div class="form-group">
          <label>${t('choose_payment')}</label>
          <div class="payment-methods" id="paymentMethods">
            <label class="payment-method" data-pm="usdt-trc20">
              <span class="pm-icon" style="background:rgba(38,161,123,0.15);color:#26a17b">⬤</span>
              <span class="pm-name">USDT (TRC20)</span>
              <span class="pm-check"></span>
            </label>
            <label class="payment-method" data-pm="usdt-bep20">
              <span class="pm-icon" style="background:rgba(240,185,11,0.15);color:#f0b90b">⬤</span>
              <span class="pm-name">USDT (BEP20)</span>
              <span class="pm-check"></span>
            </label>
            <label class="payment-method" data-pm="usdt-polygon">
              <span class="pm-icon" style="background:rgba(130,71,229,0.15);color:#8247e5">◆</span>
              <span class="pm-name">USDT (Polygon)</span>
              <span class="pm-check"></span>
            </label>
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="buyEmail">${t('delivery_email')} <span style="color:var(--danger)">*</span></label>
          <input type="email" id="buyEmail" placeholder="${t('email_placeholder')}" required autocomplete="email">
          <div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:4px">${t('email_hint')}</div>
        </div>

        <!-- Captcha -->
        <div class="form-group">
          <label for="buyCaptcha">${t('verification_code')} <span style="color:var(--danger)">*</span></label>
          <div class="captcha-row">
            <input type="text" id="buyCaptcha" inputmode="numeric" pattern="[0-9]*" maxlength="4" required autocomplete="off" placeholder="0000">
            <div class="captcha-img" id="captchaImage">${state.captchaValue || '0000'}</div>
          </div>
          <div class="captcha-hint">💡 ${t('captcha_hint')}</div>
        </div>

        <button type="button" class="submit-btn" id="confirmOrderBtn">${t('confirm_order')}</button>
        <div class="terms-note">
          ${t('agree_terms')} <a href="#">${t('terms')}</a> ${t('and')} <a href="#">${t('privacy')}</a>.
        </div>
      </div>

      <!-- Payment step -->
      <div class="payment-step" id="stepPayment">
        <div class="success-state" style="padding:0 0 16px">
          <div class="success-icon" style="width:48px;height:48px;font-size:1.2rem;background:rgba(124,58,237,0.15)">📋</div>
          <h3 style="font-size:1rem">${t('order_created')}</h3>
        </div>
        <div class="payment-info">
          <div class="pi-row">
            <span class="pi-label">${t('product_amount')}</span>
            <span class="pi-value">$${p.price.toFixed(2)} USD</span>
          </div>
          <div class="pi-row">
            <span class="pi-label">${t('receiving_address')}</span>
          </div>
        </div>
        <div class="payment-address">
          <input type="text" id="paymentAddress" value="TXYZ..." readonly>
          <button type="button" class="copy-btn" id="copyAddressBtn">${t('copy')}</button>
        </div>
        <div class="timer" id="paymentTimer">
          ${t('pay_within')} <strong id="timerDisplay">15:00</strong>
        </div>
        <div style="font-size:0.8rem;color:var(--text-tertiary);text-align:center">
          ${t('send_exact')}
        </div>
        <button type="button" class="submit-btn" id="viewOrderBtn" style="margin-top:20px">${t('view_order')}</button>
        <button type="button" class="submit-btn" id="doneBtn" style="margin-top:8px;background:var(--bg-elevated);color:var(--text-secondary)">${t('done')}</button>
      </div>

      <!-- Success step -->
      <div class="payment-step" id="stepSuccess">
        <div class="success-state">
          <div class="success-icon">✅</div>
          <h3>${t('order_success_title')}</h3>
          <p>${t('order_success_desc')}</p>
          <button type="button" class="submit-btn" id="closeSuccessBtn" style="margin-top:20px">${t('done')}</button>
        </div>
      </div>
    `;

    // Payment method selection
    DOM.modalBody.querySelectorAll('.payment-method').forEach(el => {
      el.addEventListener('click', () => {
        DOM.modalBody.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
        el.classList.add('selected');
        state.selectedPayment = el.dataset.pm;
      });
    });

    // Captcha refresh
    const captchaImg = DOM.modalBody.querySelector('.captcha-img');
    if (captchaImg) {
      captchaImg.addEventListener('click', generateCaptcha);
    }

    // Confirm order
    const confirmBtn = DOM.modalBody.querySelector('#confirmOrderBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', handleConfirmOrder);
    }

    // Copy address
    const copyBtn = DOM.modalBody.querySelector('#copyAddressBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', handleCopyAddress);
    }

    // View order / Done
    const viewBtn = DOM.modalBody.querySelector('#viewOrderBtn');
    if (viewBtn) viewBtn.addEventListener('click', () => showToast(t('order_lookup')));

    const doneBtn = DOM.modalBody.querySelector('#doneBtn');
    if (doneBtn) doneBtn.addEventListener('click', closeModal);

    const closeSuccessBtn = DOM.modalBody.querySelector('#closeSuccessBtn');
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);
  }

  function handleConfirmOrder() {
    const email = DOM.modalBody.querySelector('#buyEmail')?.value.trim();
    const captcha = DOM.modalBody.querySelector('#buyCaptcha')?.value.trim();

    // Validation
    if (!state.selectedPayment) {
      showToast(t('toast_payment_method'));
      return;
    }
    if (!email) {
      showToast(t('delivery_email') + ' required');
      return;
    }
    if (!email.includes('@')) {
      showToast('Invalid email address');
      return;
    }
    if (captcha !== state.captchaValue) {
      showToast('Invalid verification code');
      generateCaptcha();
      return;
    }

    // Generate order
    state.orderNumber = 'AIS' + Date.now().toString(36).toUpperCase() + String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    // Record referral in order if present
    const ref = getCurrentRef();
    const orderData = {
      number: state.orderNumber,
      product: state.selectedProduct?.id,
      email: email,
      payment: state.selectedPayment,
      amount: state.selectedProduct?.price,
      ref: ref || null,
      timestamp: new Date().toISOString(),
    };

    // Record conversion in affiliate click log
    if (ref) {
      const refClicks = getRefClicks();
      const clickEntry = refClicks.find(c => c.ref === ref && c.session === getSessionId());
      if (clickEntry) {
        clickEntry.action = 'conversion';
        clickEntry.amount = state.selectedProduct?.price || 0;
        clickEntry.orderNumber = state.orderNumber;
        saveRefClicks(refClicks);
      }
    }

    // Show payment step
    showToast(tt('toast_order_created', { number: state.orderNumber }));

    // Switch to payment step
    DOM.modalBody.querySelector('#stepForm').classList.remove('active');
    DOM.modalBody.querySelector('#stepPayment').classList.add('active');

    // Set payment address based on selected method
    const addresses = {
      'usdt-trc20': 'TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv',
      'usdt-bep20': 'TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv',
      'usdt-polygon': 'TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv',
    };
    const addrInput = DOM.modalBody.querySelector('#paymentAddress');
    if (addrInput) {
      addrInput.value = addresses[state.selectedPayment] || 'TXYZ...';
    }

    // Start timer
    startPaymentTimer();
  }

  function handleCopyAddress() {
    const input = DOM.modalBody.querySelector('#paymentAddress');
    if (!input) return;
    input.select();
    document.execCommand('copy');
    const btn = DOM.modalBody.querySelector('#copyAddressBtn');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = t('copied');
      setTimeout(() => { btn.textContent = original; }, 2000);
    }
    showToast(t('copied_address'));
  }

  function startPaymentTimer() {
    state.timerSeconds = 900; // 15 min
    if (state.timerInterval) clearInterval(state.timerInterval);

    function updateTimer() {
      const m = Math.floor(state.timerSeconds / 60);
      const s = state.timerSeconds % 60;
      const display = DOM.modalBody.querySelector('#timerDisplay');
      if (display) display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      if (state.timerSeconds <= 0) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }
      state.timerSeconds--;
    }

    updateTimer();
    state.timerInterval = setInterval(updateTimer, 1000);
  }

  // ============================================
  // Toast
  // ============================================
  function showToast(message) {
    DOM.toast.textContent = message;
    DOM.toast.classList.add('show');
    clearTimeout(DOM.toast._hideTimer);
    DOM.toast._hideTimer = setTimeout(() => {
      DOM.toast.classList.remove('show');
    }, 3000);
  }

  // ============================================
  // Event Binding
  // ============================================

  function bindEvents() {
    // Language toggle
    if (DOM.langToggle) {
      DOM.langToggle.addEventListener('click', () => {
        DOM.langMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!DOM.langToggle.contains(e.target) && !DOM.langMenu.contains(e.target)) {
          DOM.langMenu.classList.add('hidden');
        }
      });
    }

    // Language selection
    DOM.langMenu?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = a.dataset.lang || a.getAttribute('hreflang');
        if (lang) setLanguage(lang);
        DOM.langMenu.classList.add('hidden');
      });
    });

    // Mobile menu
    if (DOM.menuToggle) {
      DOM.menuToggle.addEventListener('click', () => {
        DOM.mobileNav.classList.toggle('open');
      });
    }

    // Product tabs
    DOM.productTabs?.forEach(tab => {
      tab.addEventListener('click', () => {
        const product = tab.dataset.product;
        if (product === state.currentProduct) return;

        DOM.productTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update tab panes
        DOM.tabPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === `tab-${product}`) {
            pane.classList.add('active');
          }
        });

        state.currentProduct = product;
        renderProducts();
      });
    });

    // Modal
    if (DOM.modalClose) {
      DOM.modalClose.addEventListener('click', closeModal);
    }
    DOM.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === DOM.modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Support widget
    if (DOM.supportBtn) {
      DOM.supportBtn.addEventListener('click', () => {
        DOM.supportPanel.classList.toggle('open');
      });
    }
    if (DOM.supportClose) {
      DOM.supportClose.addEventListener('click', () => {
        DOM.supportPanel.classList.remove('open');
      });
    }

    // Support tabs
    DOM.supportTabs?.forEach(tab => {
      tab.addEventListener('click', () => {
        DOM.supportTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        DOM.supportPanes.forEach(p => {
          p.classList.remove('active');
          if (p.id === tab.dataset.pane) p.classList.add('active');
        });
      });
    });

    // Support FAQ
    document.querySelectorAll('.support-faq-q').forEach(el => {
      el.addEventListener('click', () => {
        const item = el.closest('.support-faq-item');
        item.classList.toggle('open');
      });
    });

    // Support form send
    const supportSend = document.querySelector('.support-send-btn');
    if (supportSend) {
      supportSend.addEventListener('click', () => {
        showToast(t('support_sent'));
      });
    }

    // Footer language links
    document.querySelectorAll('.footer-lang a[data-lang]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = a.dataset.lang;
        if (lang) {
          setLanguage(lang);
          // Close mobile nav if open
          DOM.mobileNav?.classList.remove('open');
        }
      });
    });
  }

  // ============================================
  // Language
  // ============================================
  function setLanguage(lang) {
    if (!CONFIG.languages[lang]) return;
    state.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = CONFIG.languages[lang].dir || 'ltr';

    // Persist language choice
    try { localStorage.setItem('aisubhub_lang', lang); } catch (e) {}

    // Update all content
    updatePageContent();

    // Update language menu active state
    DOM.langMenu?.querySelectorAll('a[data-lang]').forEach(a => {
      const isActive = a.dataset.lang === lang;
      a.classList.toggle('brand-text', isActive);
      a.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
      a.style.fontWeight = isActive ? '600' : '400';
    });

    // Update toggle label
    const toggleText = DOM.langToggle?.querySelector('.lang-label');
    if (toggleText) toggleText.textContent = CONFIG.languages[lang].label;
    const toggleFlag = DOM.langToggle?.querySelector('.flag');
    if (toggleFlag) toggleFlag.textContent = CONFIG.languages[lang].flag;
  }

  function updatePageContent() {
    renderProducts();
    renderFAQ();
    updateStaticContent();
  }

  function updateStaticContent() {
    const lang = state.currentLang;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!key) return;
      const text = t(key, lang);
      if (text !== key) {
        // Handle elements that may contain HTML (e.g. hero title with <br>)
        if (el.tagName === 'H1' && el.closest('.hero')) {
          el.innerHTML = text.replace(/\n/g, '<br>');
        } else {
          el.textContent = text;
        }
      }
    });

    // Update placeholders for elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (!key) return;
      const text = t(key, lang);
      if (text !== key) el.placeholder = text;
    });

    // Update product tab labels
    DOM.productTabs?.forEach(tab => {
      const product = tab.dataset.product;
      if (product && t(product, lang) !== product) {
        const textNode = tab.childNodes[0];
        if (textNode) textNode.textContent = t(product, lang);
      }
    });
  }

  // ============================================
  // Stats Counter Animation
  // ============================================
  function animateStats() {
    DOM.stats.forEach(stat => {
      const target = parseFloat(stat.dataset.target);
      if (!target) return;
      const suffix = stat.dataset.suffix || '';
      const isInt = stat.dataset.int === 'true';
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        stat.textContent = (isInt ? Math.round(current) : current.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  // ============================================
  // Init
  // ============================================
  function init() {
    cacheDOM();

    // Restore saved language
    try {
      const saved = localStorage.getItem('aisubhub_lang');
      if (saved && CONFIG.languages[saved]) {
        state.currentLang = saved;
        document.documentElement.lang = saved;
        document.documentElement.dir = CONFIG.languages[saved].dir || 'ltr';
      }
    } catch (e) {}

    // Update toggle button to match restored language
    const toggleText = DOM.langToggle?.querySelector('.lang-label');
    if (toggleText) toggleText.textContent = CONFIG.languages[state.currentLang].label;
    const toggleFlag = DOM.langToggle?.querySelector('.flag');
    if (toggleFlag) toggleFlag.textContent = CONFIG.languages[state.currentLang].flag;

    bindEvents();
    renderProducts();
    renderFAQ();
    updateStaticContent();
    generateCaptcha();

    // Track referral if visiting via affiliate link
    trackReferral();

    // Stats animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) observer.observe(statsSection);

    console.log('AISubHub initialized!');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
