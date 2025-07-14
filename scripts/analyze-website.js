#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Analyzes a website using Playwright
 * @param {string} url - The URL to analyze
 * @param {Object} options - Analysis options
 * @param {boolean} options.saveScreenshot - Whether to save screenshot to file (default: true)
 * @param {string} options.outputDir - Directory to save outputs (default: './outputs')
 * @param {number} options.viewportWidth - Viewport width (default: 1920)
 * @param {number} options.viewportHeight - Viewport height (default: 1080)
 * @param {number} options.timeout - Navigation timeout in ms (default: 30000)
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeWebsite(url, options = {}) {
  const {
    saveScreenshot = true,
    outputDir = './outputs',
    viewportWidth = 1920,
    viewportHeight = 1080,
    timeout = 30000
  } = options;

  let browser;
  let page;

  try {
    // Create output directory if it doesn't exist
    if (saveScreenshot && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    // Create new page
    page = await browser.newPage({
      viewport: { width: viewportWidth, height: viewportHeight },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // Set timeout
    page.setDefaultTimeout(timeout);

    console.log(`🌐 Navigating to: ${url}`);

    // Navigate to the URL
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: timeout
    });

    if (!response.ok()) {
      throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`);
    }

    console.log('✅ Page loaded successfully');

    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);

    // Extract page information
    console.log('📄 Extracting page content...');

    // Get the full HTML
    const html = await page.content();

    // Get visible text content
    const visibleText = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, noscript, iframe, svg, img');
      scripts.forEach(el => el.remove());

      // Get all text content
      const textContent = document.body.innerText || document.body.textContent || '';
      
      // Clean up the text
      return textContent
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
        .trim();
    });

    // Get page metadata
    const metadata = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
        robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        language: document.documentElement.lang || 'en',
        charset: document.characterSet || 'UTF-8'
      };
    });

    // Get accessibility information
    const accessibility = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const links = document.querySelectorAll('a');
      const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
      const forms = document.querySelectorAll('form');
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

      return {
        imagesWithoutAlt: Array.from(images).filter(img => !img.alt).length,
        totalImages: images.length,
        linksWithoutText: Array.from(links).filter(link => !link.textContent.trim()).length,
        totalLinks: links.length,
        buttonsWithoutText: Array.from(buttons).filter(btn => !btn.textContent.trim() && !btn.getAttribute('aria-label')).length,
        totalButtons: buttons.length,
        formsWithoutLabels: Array.from(forms).filter(form => !form.querySelector('label')).length,
        totalForms: forms.length,
        headingStructure: Array.from(headings).map(h => ({ level: h.tagName.toLowerCase(), text: h.textContent.trim() }))
      };
    });

    // Get performance metrics
    const performance = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    });

    // Take screenshot
    console.log('📸 Taking screenshot...');
    let screenshotPath = null;
    let screenshotBase64 = null;

    if (saveScreenshot) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '-');
      screenshotPath = path.join(outputDir, `${domain}-${timestamp}.png`);
      
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      console.log(`📁 Screenshot saved to: ${screenshotPath}`);
    } else {
      screenshotBase64 = await page.screenshot({
        fullPage: true,
        type: 'png'
      });
      screenshotBase64 = screenshotBase64.toString('base64');
    }

    // Get viewport information
    const viewport = await page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight
      };
    });

    // Compile results
    const results = {
      url,
      timestamp: new Date().toISOString(),
      screenshot: saveScreenshot ? screenshotPath : `data:image/png;base64,${screenshotBase64}`,
      html: html.substring(0, 50000), // Limit HTML size for JSON output
      visibleText: visibleText.substring(0, 10000), // Limit text size
      metadata,
      accessibility,
      performance,
      viewport,
      analysis: {
        textLength: visibleText.length,
        htmlLength: html.length,
        hasTitle: !!metadata.title,
        hasDescription: !!metadata.description,
        isResponsive: viewport.scrollWidth > viewport.width,
        accessibilityScore: calculateAccessibilityScore(accessibility)
      }
    };

    console.log('✅ Analysis completed successfully');
    return results;

  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    throw error;
  } finally {
    // Clean up
    if (page) await page.close();
    if (browser) await browser.close();
    console.log('🧹 Browser closed');
  }
}

/**
 * Calculate a basic accessibility score
 */
function calculateAccessibilityScore(accessibility) {
  let score = 100;
  
  // Deduct points for accessibility issues
  if (accessibility.imagesWithoutAlt > 0) {
    score -= (accessibility.imagesWithoutAlt / accessibility.totalImages) * 20;
  }
  
  if (accessibility.linksWithoutText > 0) {
    score -= (accessibility.linksWithoutText / accessibility.totalLinks) * 15;
  }
  
  if (accessibility.buttonsWithoutText > 0) {
    score -= (accessibility.buttonsWithoutText / accessibility.totalButtons) * 15;
  }
  
  if (accessibility.formsWithoutLabels > 0) {
    score -= (accessibility.formsWithoutLabels / accessibility.totalForms) * 10;
  }
  
  return Math.max(0, Math.round(score));
}

/**
 * Main function for command line usage
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node analyze-website.js <URL> [options]');
    console.log('Example: node analyze-website.js https://example.com');
    console.log('Options:');
    console.log('  --no-screenshot    Don\'t save screenshot to file');
    console.log('  --output-dir <dir> Specify output directory');
    console.log('  --width <px>       Set viewport width');
    console.log('  --height <px>      Set viewport height');
    process.exit(1);
  }

  const url = args[0];
  
  // Parse options
  const options = {
    saveScreenshot: !args.includes('--no-screenshot'),
    outputDir: './outputs'
  };

  const outputDirIndex = args.indexOf('--output-dir');
  if (outputDirIndex !== -1 && args[outputDirIndex + 1]) {
    options.outputDir = args[outputDirIndex + 1];
  }

  const widthIndex = args.indexOf('--width');
  if (widthIndex !== -1 && args[widthIndex + 1]) {
    options.viewportWidth = parseInt(args[widthIndex + 1]);
  }

  const heightIndex = args.indexOf('--height');
  if (heightIndex !== -1 && args[heightIndex + 1]) {
    options.viewportHeight = parseInt(args[heightIndex + 1]);
  }

  try {
    console.log(`🔍 Starting analysis of: ${url}`);
    const results = await analyzeWebsite(url, options);
    
    // Save results to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '-');
    const jsonPath = path.join(options.outputDir, `${domain}-${timestamp}.json`);
    
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`📄 Results saved to: ${jsonPath}`);
    
    // Output summary to console
    console.log('\n📊 Analysis Summary:');
    console.log(`URL: ${results.url}`);
    console.log(`Title: ${results.metadata.title}`);
    console.log(`Text Length: ${results.analysis.textLength} characters`);
    console.log(`HTML Length: ${results.analysis.htmlLength} characters`);
    console.log(`Accessibility Score: ${results.analysis.accessibilityScore}/100`);
    console.log(`Performance - Load Time: ${results.performance.loadTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Export for use as a module
module.exports = { analyzeWebsite };

// Run if called directly
if (require.main === module) {
  main();
} 