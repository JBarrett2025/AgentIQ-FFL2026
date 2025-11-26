import React from 'react';

export const BackArrowIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

export const HomeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-7 4h6" />
    </svg>
);

export const PreviousArrowIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);

export const NextArrowIcon: React.FC<{className?: string}> = ({className = 'h-6 w-6'}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

export const FolderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

export const SparklesIcon: React.FC<{className?: string}> = ({className = 'h-5 w-5'}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zM13 15a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

export const FilmIcon: React.FC<{className?: string}> = ({className = 'h-5 w-5'}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm-1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm11-1a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 00-1-1h-2zM4 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm11-1a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2zM4 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm11-1a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2z" clipRule="evenodd" />
    </svg>
);

export const PhotoIcon: React.FC<{className?: string}> = ({className = 'h-5 w-5'}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-3.69l-2.78-2.78a.75.75 0 00-1.06 0l-2.12 2.122a.75.75 0 01-1.06 0L9.47 8.192a.75.75 0 00-1.06 0L6.44 10.162a.75.75 0 01-1.06 0L2.5 7.28zM12.25 6a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" />
    </svg>
);

export const PaletteIcon: React.FC<{className?: string}> = ({className = 'h-5 w-5'}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.22 3.22a.75.75 0 011.06 0L7.5 4.44a.75.75 0 01-1.06 1.06L5.22 4.28a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zM5.22 15.72a.75.75 0 010-1.06L6.44 13.5a.75.75 0 011.06 1.06L5.22 15.72zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18zM14.78 15.72a.75.75 0 01-1.06 0L12.5 14.44a.75.75 0 111.06-1.06l1.22 1.22a.75.75 0 010 1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM14.78 3.22a.75.75 0 010 1.06L13.56 5.5a.75.75 0 01-1.06-1.06L13.72 3.22a.75.75 0 011.06 0z" />
      <path fillRule="evenodd" d="M10 5a5 5 0 100 10 5 5 0 000-10zM8.375 7.404a.75.75 0 00-1.14-.993l-2.5 2.857a.75.75 0 001.14.993L8.375 7.404zM9.95 6.5a.75.75 0 01.428.643l.004.017.02.093a2.953 2.953 0 01.14 1.018V10A.75.75 0 0110 10.75a.75.75 0 01-.75-.75v-1.928a4.453 4.453 0 00-.21-1.518l-.005-.022-.016-.076a.75.75 0 01.95-.718zM12.42 12.06a.75.75 0 001.138.993l2.25-2.571a.75.75 0 00-1.138-.993l-2.25 2.571z" clipRule="evenodd" />
    </svg>
);