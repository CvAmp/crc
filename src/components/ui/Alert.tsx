import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const styles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-600 dark:text-red-400',
      icon: AlertCircle
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-600 dark:text-green-400',
      icon: CheckCircle2
    }
  };

  const { bg, border, text, icon: Icon } = styles[type];

  return (
    <div className={`p-4 ${bg} border ${border} rounded-md flex items-start`}>
      <Icon className={`w-5 h-5 ${text} mr-2 flex-shrink-0 mt-0.5`} />
      <p className={text}>{message}</p>
    </div>
  );
}