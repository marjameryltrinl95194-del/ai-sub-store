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
      footer_legal: 'Legal',
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
      page_title: 'AISubHub — Premium AI Subscriptions at Wholesale Prices',
      page_desc: 'Buy cheap ChatGPT Plus, Claude Pro & Gemini Pro subscriptions with crypto. Top up your personal account — no credentials required.',
      nav_products: 'Products',
      nav_faq: 'FAQ',
      nav_affiliate: 'Affiliate',
      nav_orders: 'Orders',
      refund_policy: 'Refund Policy',
      share: 'Share',
      made_with_love: 'Made with ❤️ for the AI community',
      support_reply_note: 'We reply as soon as we can.',
      modal_complete_order: 'Complete Order',
      faq_q1: 'Is this a personal account subscription? Not a mirror/shared account?',
      faq_a1: 'Yes, it\'s credited directly to your personal account — not a mirror or shared account. You use your own login credentials.',
      faq_q2: 'How do I get a refund if there\'s an issue?',
      faq_a2: 'Go to Order Lookup → enter the contact info you provided at checkout → copy the order number and contact Support. We offer full refund if recharge fails.',
      faq_q3: 'Is this safe? Will my account get banned?',
      faq_a3: 'We use official gift card and enterprise channels to complete the recharge — no account credentials required at any point, all handled automatically. If recharge fails, immediate full refund is issued.',
      faq_q4: 'Why don\'t I need to enter my account credentials?',
      faq_a4: 'After placing your order, the card key and redemption guide are sent to your email. Simply redeem it with your own account to activate — no need to share credentials.',
      faq_q5: 'After recharging, it still shows "Upgrade" — why hasn\'t it taken effect?',
      faq_a5: 'Try refreshing the page or logging out and back in (re-logging often helps). If it still hasn\'t taken effect, check your account settings or contact support with a screenshot.',
      support_faq_q1: 'Is this my own personal account subscription?',
      support_faq_a1: 'Yes, it\'s credited directly to your personal account — not a shared account.',
      support_faq_q2: 'How do I get a refund?',
      support_faq_a2: 'Go to Order Lookup → enter your contact info → copy the order number and contact Support.',
      support_faq_q3: 'Is it safe? Will my account get banned?',
      support_faq_a3: 'We use official channels. No credentials needed. If recharge fails, immediate refund.',
      toast_order_created: 'Order #{{number}} created successfully!',
      toast_payment_method: 'Please select a payment method',
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
      footer_legal: '法律',
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
      page_title: 'AISubHub — 高级 AI 订阅，全场批发价',
      page_desc: '用加密货币低价购买 ChatGPT Plus、Claude Pro、Gemini Pro 订阅。个人账户充值，无需提供密码。',
      nav_products: '产品',
      nav_faq: '常见问题',
      nav_affiliate: '推广联盟',
      nav_orders: '订单查询',
      refund_policy: '退款政策',
      share: '分享',
      made_with_love: '用 ❤️ 为 AI 社区打造',
      support_reply_note: '我们会尽快回复。',
      modal_complete_order: '完成订单',
      faq_q1: '这是个人账户订阅吗？不是镜像或共享账户吧？',
      faq_a1: '是的，直接充值到你的个人账户 — 不是镜像或共享账户。你使用自己的登录凭证。',
      faq_q2: '如果有问题，怎么退款？',
      faq_a2: '前往「订单查询」→ 输入下单时提供的联系方式 → 复制订单号联系客服。充值失败全额退款。',
      faq_q3: '这安全吗？我的账号会被封吗？',
      faq_a3: '我们通过官方礼品卡和企业渠道完成充值 — 全程不需要你的账户密码，全自动处理。如果充值失败，立即全额退款。',
      faq_q4: '为什么不需要我输入账户密码？',
      faq_a4: '下单成功后，卡密和兑换指南会发送到你的邮箱。用你自己的账号兑换激活即可 — 无需分享密码。',
      faq_q5: '充值后还是显示"升级" — 为什么没有生效？',
      faq_a5: '尝试刷新页面或退出重新登录（重新登录通常有效）。如果仍未生效，请检查账户设置或联系客服并提供截图。',
      support_faq_q1: '这是我自己的个人账户订阅吗？',
      support_faq_a1: '是的，直接充值到你的个人账户 — 不是共享账户。',
      support_faq_q2: '如何申请退款？',
      support_faq_a2: '前往"订单查询" → 输入联系方式 → 复制订单号联系客服。',
      support_faq_q3: '安全吗？账号会被封吗？',
      support_faq_a3: '我们使用官方渠道。无需密码。充值失败立即退款。',
      toast_order_created: '订单 #{{number}} 创建成功！',
      toast_payment_method: '请选择支付方式',
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
      footer_legal: 'Rechtliches',
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
      page_title: 'AISubHub — Premium KI-Abos zum Großhandelspreis',
      page_desc: 'Kaufe günstige ChatGPT Plus-, Claude Pro- und Gemini Pro-Abos mit Krypto. Aufladen deines persönlichen Kontos — keine Zugangsdaten erforderlich.',
      nav_products: 'Produkte',
      nav_faq: 'FAQ',
      nav_affiliate: 'Affiliate',
      nav_orders: 'Bestellung suchen',
      refund_policy: 'Rückerstattungsrichtlinie',
      share: 'Teilen',
      made_with_love: 'Mit ❤️ für die KI-Community',
      support_reply_note: 'Wir melden uns so bald wie möglich bei dir.',
      modal_complete_order: 'Bestellung abschließen',
      toast_order_created: 'Bestellung #{{number}} erfolgreich erstellt!',
      toast_payment_method: 'Bitte wähle eine Zahlungsmethode',
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
      footer_legal: 'Legal',
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
      page_title: 'AISubHub — Suscripciones AI Premium a Precios de Mayoreo',
      page_desc: 'Compra suscripciones ChatGPT Plus, Claude Pro y Gemini Pro con cripto. Recarga tu cuenta personal — sin credenciales.',
      nav_products: 'Productos',
      nav_faq: 'FAQ',
      nav_affiliate: 'Afiliados',
      nav_orders: 'Buscar Pedido',
      refund_policy: 'Política de Reembolso',
      share: 'Compartir',
      made_with_love: 'Hecho con ❤️ para la comunidad AI',
      support_reply_note: 'Te responderemos lo antes posible.',
      modal_complete_order: 'Completar Pedido',
      toast_order_created: '¡Pedido #{{number}} creado exitosamente!',
      toast_payment_method: 'Por favor selecciona un método de pago',
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
      footer_legal: 'Mentions légales',
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
      page_title: 'AISubHub — Abonnements AI Premium aux Prix de Gros',
      page_desc: 'Achetez des abonnements ChatGPT Plus, Claude Pro et Gemini Pro bon marché avec crypto. Rechargez votre compte personnel — aucun identifiant requis.',
      nav_products: 'Produits',
      nav_faq: 'FAQ',
      nav_affiliate: 'Affiliation',
      nav_orders: 'Rechercher commande',
      refund_policy: 'Politique de remboursement',
      share: 'Partager',
      made_with_love: 'Fait avec ❤️ pour la communauté IA',
      support_reply_note: 'Nous vous répondrons dès que possible.',
      modal_complete_order: 'Terminer la commande',
      toast_order_created: 'Commande #{{number}} créée avec succès !',
      toast_payment_method: 'Veuillez sélectionner un mode de paiement',
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
      footer_legal: 'القانوني',
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
      page_title: 'AISubHub — اشتراكات الذكاء الاصطناعي المميزة بأسعار الجملة',
      page_desc: 'اشتر اشتراكات ChatGPT Plus و Claude Pro و Gemini Pro بسعر منخفض بالعملات الرقمية. اشحن حسابك الشخصي — بدون بيانات دخول.',
      nav_products: 'المنتجات',
      nav_faq: 'الأسئلة الشائعة',
      nav_affiliate: 'التسويق بالعمولة',
      nav_orders: 'البحث عن طلب',
      refund_policy: 'سياسة الاسترداد',
      share: 'مشاركة',
      made_with_love: 'صنع بـ ❤️ لمجتمع الذكاء الاصطناعي',
      support_reply_note: 'سنرد عليك في أقرب وقت ممكن.',
      modal_complete_order: 'إكمال الطلب',
      toast_order_created: 'تم إنشاء الطلب #{{number}} بنجاح!',
      toast_payment_method: 'يرجى اختيار طريقة دفع',
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
      footer_legal: '法的情報',
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
      page_title: 'AISubHub — プレミアムAIサブスクリプション卸売価格',
      page_desc: 'ChatGPT Plus、Claude Pro、Gemini Proのサブスクリプションを暗号通貨でお得に購入。個人アカウントにチャージ — 認証情報不要。',
      nav_products: '製品',
      nav_faq: 'よくある質問',
      nav_affiliate: 'アフィリエイト',
      nav_orders: '注文照会',
      refund_policy: '返金ポリシー',
      share: 'シェア',
      made_with_love: 'AIコミュニティに❤️を込めて',
      support_reply_note: 'できるだけ早くご返信いたします。',
      modal_complete_order: '注文を完了',
      toast_order_created: '注文 #{{number}} が正常に作成されました！',
      toast_payment_method: '支払い方法を選択してください',
    },
  };

  function t(key, lang) {
    const l = lang || state.currentLang;
    const keys = key.split('.');
    // Try requested language first
    let val = i18n[l];
    if (val) {
      for (const k of keys) { val = val[k]; if (val === undefined) break; }
      if (val !== undefined) return val;
    }
    // Fallback to English
    val = i18n['en'];
    for (const k of keys) { val = val[k]; if (val === undefined) return key; }
    return val;
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
      const qKey = `faq_q${i+1}`;
      const aKey = `faq_a${i+1}`;
      const qText = t(qKey);
      const aText = t(aKey);
      // Use i18n translation if available, fall back to CONFIG.faq English text
      const question = qText !== qKey ? qText : item.q;
      const answer = aText !== aKey ? aText : item.a;
      return `
        <div class="faq-item">
          <button class="faq-question" data-index="${i}">
            <span>${question}</span>
            <svg class="faq-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
            </svg>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">${answer}</div>
          </div>
        </div>
      `;
    }).join('');

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

    // Language selection — both header menu and footer links
    document.querySelectorAll('[data-lang]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = a.dataset.lang;
        if (lang) setLanguage(lang);
        // Close header menu if open
        DOM.langMenu?.classList.add('hidden');
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
  }

  // ============================================
  // Language
  // ============================================
  function setLanguage(lang) {
    if (!CONFIG.languages[lang]) return;
    state.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = CONFIG.languages[lang].dir || 'ltr';

    // Update all translatable text
    updatePageContent();

    // Update language menu
    DOM.langMenu?.querySelectorAll('li').forEach(li => {
      const a = li.querySelector('a');
      if (a) {
        const isActive = (a.getAttribute('hreflang') || a.dataset.lang) === lang;
        li.querySelector('a')?.classList.toggle('brand-text', isActive);
        li.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    });

    // Update toggle label
    const toggleText = DOM.langToggle?.querySelector('.lang-label');
    if (toggleText) toggleText.textContent = CONFIG.languages[lang].label;
    const toggleFlag = DOM.langToggle?.querySelector('.flag');
    if (toggleFlag) toggleFlag.textContent = CONFIG.languages[lang].flag;
  }

  function updatePageContent() {
    const lang = state.currentLang;

    // Update page <title>
    const titleEl = document.querySelector('[data-i18n="page_title"]');
    if (titleEl) titleEl.textContent = t('page_title');

    // Update <meta> tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t('page_desc');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = t('page_title');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = t('page_desc');
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = t('page_title');
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.content = t('page_desc');

    // Update all [data-i18n] elements (skip page_title — already handled)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!key || key === 'page_title') return;
      if (el.dataset.i18nHtml) {
        el.innerHTML = t(key).replace(/\n/g, '<br>');
      } else {
        el.textContent = t(key);
      }
    });

    // Update [data-i18n-placeholder] elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    // Re-render dynamic sections
    renderProducts();
    renderFAQ();
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
    bindEvents();
    updatePageContent(); // calls renderProducts() + renderFAQ() internally
    generateCaptcha();

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
