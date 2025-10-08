import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface LayoutMetrics {
  sidebarWidth: number;
  contentLeft: number;
  containerCountUnderInset: number;
  hasXScroll: boolean;
  mainBg: string;
  timestamp: string;
}

const routes = [
  { name: 'dashboard', path: '/dashboard', waitFor: 'main' },
  { name: 'courses', path: '/courses', waitFor: '.container' },
  { name: 'course-detail', path: '/courses/the-million-dollar-real-estate-agent-your-next-90-days', waitFor: 'main' },
  { name: 'lesson', path: '/courses/the-million-dollar-real-estate-agent-your-next-90-days/modules/663ba4ab5fb1eca76e7f32e2/sub-lessons/663ba5da5fb1eca76e7f32e5', waitFor: 'main' }
];

async function captureMetrics(phase: 'before' | 'after') {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  // Create admin session cookie
  await context.addCookies([{
    name: 'next-auth.session-token',
    value: process.env.SESSION_TOKEN || 'dummy-session',
    domain: 'watch.zerotodiamond.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  }]);

  const page = await context.newPage();
  
  console.log(`\n=== VISUAL AUDIT (${phase.toUpperCase()}) ===\n`);

  for (const route of routes) {
    try {
      console.log(`Auditing ${route.name}...`);
      
      await page.goto(`https://watch.zerotodiamond.com${route.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for content to load
      await page.waitForSelector(route.waitFor, { timeout: 10000 }).catch(() => {
        console.log(`Waiting for ${route.waitFor} failed, page might be redirecting...`);
      });
      
      // Additional wait to ensure everything is rendered
      await page.waitForTimeout(2000);
      
      // Check if we're on login page
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('  ⚠️  Redirected to login page');
      }
      
      // Capture metrics
      const metrics = await page.evaluate(() => {
        // Look for various sidebar selectors used in the app
        const sidebar = document.querySelector('[data-sidebar="sidebar"]') || 
                        document.querySelector('.group\\/sidebar-wrapper') ||
                        document.querySelector('.app-chrome') ||
                        document.querySelector('[class*="w-64"][class*="shrink-0"]') ||
                        document.querySelector('aside');
        
        const main = document.querySelector('main');
        const content = main?.querySelector('.container') || 
                       document.querySelector('.container') ||
                       main?.querySelector('[class*="mx-auto"][class*="px-"]') ||
                       main?.firstElementChild;
        const containers = document.querySelectorAll('.container');
        
        return {
          sidebarWidth: sidebar ? (sidebar as HTMLElement).offsetWidth : 0,
          contentLeft: content ? content.getBoundingClientRect().left : 0,
          containerCountUnderInset: containers.length,
          hasXScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          mainBg: main ? window.getComputedStyle(main).backgroundColor : 'none',
          timestamp: new Date().toISOString()
        };
      }) as LayoutMetrics;
      
      // Save screenshot
      const screenshotPath = path.join(__dirname, '..', 'audit', phase, `${route.name}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      // Save metrics
      const metricsPath = path.join(__dirname, '..', 'audit', phase, `${route.name}.json`);
      fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
      
      // Print metrics
      console.log(`  Sidebar Width: ${metrics.sidebarWidth}px`);
      console.log(`  Content Left: ${metrics.contentLeft}px`);
      console.log(`  Container Count: ${metrics.containerCountUnderInset}`);
      console.log(`  Has X-Scroll: ${metrics.hasXScroll}`);
      console.log(`  Main BG: ${metrics.mainBg}`);
      console.log(`  ✓ Screenshot saved: ${screenshotPath}`);
      console.log(`  ✓ Metrics saved: ${metricsPath}\n`);
      
    } catch (error) {
      console.error(`  ✗ Error auditing ${route.name}:`, error instanceof Error ? error.message : String(error));
    }
  }
  
  await browser.close();
}

// Main execution
(async () => {
  const phase = process.argv[2] as 'before' | 'after';
  
  if (!phase || !['before', 'after'].includes(phase)) {
    console.error('Usage: npx tsx tools/audit.ts [before|after]');
    process.exit(1);
  }
  
  await captureMetrics(phase);
})();
