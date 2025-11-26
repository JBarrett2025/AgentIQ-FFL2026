import React, { useEffect } from 'react';

interface VideoPlayerProps {
    url: string;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[90]" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-black rounded-lg shadow-2xl w-full max-w-4xl relative" 
                style={{ aspectRatio: '16 / 9' }} 
                onClick={(e) => e.stopPropagation()}
            >
                <iframe
                    src={url}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded Video Player"
                    className="rounded-lg"
                ></iframe>
                <button 
                    onClick={onClose} 
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white font-bold text-xl leading-none transition-colors" 
                    aria-label="Close video player"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default VideoPlayer;
