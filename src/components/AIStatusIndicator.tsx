import React, { useState, useEffect } from 'react';
import { aiService, AIProvider, AIProviderStatus } from '../services/aiService';

const AIStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<AIProviderStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial load
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const providerStatus = await aiService.getProviderStatus();
      setStatus(providerStatus);
    } catch (error) {
      console.error('Failed to load AI status:', error);
      setStatus({
        provider: AIProvider.NONE,
        available: false,
        details: { error: 'Failed to check AI providers' }
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await aiService.refreshProviders();
      await loadStatus();
    } catch (error) {
      console.error('Failed to refresh AI providers:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!status) {
    return (
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        <span>Checking AI...</span>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (status.provider) {
      case AIProvider.OLLAMA:
        return {
          icon: '🤖',
          label: 'Ollama (Local)',
          details: status.details.models 
            ? `${status.details.models.length} model${status.details.models.length !== 1 ? 's' : ''} • ${status.details.selectedModel || 'No model selected'}`
            : 'Available',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case AIProvider.GEMINI:
        return {
          icon: '☁️',
          label: 'Gemini (Cloud)',
          details: 'API configured',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      default:
        return {
          icon: '❌',
          label: 'No AI Available',
          details: status.details.error || 'Install Ollama or configure Gemini API',
          color: 'text-gray-500 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          borderColor: 'border-gray-200 dark:border-gray-700'
        };
    }
  };

  const info = getStatusInfo();

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${info.bgColor} ${info.borderColor}`}>
      <div className="flex items-center space-x-3">
        <span className="text-lg">{info.icon}</span>
        <div>
          <div className={`text-sm font-medium ${info.color}`}>
            {info.label}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {info.details}
          </div>
        </div>
      </div>
      
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`p-1.5 rounded-md transition-colors ${info.color} hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50`}
        title="Refresh AI status"
      >
        <svg 
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>
    </div>
  );
};

export default AIStatusIndicator;