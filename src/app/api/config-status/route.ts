import { NextResponse } from 'next/server';

export async function GET() {
  const hasApiKey = !!process.env.AZURE_OPENAI_API_KEY;
  const hasEndpoint = !!process.env.AZURE_OPENAI_ENDPOINT;
  const hasDeployment = !!process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const isConfigured = hasApiKey && hasEndpoint && hasDeployment;

  return NextResponse.json({
    hasApiKey,
    hasEndpoint,
    hasDeployment,
    isConfigured,
  });
} 