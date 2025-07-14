const { analyzeWebsite } = require('./analyze-website.js');

async function testAnalyzer() {
  const testUrl = 'https://example.com';
  
  console.log('🧪 Testing website analyzer...');
  console.log(`Test URL: ${testUrl}`);
  
  try {
    const results = await analyzeWebsite(testUrl, {
      saveScreenshot: true,
      outputDir: './test-outputs'
    });
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📊 Results Summary:');
    console.log(`URL: ${results.url}`);
    console.log(`Title: ${results.metadata.title}`);
    console.log(`Description: ${results.metadata.description}`);
    console.log(`Text Length: ${results.analysis.textLength} characters`);
    console.log(`HTML Length: ${results.analysis.htmlLength} characters`);
    console.log(`Accessibility Score: ${results.analysis.accessibilityScore}/100`);
    console.log(`Screenshot: ${results.screenshot}`);
    console.log(`Performance - Load Time: ${results.performance.loadTime.toFixed(2)}ms`);
    
    console.log('\n🔍 Sample of extracted text:');
    console.log(results.visibleText.substring(0, 200) + '...');
    
    console.log('\n📁 Files created:');
    console.log(`- JSON: ${results.url.replace(/[^a-zA-Z0-9]/g, '-')}-${results.timestamp.replace(/[:.]/g, '-')}.json`);
    console.log(`- Screenshot: ${results.screenshot}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAnalyzer(); 