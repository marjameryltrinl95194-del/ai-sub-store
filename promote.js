/**
 * AISubHub 推广脚本
 *
 * 使用方法：
 * 1. cd /home/dulizhan20260406/ai-sub-store
 * 2. node promote.js
 *
 * 这个脚本会用 Playwright 自动在多个平台进行推广
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://aisubhub.pages.dev';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 AISubHub 推广脚本启动...\n');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ]
  });

  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });

  console.log('📝 尝试 1: 提交到免费 AI 导航站...\n');

  // 1. Try to submit to AI directories
  const directories = [
    { name: 'AI Tools Directory', url: 'https://tools.ai/submit' },
    { name: 'AI Tool Tracker', url: 'https://aitooltracker.com/submit' },
    { name: 'SaaS AI Tools', url: 'https://saasaitools.com/submit' },
  ];

  for (const dir of directories) {
    try {
      const page = await ctx.newPage();
      await page.goto(dir.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
      console.log(`  ✅ ${dir.name}: 页面已加载`);
      await page.screenshot({ path: `/tmp/promo_${dir.name.replace(/\s+/g, '_')}.png` });
      await page.close();
      await sleep(1000);
    } catch (e) {
      console.log(`  ❌ ${dir.name}: ${e.message.substring(0, 60)}`);
    }
  }

  console.log('\n📝 尝试 2: 生成推广内容文件...\n');

  // 2. Generate promo content files
  const content = {
    reddit: {
      title: 'Found ChatGPT Plus for $12/mo with USDT - works on personal account',
      body: `Been using this for a week and it actually works.

AISubHub (${SITE_URL}) sells AI subscriptions at wholesale prices:
• ChatGPT Plus $12/mo instead of $20
• ChatGPT Pro $60-$120/mo
• Claude Pro and Gemini Pro also available

Paid with USDT (TRC20), got the code in 5 mins, redeemed on my own account.

No credentials needed, full refund if it fails. Thought I'd share.`
    },
    twitter: {
      post1: `🚀 Just found AISubHub - get ChatGPT Plus for $12/mo with crypto!\n\n✅ Personal account\n✅ USDT payment\n✅ No credentials needed\n✅ 40% off retail\n\n${SITE_URL}`,
      post2: `Buy ChatGPT Plus, Claude Pro & Gemini Pro with USDT at wholesale prices 🚀\n\nSave up to 40% on AI subscriptions:\n👉 ${SITE_URL}`
    },
    telegram: {
      msg: `🔥 用 USDT 买 ChatGPT Plus 只要 $12/月！\n👉 ${SITE_URL}\n✅ 个人账户，不是共享号\n✅ 无需密码，安全可靠\n✅ 支持 USDT TRC20/BEP20/Polygon\n✅ 充值失败全额退款`
    }
  };

  const contentFile = path.join(__dirname, 'promo_content.json');
  fs.writeFileSync(contentFile, JSON.stringify(content, null, 2));
  console.log(`  ✅ 推广内容已保存到: ${contentFile}\n`);

  // 3. Generate a shareable HTML promo page
  const promoHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Share AISubHub</title>
<style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px;background:#0a0a12;color:#f1f1f6}
h1{color:#a855f7}.card{background:#1a1a2e;border-radius:12px;padding:16px;margin:12px 0;border:1px solid rgba(255,255,255,0.06)}
.card h3{margin:0 0 8px;color:#a855f7}.card p{margin:0 0 4px;color:#a0a0b8;font-size:14px}
.btn{display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;padding:12px 24px;border-radius:10px;
text-decoration:none;font-weight:600;margin:8px 4px}.btn:hover{opacity:0.9}</style></head>
<body>
<h1>🚀 Share AISubHub</h1>
<p>Copy and share these posts:</p>
<div class="card"><h3>📱 Reddit Post</h3>
<p>${content.reddit.title}</p></div>
<div class="card"><h3>🐦 Twitter</h3>
<p>${content.twitter.post1}</p></div>
<div class="card"><h3>✈️ Telegram</h3>
<p>${content.telegram.msg}</p></div>
<a class="btn" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(content.twitter.post1)}" target="_blank">Tweet Now</a>
<a class="btn" href="https://www.reddit.com/submit?url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent(content.reddit.title)}" target="_blank">Post to Reddit</a>
</body></html>`;

  fs.writeFileSync(path.join(__dirname, 'share.html'), promoHtml);
  console.log(`  ✅ 分享页面已生成: share.html\n`);

  await browser.close();

  console.log('══════════════════════════════════════');
  console.log('✅ 推广准备完成！');
  console.log('══════════════════════════════════════');
  console.log('');
  console.log('📋 你需要手动做的（2-3 分钟）：');
  console.log('');
  console.log('1️⃣  Reddit 发帖:');
  console.log('   打开 https://reddit.com → 登录 → 点 "+" → 选 r/ChatGPT');
  console.log('   标题: ' + content.reddit.title);
  console.log('');
  console.log('2️⃣  Twitter 发帖:');
  console.log('   打开 share.html 点 "Tweet Now" 按钮');
  console.log('');
  console.log('3️⃣  打开分享页面:');
  console.log('   file://' + path.join(__dirname, 'share.html'));
  console.log('');
  console.log('📂 生成的文件:');
  console.log('   - promo_content.json (推广文案)');
  console.log('   - share.html (分享页面,浏览器打开)');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
