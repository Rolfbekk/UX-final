import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsiteWithAI, generateMockAnalysis } from '../../../utils/ai-analysis';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format. Please provide a URL starting with http:// or https://' },
        { status: 400 }
      );
    }

    let analysis;

    // Check if Azure OpenAI is configured
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
      try {
        console.log('🔍 Using enhanced AI analysis...');
        analysis = await analyzeWebsiteWithAI(url);
      } catch (aiError) {
        console.error('❌ Enhanced AI analysis failed:', aiError);
        
        // Check if it's a content policy violation or technical failure
        const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
        
        if (errorMessage.includes('AI cannot analyze this website') || 
            errorMessage.includes('content policy') ||
            errorMessage.includes('cannot process')) {
          // Content policy violation - return 422
          return NextResponse.json(
            { 
              error: 'AI analysis failed',
              message: 'Unable to analyze this website. This could be due to the website being inaccessible, requiring authentication, or having content that the AI cannot process.',
              url: url,
              timestamp: new Date().toISOString()
            },
            { status: 422 }
          );
        } else {
          // Technical failure - fall back to basic analysis
          console.log('⚠️ AI failed for technical reasons, falling back to basic analysis...');
          analysis = generateMockAnalysis(url, 'AI failed for technical reasons, here is a basic analysis for demonstration purposes.');
        }
      }
    } else {
      console.log('⚠️ Azure OpenAI not configured, using basic analysis...');
      analysis = generateMockAnalysis(url);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('❌ Error analyzing website:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
} 