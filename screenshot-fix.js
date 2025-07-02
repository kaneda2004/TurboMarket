const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeProperScreenshots() {
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
  
  // Clear existing screenshots
  const files = fs.readdirSync(screenshotsDir);
  for (const file of files) {
    fs.unlinkSync(path.join(screenshotsDir, file));
  }
  
  try {
    console.log('Waiting for server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test server connectivity
    const response = await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    if (!response.ok()) {
      throw new Error('Server not responding');
    }
    
    console.log('✅ Taking screenshot of homepage...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'homepage.png'),
      fullPage: true
    });
    console.log('✅ Homepage screenshot saved');
    
    console.log('🧙 Taking screenshot of wizard...');
    await page.goto('http://localhost:3000/wizard', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    // Wait a bit more for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'wizard.png'),
      fullPage: true
    });
    console.log('✅ Wizard screenshot saved');
    
    console.log('🎉 All screenshots completed successfully!');
    
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

takeProperScreenshots();