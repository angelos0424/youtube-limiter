import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-brand-dark shadow-lg rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
};
