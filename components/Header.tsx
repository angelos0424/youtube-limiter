import React from 'react';

interface HeaderProps {
  isPremium: boolean;
  onAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isPremium, onAuth }) => {
  return (
    <header className="bg-white dark:bg-brand-dark shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-10 h-10 text-brand-red" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.73,18.78 17.93,18.84C17.13,18.91 16.44,18.94 15.84,18.94L15,19C12.81,19 11.2,18.84 10.17,18.56C9.27,18.31 8.69,17.73 8.44,16.83C8.31,16.36 8.22,15.73 8.16,14.93C8.09,14.13 8.06,13.44 8.06,12.84L8,12C8,9.81 8.16,8.2 8.44,7.17C8.69,6.27 9.27,5.69 10.17,5.44C11.2,5.16 12.81,5 15,5L15.84,5.06C16.44,5.06 17.13,5.09 17.93,5.16C18.73,5.22 19.36,5.31 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
          </svg>
          <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">
            YouTube Control Center
          </h1>
        </div>
        <button
          onClick={onAuth}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-200 ${
            isPremium
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isPremium ? 'Log Out' : 'Sign In with Google'}
        </button>
      </div>
    </header>
  );
};
