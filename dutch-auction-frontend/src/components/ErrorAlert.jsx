import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const ErrorAlert = ({ error }) => {
    if (!error) return null;

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
};

export default ErrorAlert;