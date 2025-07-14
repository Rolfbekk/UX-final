"use client";

import { useState, useEffect } from 'react';

export default function ConfigStatus() {
  const [configStatus, setConfigStatus] = useState<{
    hasApiKey: boolean;
    hasEndpoint: boolean;
    hasDeployment: boolean;
    isConfigured: boolean;
  }>({
    hasApiKey: false,
    hasEndpoint: false,
    hasDeployment: false,
    isConfigured: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check configuration by calling the config status API
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/config-status');
        if (response.ok) {
          const data = await response.json();
          setConfigStatus(data);
        }
      } catch (error) {
        console.log('Configuration check failed:', error);
        setConfigStatus({
          hasApiKey: false,
          hasEndpoint: false,
          hasDeployment: false,
          isConfigured: false,
        });
      } finally {
        setLoading(false);
      }
    };

    checkConfig();
  }, []);

  if (loading) return null;

  if (!configStatus.isConfigured) {
    return (
      <div className="bg-amber-500/10 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-400">Azure OpenAI Setup</h3>
            <p className="text-amber-300 text-sm">Configure for real AI analysis</p>
          </div>
        </div>
        <p className="text-amber-200 mb-4">
          To enable real AI analysis, add your Azure OpenAI credentials to <code className="bg-amber-500/20 px-2 py-1 rounded text-amber-100">.env.local</code>:
        </p>
        <div className="bg-slate-800/50 p-4 rounded-xl text-sm font-mono text-amber-100 border border-amber-500/20">
          AZURE_OPENAI_API_KEY=your_api_key_here<br/>
          AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/<br/>
          AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name<br/>
          AZURE_OPENAI_API_VERSION=2024-02-15-preview
        </div>
        <p className="text-amber-300 text-sm mt-3">
          Currently using Playwright analysis only. Add Azure OpenAI for comprehensive AI-powered UX/UI evaluation.
        </p>
      </div>
    );
  }

  // If configured, render nothing
  return null;
} 