import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    hasAzureKey: !!process.env.AZURE_OPENAI_API_KEY,
    hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
    hasDeployment: !!process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    hasVersion: !!process.env.AZURE_OPENAI_API_VERSION,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT ? 'Set' : 'Not set',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME ? 'Set' : 'Not set',
    version: process.env.AZURE_OPENAI_API_VERSION ? 'Set' : 'Not set',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(envVars);
} 