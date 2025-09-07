import React from 'react';
import { PROMPT_TEMPLATES } from '../constants';
import { LightBulbIcon } from './IconComponents';

interface PromptTemplatesProps {
  onTemplateSelect: (template: string) => void;
  disabled?: boolean;
}

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({
  onTemplateSelect,
  disabled = false
}) => {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-600 p-4">
      <div className="flex items-center mb-4">
        <LightBulbIcon className="w-5 h-5 text-cyan-400 mr-2" />
        <h3 className="text-lg font-semibold text-cyan-400">Creative Templates</h3>
      </div>

      <div className="max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {PROMPT_TEMPLATES.map((template, index) => (
            <button
              key={index}
              onClick={() => !disabled && onTemplateSelect(template)}
              disabled={disabled}
              className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/30 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg border border-gray-700 hover:border-gray-600 transition-colors text-sm"
            >
              {template}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
