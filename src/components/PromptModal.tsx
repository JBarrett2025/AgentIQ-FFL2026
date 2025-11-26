import React, { useState, useEffect } from 'react';

interface PromptModalProps {
    isOpen: boolean;
    title: string;
    label: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

const PromptModal: React.FC<PromptModalProps> = ({ isOpen, title, label, defaultValue = '', onConfirm, onCancel, confirmText = 'Save', cancelText = 'Cancel', isLoading = false }) => {
    const [inputValue, setInputValue] = useState(defaultValue);

    useEffect(() => {
        if (isOpen) {
            setInputValue(defaultValue);
        }
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    const handleConfirmClick = () => {
        if (inputValue.trim() && !isLoading) {
            onConfirm(inputValue.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-3xl font-semibold leading-none" disabled={isLoading}>&times;</button>
                </div>
                <div className="mb-6">
                    <label htmlFor="prompt-input" className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
                    <textarea
                        id="prompt-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100 resize-y min-h-[100px]"
                        autoFocus
                        disabled={isLoading}
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold disabled:bg-gray-100" disabled={isLoading}>
                        {cancelText}
                    </button>
                    <button 
                        onClick={handleConfirmClick} 
                        className="px-5 py-2 text-white rounded-md font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center min-w-[90px]"
                        disabled={!inputValue.trim() || isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptModal;