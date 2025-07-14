"use client";

import { useState } from "react";
import { WebsiteAnalysis } from "../types/analysis";
import AnalysisDetails from "../components/AnalysisDetails";
import ScreenshotViewer from "../components/ScreenshotViewer";
import ConfigStatus from "../components/ConfigStatus";
import ErrorBoundary from "../components/ErrorBoundary";
import Image from "next/image";



export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [error, setError] = useState("");

  const analyzeWebsite = async () => {
    if (!websiteUrl) {
      setError("Please enter a website URL");
      return;
    }

    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(websiteUrl)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setAnalysis(null);

      const response = await fetch("/api/analyze-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error responses
        if (response.status === 422) {
          setError(data.message || "AI analysis failed for this website. The website might be inaccessible, require authentication, or contain content that cannot be analyzed.");
        } else if (response.status === 503) {
          setError(data.message || "AI service is not configured. Please contact the administrator to enable AI-powered analysis.");
        } else {
          setError(data.message || "Failed to analyze website. Please try again.");
        }
        return;
      }

      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing website:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-8">
            <Image 
              src="/logo.png" 
              alt="AIUX Logo" 
              width={96}
              height={96}
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AIUX
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            AI-powered website analysis that transforms your digital experience. 
            <span className="text-purple-400 font-semibold"> Get instant insights</span> into UX, accessibility, and performance.
          </p>
        </div>

        {/* Configuration Status */}
        <div className="mb-12">
          <ConfigStatus />
        </div>

        {/* Main Analysis Section */}
        <div className="max-w-4xl mx-auto">
          {/* URL Input Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl mb-12">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Analyze Your Website</h2>
                <p className="text-gray-300 text-lg">Enter any website URL to get comprehensive UX insights</p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
                    />
                  </div>
                  <button
                    onClick={analyzeWebsite}
                    disabled={!websiteUrl || isLoading}
                    className="group relative bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Analyze</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* Error display */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-red-300 font-semibold mb-2">Analysis Failed</h3>
                        <p className="text-red-200 text-sm mb-3">{error}</p>
                        <div className="text-red-200/80 text-xs space-y-1">
                          <p>• Make sure the website is publicly accessible</p>
                          <p>• Try a different website URL</p>
                          <p>• Check if the website requires authentication</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-purple-500/30 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI Analysis in Progress</h3>
                  <p className="text-gray-300">Our AI is examining your website for UX insights...</p>
                </div>
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce animation-delay-400"></div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-8">
              {/* Fallback Reason Message */}
              {analysis.fallbackReason && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-2xl p-4 text-center font-medium">
                  {analysis.fallbackReason}
                </div>
              )}
              {/* Overall Score Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">Analysis Results</h2>
                  <div className="text-sm text-gray-400">
                    {new Date(analysis.timestamp || Date.now()).toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 shadow-2xl">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">{analysis.score}</div>
                      <div className="text-sm text-white/80">/100</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">Overall UX Score</h3>
                  <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-4 mb-4">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${analysis.score}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300">
                    {analysis.score >= 90 ? "🌟 Excellent UX" : 
                     analysis.score >= 80 ? "✨ Very Good UX" : 
                     analysis.score >= 70 ? "👍 Good UX" : 
                     analysis.score >= 60 ? "⚠️ Fair UX" : "🚨 Needs Improvement"}
                  </p>
                </div>
              </div>

              {/* Screenshots and Metadata */}
              <ScreenshotViewer 
                screenshots={analysis.screenshots} 
                metadata={analysis.metadata} 
              />

              {/* Detailed Analysis */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Detailed Breakdown</h3>
                <AnalysisDetails details={analysis.details} />
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="bg-green-500/10 backdrop-blur-xl rounded-3xl p-6 border border-green-500/20 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-green-400">Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                      {analysis.strengths.map((strength: string, index: number) => (
                        <li key={`strength-${index}`} className="text-green-300 flex items-start">
                          <span className="mr-3 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {analysis.improvements && analysis.improvements.length > 0 && (
                  <div className="bg-orange-500/10 backdrop-blur-xl rounded-3xl p-6 border border-orange-500/20 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-orange-400">Improvements</h3>
                    </div>
                    <ul className="space-y-3 break-words overflow-x-auto">
                      {analysis.improvements.map((improvement: string, index: number) => (
                        <li key={`improvement-${index}`} className="text-orange-300 flex items-start break-words overflow-x-auto">
                          <span className="mr-3 mt-1">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="bg-blue-500/10 backdrop-blur-xl rounded-3xl p-6 border border-blue-500/20 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-blue-400">Recommendations</h3>
                    </div>
                    <ul className="space-y-3 break-words overflow-x-auto">
                      {analysis.recommendations.map((recommendation: string, index: number) => (
                        <li key={`recommendation-${index}`} className="text-blue-300 flex items-start break-words overflow-x-auto">
                          <span className="mr-3 mt-1">•</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
