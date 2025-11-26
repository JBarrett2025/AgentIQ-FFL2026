
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) => {
    if (!isOpen) return null;

    const confirmButtonClasses = isDanger 
        ? 'bg-red-600 hover:bg-red-700' 
        : 'bg-blue-600 hover:bg-blue-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-3xl font-semibold leading-none">&times;</button>
                </div>
                <p className="text-gray-600 mb-6 whitespace-pre-wrap">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className={`px-5 py-2 text-white rounded-md font-semibold ${confirmButtonClasses}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
