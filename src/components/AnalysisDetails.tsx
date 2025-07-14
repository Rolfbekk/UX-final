import { AnalysisDetails as AnalysisDetailsType, Issue } from "../types/analysis";

interface AnalysisDetailsProps {
  details: AnalysisDetailsType;
}

const severityColors = {
  low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  critical: 'text-red-400 bg-red-400/10 border-red-400/20'
};

const severityIcons = {
  low: 'ℹ️',
  medium: '⚠️',
  high: '🚨',
  critical: '💥'
};

export default function AnalysisDetails({ details }: AnalysisDetailsProps) {
  const categories = [
    {
      key: 'accessibility' as keyof AnalysisDetailsType,
      name: 'Accessibility',
      icon: '♿',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400'
    },
    {
      key: 'performance' as keyof AnalysisDetailsType,
      name: 'Performance',
      icon: '⚡',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      key: 'usability' as keyof AnalysisDetailsType,
      name: 'Usability',
      icon: '🎯',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      key: 'design' as keyof AnalysisDetailsType,
      name: 'Design',
      icon: '🎨',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      textColor: 'text-pink-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((category) => {
        const data = details[category.key];
        return (
          <div key={category.key} className={`${category.bgColor} backdrop-blur-xl rounded-2xl p-6 border ${category.borderColor} shadow-xl break-words`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-xl">{category.icon}</span>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${category.textColor}`}>
                  {category.name}
                </h3>
                <p className="text-gray-400 text-sm">UX Category</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-white">{data.score}</span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                <div 
                  className={`bg-gradient-to-r ${category.color} h-3 rounded-full transition-all duration-1000 shadow-lg`}
                  style={{ width: `${data.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">
                {data.score >= 90 ? "Excellent" : 
                 data.score >= 80 ? "Very Good" : 
                 data.score >= 70 ? "Good" : 
                 data.score >= 60 ? "Fair" : "Needs Work"}
              </p>
            </div>

            {data.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Issues Found ({data.issues.length})
                </h4>
                <div className="space-y-4">
                  {data.issues.map((issue: Issue, index: number) => (
                    <div key={issue.id || `fallback-${category.key}-${index}`} className="bg-black/20 rounded-lg p-4 border border-white/10 break-words">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-semibold text-white flex-1">{issue.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${severityColors[issue.severity]}`}>
                          {severityIcons[issue.severity]} {issue.severity}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{issue.description}</p>
                      
                      {issue.location?.element && (
                        <div className="mb-2">
                          <span className="text-xs text-gray-400">Location: </span>
                          <span className="text-xs text-blue-300">{issue.location.element}</span>
                          {issue.location.page && (
                            <span className="text-xs text-gray-500 ml-1">({issue.location.page})</span>
                          )}
                        </div>
                      )}
                      
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Impact: </span>
                        <span className="text-xs text-orange-300">{issue.impact}</span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-xs text-gray-400">Recommendation: </span>
                        <span className="text-xs text-green-300">{issue.recommendation}</span>
                      </div>
                      
                      {issue.codeExample && (
                        <details className="mt-3">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                            Show code example
                          </summary>
                          <pre className="mt-2 p-2 bg-black/30 rounded text-xs text-green-300 overflow-x-auto break-words whitespace-pre-line">
                            <code className="break-words whitespace-pre-line">{issue.codeExample}</code>
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 