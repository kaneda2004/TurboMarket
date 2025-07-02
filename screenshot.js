const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Create screenshots directory
  const screenshotsDir = './screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  try {
    console.log('Taking screenshot of homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'homepage.png'),
      fullPage: true
    });
    
    console.log('Taking screenshot of wizard...');
    // Try to navigate to wizard if there's a button or link
    try {
      await page.click('a[href*="wizard"], button[data-testid*="wizard"], .wizard-button, [class*="wizard"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'wizard.png'),
        fullPage: true
      });
    } catch (e) {
      console.log('Could not navigate to wizard, trying direct URL...');
      try {
        await page.goto('http://localhost:3000/wizard', { waitUntil: 'networkidle2' });
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'wizard.png'),
          fullPage: true
        });
      } catch (e2) {
        console.log('Wizard page not found, skipping...');
      }
    }
    
    // Try different possible routes
    const routes = ['/campaign', '/create', '/new', '/builder'];
    for (const route of routes) {
      try {
        console.log(`Trying route: ${route}`);
        await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle2' });
        await page.screenshot({ 
          path: path.join(screenshotsDir, `${route.replace('/', '')}.png`),
          fullPage: true
        });
        console.log(`Screenshot saved for ${route}`);
      } catch (e) {
        console.log(`Route ${route} not found, skipping...`);
      }
    }
    
    console.log('Screenshots completed successfully!');
    
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();