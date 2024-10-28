import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { X } from 'lucide-react'; // Импортируем иконку крестика

const ErrorAlert = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <Alert variant="destructive" className="mb-4 relative">
            <AlertTitle className="flex justify-between items-center">
                Ошибка
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-red-600 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
};

export default ErrorAlert;