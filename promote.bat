@echo off
title AISubHub 推广助手
echo ========================================
echo   🚀 AISubHub 推广助手
echo   按任意键开始打开推广页面
echo ========================================
pause

echo.
echo [1/5] 打开 Reddit 发帖页面...
start https://www.reddit.com/r/ChatGPT/submit?title=Found%20ChatGPT%20Plus%20for%20%2412%2Fmo%20with%20USDT%20-%20works%20on%20personal%20account&url=https://aisubhub.pages.dev

echo [2/5] 打开 Twitter 发帖...
start https://twitter.com/intent/tweet?text=%F0%9F%9A%80%20Just%20found%20AISubHub%20-%20get%20ChatGPT%20Plus%20for%20%2412%2Fmo%20with%20crypto!%0A%E2%9C%85%20Personal%20account%0A%E2%9C%85%20USDT%20payment%0A%E2%9C%85%20No%20credentials%20needed%0A%E2%9C%85%2040%25%20off%20retail%0Ahttps://aisubhub.pages.dev

echo [3/5] 打开 ProductHunt 提交页面...
start https://www.producthunt.com/posts/new

echo [4/5] 打开 AI 导航站提交页面...
start https://www.futuretools.io/submit-a-tool

echo [5/5] 打开分享页面...
start "" "%~dp0share.html"

echo.
echo ========================================
echo   ✅ 所有页面已打开！
echo   请逐个登录并发布推广内容
echo ========================================
pause
