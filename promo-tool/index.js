#!/usr/bin/env node
/**
 * AISubHub 自动推广程序
 * ========================================
 * 使用方法:
 *   node index.js              # 运行所有推广
 *   node index.js --watch      # 启动监控面板 (端口 3457)
 *   node index.js --list       # 列出所有渠道
 *
 * 无需浏览器，全部通过 API 自动完成
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ============================================
// 配置
// ============================================
const CONFIG = {
  siteUrl: 'https://aisubhub.pages.dev',
  siteName: 'AISubHub',
  tagline: 'Premium AI Subscriptions at Wholesale Prices',
  supportEmail: 'support@aisubhub.pages.dev',
  // Telegraph token (auto-created on first run)
  telegraphToken: '',
};

// 推广渠道定义
const CHANNELS = [
  {
    id: 'telegraph',
    name: 'Telegraph (Telegram)',
    type: 'api',
    description: '发布文章到 Telegraph 匿名平台',
    icon: '✈️',
    enabled: true,
    autoRun: true,
  },
  {
    id: 'google',
    name: 'Google Search',
    type: 'api',
    description: '通知 Google 收录网站',
    icon: '🌐',
    enabled: true,
    autoRun: true,
  },
  {
    id: 'bing',
    name: 'Bing Search',
    type: 'api',
    description: '通知 Bing 收录网站',
    icon: '🌐',
    enabled: true,
    autoRun: true,
  },
  {
    id: 'yandex',
    name: 'Yandex Search',
    type: 'api',
    description: '通知 Yandex 收录（俄罗斯市场）',
    icon: '🌐',
    enabled: true,
    autoRun: true,
  },
  {
    id: 'shorturl',
    name: '短链接生成',
    type: 'api',
    description: '生成可追踪的短链接',
    icon: '🔗',
    enabled: true,
    autoRun: true,
  },
  {
    id: 'reddit',
    name: 'Reddit r/CryptoCurrency',
    type: 'manual',
    description: '"Use Case" — crypto 实际支付场景',
    icon: '🪙',
    enabled: true,
    autoRun: false,
    url: 'https://www.reddit.com/r/CryptoCurrency/submit?title=I%27ve%20been%20using%20USDT%20to%20pay%20for%20my%20ChatGPT%20subscription%20%E2%80%94%20actually%20works%20great',
  },
  {
    id: 'reddit-beermoney',
    name: 'Reddit r/beermoney',
    type: 'manual',
    description: '"Saving Tips" — 省钱技巧',
    icon: '🍺',
    enabled: true,
    autoRun: false,
    url: 'https://www.reddit.com/r/beermoney/submit?title=Save%2040%25%20on%20ChatGPT%20Plus%20(%2420%20%E2%86%92%20%2412%2Fmo)%20by%20paying%20with%20USDT',
  },
  {
    id: 'reddit-deals',
    name: 'Reddit r/deals',
    type: 'manual',
    description: '"Online Deal" — 直接发优惠',
    icon: '🏷️',
    enabled: true,
    autoRun: false,
    url: 'https://www.reddit.com/r/deals/submit?title=%5BDEAL%5D%20ChatGPT%20Plus%20%2412%2Fmo%20(reg.%20%2420)%20%E2%80%94%20pay%20with%20USDT',
  },
  {
    id: 'reddit-aitools',
    name: 'Reddit r/AITOOLS',
    type: 'manual',
    description: 'AI 工具讨论 — 分享渠道',
    icon: '🤖',
    enabled: true,
    autoRun: false,
    url: 'https://www.reddit.com/r/AITOOLS/submit?title=Where%20do%20you%20get%20your%20AI%20subscriptions%3F%20I%27ve%20been%20using%20this%20wholesale%20site',
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    type: 'manual',
    description: '手动发推',
    icon: '🐦',
    enabled: true,
    autoRun: false,
    url: 'https://twitter.com/intent/tweet?text=Get%20ChatGPT%20Plus%20for%20%2412%2Fmo%20with%20crypto!%20https://aisubhub.pages.dev',
  },
  {
    id: 'producthunt',
    name: 'ProductHunt',
    type: 'manual',
    description: '提交产品到 ProductHunt',
    icon: '🏆',
    enabled: true,
    autoRun: false,
    url: 'https://www.producthunt.com/posts/new',
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    type: 'manual',
    description: '分享到 HN',
    icon: '💻',
    enabled: true,
    autoRun: false,
    url: 'https://news.ycombinator.com/submit',
  },
];

// ============================================
// HTTP 工具
// ============================================
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const contentType = options.headers?.['Content-Type'] || 'application/json';
    let bodyStr = '';
    if (options.body) {
      if (contentType === 'application/x-www-form-urlencoded') {
        bodyStr = Object.entries(options.body)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&');
      } else {
        bodyStr = JSON.stringify(options.body);
      }
    }
    const req = mod.request(url, {
      method: options.method || 'GET',
      headers: Object.assign(
        { 'User-Agent': 'AISubHub-Promo/1.0' },
        options.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        options.headers || {},
        bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}
      ),
      timeout: options.timeout || 15000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ============================================
// 推广器
// ============================================
class Promoter {
  constructor() {
    this.results = [];
    this.tokenFile = path.join(__dirname, '.telegraph_token');
    this._loadToken();
  }

  _loadToken() {
    try {
      CONFIG.telegraphToken = fs.readFileSync(this.tokenFile, 'utf8').trim();
    } catch { CONFIG.telegraphToken = ''; }
  }

  _saveToken(token) {
    CONFIG.telegraphToken = token;
    fs.writeFileSync(this.tokenFile, token);
  }

  async runAll() {
    console.log('\n⚡ AISubHub 自动推广程序 v1.0\n');

    // API 渠道自动运行
    for (const ch of CHANNELS.filter(c => c.autoRun && c.enabled)) {
      console.log(`\n[${ch.icon}] ${ch.name}...`);
      try {
        const result = await this[`_publish_${ch.id}`]();
        this.results.push({ ...ch, success: true, message: result });
        console.log(`  ✅ ${result}`);
      } catch (e) {
        this.results.push({ ...ch, success: false, message: e.message });
        console.log(`  ❌ ${e.message}`);
      }
    }

    // 手动渠道提示
    console.log('\n\n📋 需要手动发布的渠道:');
    for (const ch of CHANNELS.filter(c => !c.autoRun && c.enabled)) {
      console.log(`  ${ch.icon} ${ch.name}: ${ch.url}`);
    }

    // 生成报告
    this._generateReport();
    return this.results;
  }

  // --- 各渠道发布器 ---

  async _publish_google() {
    const res = await fetch('https://www.google.com/ping?sitemap=' + encodeURIComponent(CONFIG.siteUrl + '/sitemap.xml'));
    return 'Google 已通知';
  }

  async _publish_bing() {
    await fetch('https://www.bing.com/ping?sitemap=' + encodeURIComponent(CONFIG.siteUrl + '/sitemap.xml'));
    return 'Bing 已通知';
  }

  async _publish_yandex() {
    await fetch('https://webmaster.yandex.com/ping?sitemap=' + encodeURIComponent(CONFIG.siteUrl + '/sitemap.xml'));
    return 'Yandex 已通知';
  }

  async _publish_shorturl() {
    // Try cleanuri first
    try {
      const res = await fetch('https://cleanuri.com/api/v1/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: { url: CONFIG.siteUrl },
      });
      const url = typeof res === 'object' ? (res.result_url || '') : res;
      if (url) return `短链接: ${url}`;
    } catch (e) {}
    // Fallback: is.gd (works in China)
    try {
      const res = await fetch('https://is.gd/create.php?format=json&url=' + encodeURIComponent(CONFIG.siteUrl));
      const url = typeof res === 'object' ? (res.shorturl || '') : '';
      if (url) return `短链接: ${url}`;
    } catch (e) {}
    return `短链接: ${CONFIG.siteUrl} (无可用短链服务)`;
  }

  async _publish_telegraph() {
    // 1. 获取或创建 token
    if (!CONFIG.telegraphToken) {
      const account = await fetch('https://api.telegra.ph/createAccount', {
        method: 'POST',
        body: {
          short_name: 'AISubHub',
          author_name: 'AISubHub',
          author_url: CONFIG.siteUrl,
        },
      });
      if (!account.ok) throw new Error(account.error);
      this._saveToken(account.result.access_token);
    }

    // 2. 发布文章
    const content = [
      { tag: 'h3', children: ['Save up to 40% on ChatGPT Plus with Crypto'] },
      { tag: 'p', children: ['AISubHub lets you buy ChatGPT Plus, Claude Pro & Gemini Pro with USDT at wholesale prices.'] },
      { tag: 'ul', children: [
        { tag: 'li', children: ['ChatGPT Plus $12/mo vs $20 retail', { tag: 'b', children: [' — save 40%'] }] },
        { tag: 'li', children: ['ChatGPT Pro $60-$120/mo'] },
        { tag: 'li', children: ['Claude Pro & Max'] },
        { tag: 'li', children: ['Gemini Pro'] },
      ]},
      { tag: 'p', children: [{ tag: 'b', children: ['✅ Features:'] }] },
      { tag: 'ul', children: [
        { tag: 'li', children: ['Personal account — not shared'] },
        { tag: 'li', children: ['No credentials required'] },
        { tag: 'li', children: ['USDT payment (TRC20/BEP20/Polygon)'] },
        { tag: 'li', children: ['Full refund guarantee'] },
        { tag: 'li', children: ['8 languages supported'] },
      ]},
      { tag: 'p', children: ['👉 ', { tag: 'a', attrs: { href: CONFIG.siteUrl }, children: [CONFIG.siteUrl] }] },
    ];

    const article = await fetch('https://api.telegra.ph/createPage', {
      method: 'POST',
      body: {
        access_token: CONFIG.telegraphToken,
        title: 'Buy ChatGPT Plus with Crypto — Save 40%',
        author_name: 'AISubHub',
        author_url: CONFIG.siteUrl,
        content: content,
      },
    });

    if (!article.ok) throw new Error(article.error || 'Telegraph publish failed');
    return `文章已发布: ${article.result.url}`;
  }

  _generateReport() {
    const auto = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    const report = {
      timestamp: new Date().toISOString(),
      total: this.results.length,
      success: auto.length,
      failed: failed.length,
      results: this.results,
    };
    fs.writeFileSync(path.join(__dirname, 'promo-report.json'), JSON.stringify(report, null, 2));
  }

  // --- 监控面板 ---
  startDashboard(port = 3457) {
    const dashboard = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');

    const server = http.createServer((req, res) => {
      if (req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          channels: CHANNELS,
          results: this.results,
          siteUrl: CONFIG.siteUrl,
        }));
      } else if (req.url === '/api/run') {
        this.runAll().then(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, results: this.results }));
        }).catch(e => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: e.message }));
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(dashboard);
      }
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`\n📊 推广监控面板: http://localhost:${port}`);
      console.log(`📊 局域网访问: http://172.18.16.1:${port}`);
    });
  }
}

// ============================================
// 命令行
// ============================================
const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log('\n📋 推广渠道列表:\n');
  for (const ch of CHANNELS) {
    const type = ch.autoRun ? '🤖 自动' : '👆 手动';
    console.log(`  ${ch.icon} ${ch.name.padEnd(15)} ${type}  ${ch.description}`);
  }
  console.log('');
} else if (args.includes('--watch') || args.includes('--dashboard')) {
  const promoter = new Promoter();
  promoter.startDashboard(parseInt(args[1]) || 3457);
  promoter.runAll();
} else {
  const promoter = new Promoter();
  promoter.runAll().then(() => {
    console.log('\n✨ 推广完成！');
    console.log('💡 提示: 使用 --watch 启动监控面板');
  }).catch(e => {
    console.error('❌ 错误:', e.message);
  });
}
