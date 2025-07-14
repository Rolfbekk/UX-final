#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { analyzeWebsite } = require('./analyze-website.js');
const { OpenAI } = require('openai');
require('dotenv').config();

const PROMPT = `You are a senior UX/UI designer. You are given the HTML and text content of a website, along with a screenshot.

Evaluate the UX and UI of the page based on:
- Visual hierarchy
- Navigation flow
- Clarity of calls-to-action (CTAs)
- Mobile responsiveness (based on layout clues)
- Accessibility (contrast, font sizes, alt-text)

Return:
1. UX Score (1-10)
2. UI Score (1-10)
3. Top 3 strengths
4. Top 3 problems with suggestions
5. Summary in bullet points

Consider best practices like Nielsen Norman’s heuristics and WCAG accessibility standards.`;

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node aiux-evaluate.js <URL>');
    process.exit(1);
  }
  const url = args[0];
  const outputDir = './aiux-outputs';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // 1. Analyze the website
  console.log(`\n🔍 Analyzing: ${url}`);
  const analysis = await analyzeWebsite(url, { saveScreenshot: true, outputDir });

  // 2. Read screenshot as base64
  let screenshotBase64 = null;
  if (analysis.screenshot && fs.existsSync(analysis.screenshot)) {
    const imgBuffer = fs.readFileSync(analysis.screenshot);
    screenshotBase64 = imgBuffer.toString('base64');
  }

  // 3. Prepare the AI input
  const aiInput = [
    { role: 'system', content: PROMPT },
    { role: 'user', content: `Website URL: ${url}\n\n---\n\nHTML (truncated):\n${analysis.html}\n\n---\n\nVisible Text (truncated):\n${analysis.visibleText}` },
  ];
  if (screenshotBase64) {
    aiInput.push({
      role: 'user',
      content: [
        { type: 'text', text: 'Here is a screenshot of the page.' },
        { type: 'image_url', image_url: { "url": `data:image/png;base64,${screenshotBase64}` } }
      ]
    });
  }

  // 4. Send to Azure OpenAI
  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
  });
  
  console.log('\n🤖 Sending data to Azure OpenAI...');
  const completion = await openai.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
    messages: aiInput,
    max_tokens: 1024,
    temperature: 0.3,
  });

  const aiResponse = completion.choices[0]?.message?.content || '[No response]';

  // 5. Output results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '-');
  const outPath = path.join(outputDir, `${domain}-${timestamp}-aiux-eval.txt`);
  fs.writeFileSync(outPath, aiResponse);

  console.log('\n✅ AI UX/UI Evaluation Complete!');
  console.log(`\n📄 Saved AI evaluation to: ${outPath}`);
  console.log('\n---\n');
  console.log(aiResponse);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
}); 