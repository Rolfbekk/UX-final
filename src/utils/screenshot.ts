import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function captureWebsiteScreenshot(url: string, outputDir: string = 'public/screenshots'): Promise<{ desktop: string; mobile: string }> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const desktopFilename = `desktop-${timestamp}.png`;
    const mobileFilename = `mobile-${timestamp}.png`;
    
    const desktopPath = path.join(outputDir, desktopFilename);
    const mobilePath = path.join(outputDir, mobileFilename);

    // Capture desktop screenshot
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });
    try {
      await desktopPage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await desktopPage.screenshot({ 
        path: desktopPath as `${string}.png`, 
        fullPage: true
      });
    } catch (error) {
      console.warn('Desktop screenshot failed:', error);
      throw error;
    } finally {
      await desktopPage.close();
    }

    // Capture mobile screenshot
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 667 });
    try {
      await mobilePage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await mobilePage.screenshot({ 
        path: mobilePath as `${string}.png`, 
        fullPage: true
      });
    } catch (error) {
      console.warn('Mobile screenshot failed:', error);
      throw error;
    } finally {
      await mobilePage.close();
    }

    return {
      desktop: `/screenshots/${desktopFilename}`,
      mobile: `/screenshots/${mobileFilename}`
    };
  } finally {
    await browser.close();
  }
}

export async function captureElementScreenshot(
  url: string, 
  selector: string, 
  outputDir: string = 'public/screenshots'
): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `element-${timestamp}.png`;
    const filepath = path.join(outputDir, filename);

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the element to be present
    await page.waitForSelector(selector, { timeout: 10000 });
    
    // Take screenshot of specific element
    const element = await page.$(selector);
    if (element) {
      await element.screenshot({ 
        path: filepath as `${string}.png`
      });
    }
    
    await page.close();
    return `/screenshots/${filename}`;
  } finally {
    await browser.close();
  }
}

export async function getPageMetadata(url: string): Promise<{
  title: string;
  loadTime: number;
  pageSize: number;
  technologies: string[];
}> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    try {
      // Track load time
      const startTime = Date.now();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const loadTime = Date.now() - startTime;

      // Get page title
      const title = await page.title();

      // Get page size (approximate)
      const pageSize = await page.evaluate(() => {
        return new Blob([document.documentElement.outerHTML]).size / 1024; // KB
      });

      // Detect technologies
      const technologies = await page.evaluate(() => {
        const techs: string[] = [];
        
        // Check for common frameworks
        if ((window as any).React) techs.push('React');
        if ((window as any).Vue) techs.push('Vue.js');
        if ((window as any).Angular) techs.push('Angular');
        if ((window as any).jQuery) techs.push('jQuery');
        
        // Check for common libraries
        if (document.querySelector('[data-reactroot]')) techs.push('React');
        if (document.querySelector('[ng-app]')) techs.push('Angular');
        if (document.querySelector('[v-app]')) techs.push('Vue.js');
        
        // Check for common CSS frameworks
        if (document.querySelector('.bootstrap')) techs.push('Bootstrap');
        if (document.querySelector('.tailwind')) techs.push('Tailwind CSS');
        if (document.querySelector('.foundation')) techs.push('Foundation');
        
        return techs;
      });

      return {
        title,
        loadTime,
        pageSize: Math.round(pageSize),
        technologies
      };
    } catch (error) {
      console.warn('Metadata capture failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
} 