import OpenAI from 'openai';
import { WebsiteAnalysis, Issue } from '../types/analysis';
import { captureWebsiteScreenshot } from './screenshot';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

// Global issue counter for unique issue IDs
let issueCounter = 0;

// Initialize Azure OpenAI client only if environment variables are available
let openai: OpenAI | null = null;

if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
  openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
  });
}

// Helper function to capture website content
async function captureWebsiteContent(url: string): Promise<{
  html: string;
  visibleText: string;
  metadata: {
    title: string;
    description: string;
    keywords: string;
    viewport: string;
    robots: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonical: string;
    language: string;
    charset: string;
  };
  accessibility: {
    imagesWithoutAlt: number;
    totalImages: number;
    linksWithoutText: number;
    totalLinks: number;
    buttonsWithoutText: number;
    totalButtons: number;
    formsWithoutLabels: number;
    totalForms: number;
    headingStructure: Array<{ level: string; text: string }>;
  };
  performance: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
    scrollWidth: number;
    scrollHeight: number;
  };
}> {
  console.log('🔧 Launching Puppeteer browser with @sparticuz/chromium-min...');
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
  console.log('✅ Browser launched successfully');

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    page.setDefaultTimeout(30000);

    console.log(`🌐 Navigating to: ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response?.status()} ${response?.statusText()}`);
    }

    console.log('✅ Page loaded successfully');
    await new Promise(resolve => setTimeout(resolve, 2000));

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
      const inputs = document.querySelectorAll('input, textarea, select');
      const tables = document.querySelectorAll('table');
      const lists = document.querySelectorAll('ul, ol');

      return {
        imagesWithoutAlt: Array.from(images).filter(img => !img.alt).length,
        totalImages: images.length,
        imageDetails: Array.from(images).map(img => ({
          src: img.src,
          alt: img.alt,
          title: img.title,
          hasAlt: !!img.alt
        })),
        linksWithoutText: Array.from(links).filter(link => !(link.textContent || '').trim()).length,
        totalLinks: links.length,
        linkDetails: Array.from(links).map(link => ({
          href: link.href,
          text: (link.textContent || '').trim(),
          hasText: !!(link.textContent || '').trim()
        })),
        buttonsWithoutText: Array.from(buttons).filter(btn => !(btn.textContent || '').trim() && !btn.getAttribute('aria-label')).length,
        totalButtons: buttons.length,
        buttonDetails: Array.from(buttons).map(btn => ({
          text: (btn.textContent || '').trim(),
          ariaLabel: btn.getAttribute('aria-label'),
          type: btn.getAttribute('type'),
          hasText: !!(btn.textContent || '').trim() || !!btn.getAttribute('aria-label')
        })),
        formsWithoutLabels: Array.from(forms).filter(form => !form.querySelector('label')).length,
        totalForms: forms.length,
        inputDetails: Array.from(inputs).map(input => ({
          type: input.getAttribute('type'),
          name: input.getAttribute('name'),
          id: input.getAttribute('id'),
          hasLabel: !!document.querySelector(`label[for="${input.getAttribute('id')}"]`) || !!input.closest('label')
        })),
        headingStructure: Array.from(headings).map(h => ({ level: h.tagName.toLowerCase(), text: (h.textContent || '').trim() })),
        totalTables: tables.length,
        totalLists: lists.length
      };
    });

    // Get performance metrics
    const performance = await page.evaluate(() => {
      const perf = (performance as any);
      const navigation = perf.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
        firstPaint: perf.getEntriesByType('paint').find((entry: any) => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: perf.getEntriesByType('paint').find((entry: any) => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    });

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

    return {
      html: html.substring(0, 200000), // Increased to 200KB for full website analysis
      visibleText: visibleText.substring(0, 50000), // Increased to 50KB for comprehensive text analysis
      metadata,
      accessibility,
      performance,
      viewport
    };
  } finally {
    await browser.close();
  }
}

export async function analyzeWebsiteWithAI(url: string): Promise<WebsiteAnalysis> {
  // Validate Azure OpenAI configuration
  if (!process.env.AZURE_OPENAI_API_KEY) {
    throw new Error('Azure OpenAI API key is not configured');
  }
  if (!process.env.AZURE_OPENAI_ENDPOINT) {
    throw new Error('Azure OpenAI endpoint is not configured');
  }
  if (!process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
    throw new Error('Azure OpenAI deployment name is not configured');
  }
  
  console.log('🔧 Azure OpenAI configuration validated');
  console.log('🔧 Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);
  console.log('🔧 Deployment:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
  
  // Reset issue counter for this analysis
  issueCounter = 0;
  
  // Capture website content and screenshots
  let websiteContent: any = null;
  let screenshots: { desktop?: string; mobile?: string } = { desktop: undefined, mobile: undefined };
  
  try {
    console.log('📄 Capturing website content...');
    console.log('🔧 Using puppeteer-core with @sparticuz/chromium');
    websiteContent = await captureWebsiteContent(url);
    console.log('✅ Website content captured successfully');
    
    // Also capture screenshots for the UI
    const screenshotResult = await captureWebsiteScreenshot(url).catch((error) => {
      console.warn('Screenshot capture failed:', error.message);
      return { desktop: undefined, mobile: undefined };
    });
    screenshots = screenshotResult;
  } catch (error) {
    console.error('❌ Failed to capture website content:', error);
    throw new Error(`Failed to access website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const systemPrompt = `You are an expert UX/UI analyst and web accessibility specialist. Your task is to analyze websites and provide comprehensive, specific, and actionable feedback.

IMPORTANT: Be extremely specific and detailed in your analysis, but ONLY based on the data provided. Do NOT make up specific measurements, colors, or visual details you cannot verify from the provided content.

Instead of generic statements like "Low contrast in some areas", provide specific details like:
- "Missing alt text on images (found 5 images without alt attributes)"
- "Navigation menu has 3 links without descriptive text"
- "Contact form is missing proper labels for input fields"
- "Page has poor heading structure with missing H1 and H2 elements"

For visual issues like contrast, colors, or spacing, only mention them if you can see them explicitly in the HTML/CSS data provided. Otherwise, focus on structural, semantic, and content-based issues.

Analyze the provided website content and return a detailed analysis in the following JSON format:

{
  "score": number (0-100),
  "strengths": ["specific strength with details"],
  "improvements": ["specific improvement with context"],
  "recommendations": ["actionable recommendation with reasoning"],
  "details": {
    "accessibility": {
      "score": number (0-100),
      "issues": [
        {
          "id": "unique-identifier",
          "title": "Specific issue title",
          "description": "Detailed description of the issue with specific elements, colors, measurements, etc.",
          "severity": "low|medium|high|critical",
          "category": "accessibility",
          "location": {
            "element": "specific element name (e.g., 'navigation menu', 'contact form')",
            "selector": "CSS selector if applicable",
            "page": "page name or URL path"
          },
          "impact": "How this affects users (e.g., 'Screen reader users cannot understand the purpose of this image')",
          "recommendation": "Specific actionable solution with code examples if applicable",
          "codeExample": "Code snippet showing the fix"
        }
      ]
    },
    "performance": {
      "score": number (0-100),
      "issues": [/* same structure as above */]
    },
    "usability": {
      "score": number (0-100),
      "issues": [/* same structure as above */]
    },
    "design": {
      "score": number (0-100),
      "issues": [/* same structure as above */]
    }
  },
  "metadata": {
    "pageTitle": "Page title",
    "loadTime": estimated_load_time_in_ms,
    "pageSize": estimated_page_size_in_kb,
    "technologies": ["detected technologies"]
  }
}

Guidelines for analysis:
- Accessibility: Check alt text presence, ARIA labels, heading structure, form labels, link descriptions, semantic HTML usage
- Performance: Evaluate based on provided metrics (load times, paint times), code structure, resource optimization opportunities
- Usability: Assess navigation structure, content organization, form usability, mobile responsiveness indicators, user flow
- Design: Review HTML structure for visual hierarchy, semantic markup, content organization, and layout patterns

IMPORTANT: Focus on issues you can actually identify from the provided data. Do not make assumptions about visual appearance, colors, or specific measurements unless they are explicitly mentioned in the HTML/CSS content.

For each issue:
1. Be specific about which element has the problem (based on the HTML structure provided)
2. Provide exact counts, element types, or structural details when possible
3. Explain the impact on users
4. Give actionable recommendations with code examples
5. Assign appropriate severity based on user impact

Remember: Only provide feedback on issues you can actually identify from the provided data. Do not make up visual details, colors, or measurements that aren't explicitly present in the HTML/CSS content.

IMPORTANT: If you cannot analyze the website for any reason (content policy, accessibility, etc.), respond with a JSON object explaining why:
{
  "error": "reason_for_failure",
  "message": "Detailed explanation of why analysis failed"
}`;

  const userPrompt = `Please analyze the following website content for: ${url}

WEBSITE CONTENT:
Title: ${websiteContent.metadata.title}
Description: ${websiteContent.metadata.description}
Language: ${websiteContent.metadata.language}

VISIBLE TEXT CONTENT (first 25000 characters):
${websiteContent.visibleText.substring(0, 25000)}

ACCESSIBILITY DATA:
- Images without alt text: ${websiteContent.accessibility.imagesWithoutAlt}/${websiteContent.accessibility.totalImages}
- Links without text: ${websiteContent.accessibility.linksWithoutText}/${websiteContent.accessibility.totalLinks}
- Buttons without text: ${websiteContent.accessibility.buttonsWithoutText}/${websiteContent.accessibility.totalButtons}
- Forms without labels: ${websiteContent.accessibility.formsWithoutLabels}/${websiteContent.accessibility.totalForms}
- Total tables: ${websiteContent.accessibility.totalTables}
- Total lists: ${websiteContent.accessibility.totalLists}
- Heading structure: ${websiteContent.accessibility.headingStructure.map((h: any) => `${h.level}: ${h.text.substring(0, 50)}`).join(', ')}

DETAILED ACCESSIBILITY ANALYSIS:
- Images needing alt text: ${websiteContent.accessibility.imageDetails.filter((img: any) => !img.hasAlt).map((img: any) => img.src.split('/').pop()).join(', ')}
- Links needing text: ${websiteContent.accessibility.linkDetails.filter((link: any) => !link.hasText).map((link: any) => link.href).join(', ')}
- Buttons needing text: ${websiteContent.accessibility.buttonDetails.filter((btn: any) => !btn.hasText).map((btn: any) => btn.type || 'button').join(', ')}
- Inputs without labels: ${websiteContent.accessibility.inputDetails.filter((input: any) => !input.hasLabel).map((input: any) => `${input.type} (${input.name || input.id || 'unnamed'})`).join(', ')}

PERFORMANCE DATA:
- Load time: ${websiteContent.performance.loadTime}ms
- DOM content loaded: ${websiteContent.performance.domContentLoaded}ms
- First paint: ${websiteContent.performance.firstPaint}ms
- First contentful paint: ${websiteContent.performance.firstContentfulPaint}ms

VIEWPORT DATA:
- Width: ${websiteContent.viewport.width}px
- Height: ${websiteContent.viewport.height}px
- Scroll width: ${websiteContent.viewport.scrollWidth}px
- Scroll height: ${websiteContent.viewport.scrollHeight}px

HTML STRUCTURE (first 50000 characters):
${websiteContent.html.substring(0, 50000)}

Provide a comprehensive UX analysis focusing on accessibility, performance, usability, and design. Consider both desktop and mobile experiences.

IMPORTANT: Be extremely specific in your feedback. Instead of saying "some areas have low contrast", identify exactly which elements, what the colors are, and what the contrast ratio is.`;

  try {
    if (!openai) {
      throw new Error('Azure OpenAI client is not initialized - missing environment variables');
    }
    
    console.log('🤖 Sending request to Azure OpenAI...');
    console.log('Model:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o');
    console.log('URL being analyzed:', url);
    
    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 8000, // Increased for more detailed analysis
    });

    console.log('✅ Received response from Azure OpenAI');
    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      console.error('❌ No response content from AI model');
      throw new Error('No response from AI model');
    }
    
    console.log('📝 Response length:', responseContent.length);
    console.log('📝 Response preview:', responseContent.substring(0, 200) + '...');

    // Try to parse the JSON response
    let analysisData;
    try {
      console.log('🔍 Attempting to parse JSON response...');
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('📋 Found JSON match, parsing...');
        analysisData = JSON.parse(jsonMatch[0]) as any;
      } else {
        console.log('📋 No JSON match found, trying to parse entire response...');
        analysisData = JSON.parse(responseContent) as any;
      }
      console.log('✅ JSON parsing successful');
      
      // Check if the AI returned an error response
      if (analysisData.error) {
        console.error('❌ AI returned error response:', analysisData.error);
        throw new Error(`AI cannot analyze this website: ${analysisData.message || analysisData.error}`);
      }
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      console.error('📝 Raw response:', responseContent);
      
      // Check if the AI is rejecting the request
      if (responseContent.toLowerCase().includes('unfortunately') || 
          responseContent.toLowerCase().includes('cannot') ||
          responseContent.toLowerCase().includes('unable') ||
          responseContent.toLowerCase().includes('sorry')) {
        throw new Error(`AI cannot analyze this website: ${responseContent.substring(0, 100)}...`);
      }
      
      throw new Error(`Invalid AI response format: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }

    // Validate and structure the response
    const analysis: WebsiteAnalysis = {
      url,
      score: Math.min(100, Math.max(0, analysisData.score || 70)),
      strengths: analysisData.strengths || [],
      improvements: analysisData.improvements || [],
      recommendations: analysisData.recommendations || [],
      screenshots,
      timestamp: new Date().toISOString(),
      details: {
        accessibility: {
          score: Math.min(100, Math.max(0, analysisData.details?.accessibility?.score || 70)),
          issues: validateIssues(analysisData.details?.accessibility?.issues || [], 'accessibility')
        },
        performance: {
          score: Math.min(100, Math.max(0, analysisData.details?.performance?.score || 70)),
          issues: validateIssues(analysisData.details?.performance?.issues || [], 'performance')
        },
        usability: {
          score: Math.min(100, Math.max(0, analysisData.details?.usability?.score || 70)),
          issues: validateIssues(analysisData.details?.usability?.issues || [], 'usability')
        },
        design: {
          score: Math.min(100, Math.max(0, analysisData.details?.design?.score || 70)),
          issues: validateIssues(analysisData.details?.design?.issues || [], 'design')
        }
      },
      metadata: {
        pageTitle: analysisData.metadata?.pageTitle || websiteContent.metadata.title,
        loadTime: analysisData.metadata?.loadTime || websiteContent.performance.loadTime,
        pageSize: analysisData.metadata?.pageSize || Math.round(websiteContent.html.length / 1024),
        technologies: analysisData.metadata?.technologies || []
      }
    };

    console.log('✅ AI analysis completed successfully');
    return analysis;

  } catch (error) {
    console.error('❌ Enhanced AI analysis failed:', error);
    console.error('Stack trace:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateIssues(issues: any[], category: string): Issue[] {
  return issues.map((issue) => {
    issueCounter++;
    return {
      id: issue.id || `issue-${issueCounter}`,
      title: issue.title || 'Unspecified Issue',
      description: issue.description || 'No description provided',
      severity: ['low', 'medium', 'high', 'critical'].includes(issue.severity) ? issue.severity : 'medium',
      category: category as 'accessibility' | 'performance' | 'usability' | 'design',
      location: issue.location || {},
      impact: issue.impact || 'Impact not specified',
      recommendation: issue.recommendation || 'No recommendation provided',
      codeExample: issue.codeExample || undefined
    };
  });
}

// Fallback function for when AI is not available
export function generateMockAnalysis(url: string, fallbackReason?: string): WebsiteAnalysis {
  return {
    url,
    score: Math.floor(Math.random() * 40) + 60,
    timestamp: new Date().toISOString(),
    fallbackReason: fallbackReason || undefined,
    strengths: [
      "Clean and modern design aesthetic",
      "Good use of white space and typography",
      "Responsive design works well on mobile devices",
      "Clear navigation structure",
      "Fast loading times"
    ],
    improvements: [
      "Call-to-action buttons could be more prominent",
      "Color contrast could be improved for better accessibility",
      "Some pages lack clear user guidance",
      "Contact information could be more accessible",
      "Loading states could provide better user feedback"
    ],
    recommendations: [
      "Implement A/B testing for key conversion elements",
      "Add more interactive elements to increase engagement",
      "Consider adding a chatbot for immediate user support",
      "Optimize images for faster loading",
      "Add breadcrumb navigation for better user orientation"
    ],
    details: {
      accessibility: {
        score: Math.floor(Math.random() * 30) + 70,
        issues: [
          {
            id: "accessibility-contrast-1",
            title: "Low contrast text in navigation menu",
            description: "White text (#FFFFFF) on light gray background (#F0F0F0) has insufficient contrast ratio of 2.1:1",
            severity: "high",
            category: "accessibility",
            location: { element: "navigation menu", page: "homepage" },
            impact: "Users with visual impairments cannot read the navigation text",
            recommendation: "Change background color to darker gray (#666666) for 4.5:1 contrast ratio"
          },
          {
            id: "accessibility-alt-1",
            title: "Missing alt text on hero image",
            description: "Hero banner image 'hero-banner.jpg' lacks descriptive alt text",
            severity: "medium",
            category: "accessibility",
            location: { element: "hero image", page: "homepage" },
            impact: "Screen reader users cannot understand the image content",
            recommendation: "Add descriptive alt text: 'alt=\"Company team working together in modern office\"'"
          }
        ]
      },
      performance: {
        score: Math.floor(Math.random() * 25) + 75,
        issues: [
          {
            id: "performance-images-1",
            title: "Large unoptimized hero image",
            description: "Hero image 'hero-banner.jpg' is 2.3MB and not optimized for web",
            severity: "medium",
            category: "performance",
            location: { element: "hero image", page: "homepage" },
            impact: "Slow page load times, especially on mobile devices",
            recommendation: "Compress image to under 200KB and use WebP format"
          },
          {
            id: "performance-css-1",
            title: "Unoptimized CSS delivery",
            description: "CSS is loaded synchronously and blocks rendering",
            severity: "low",
            category: "performance",
            location: { element: "stylesheet", page: "all" },
            impact: "Delays visual rendering of the page",
            recommendation: "Use critical CSS inlining and async loading for non-critical styles"
          }
        ]
      },
      usability: {
        score: Math.floor(Math.random() * 35) + 65,
        issues: [
          {
            id: "usability-nav-1",
            title: "Complex navigation structure",
            description: "Navigation has 3 levels deep with unclear hierarchy",
            severity: "medium",
            category: "usability",
            location: { element: "main navigation", page: "all" },
            impact: "Users struggle to find desired content quickly",
            recommendation: "Simplify to 2 levels maximum and add breadcrumbs"
          },
          {
            id: "usability-flow-1",
            title: "Unclear user flow on homepage",
            description: "No clear call-to-action or next steps for visitors",
            severity: "high",
            category: "usability",
            location: { element: "homepage content", page: "homepage" },
            impact: "High bounce rate as users don't know what to do next",
            recommendation: "Add prominent CTA button and clear value proposition"
          }
        ]
      },
      design: {
        score: Math.floor(Math.random() * 20) + 80,
        issues: [
          {
            id: "design-spacing-1",
            title: "Inconsistent spacing between sections",
            description: "Sections have varying margins (20px, 40px, 30px) instead of consistent spacing",
            severity: "low",
            category: "design",
            location: { element: "page sections", page: "all" },
            impact: "Visual inconsistency creates poor user experience",
            recommendation: "Use consistent 32px spacing between all sections"
          },
          {
            id: "design-mobile-1",
            title: "Poor mobile layout for contact form",
            description: "Contact form fields are too small (height: 32px) on mobile devices",
            severity: "medium",
            category: "design",
            location: { element: "contact form", page: "contact" },
            impact: "Difficult to tap and interact with form elements",
            recommendation: "Increase form field height to 44px minimum for mobile"
          }
        ]
      }
    },
    metadata: {
      pageTitle: "Sample Website",
      loadTime: 2500,
      pageSize: 1200,
      technologies: ["React", "Next.js", "Tailwind CSS"]
    }
  };
} 