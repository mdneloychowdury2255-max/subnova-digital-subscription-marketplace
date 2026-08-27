import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageOpen className="w-12 h-12 text-slate-500" />,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-800 light:border-slate-300 bg-slate-900/20 light:bg-slate-50/50 ${className}`}>
      <div className="p-4 rounded-2xl bg-slate-800/50 light:bg-slate-100 text-purple-400 mb-4 inline-flex items-center justify-center">
        {icon}
      </div>
      <h4 className="text-base sm:text-lg font-bold text-white light:text-slate-900 mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
