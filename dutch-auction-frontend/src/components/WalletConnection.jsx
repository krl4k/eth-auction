import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import {SUPPORTED_CHAINS} from "../constants/contract.js";

const WalletConnection = ({
                              account,
                              chainId,
                              isConnecting,
                              error,
                              onConnect
                          }) => {
    // Получаем укороченный адрес кошелька для отображения
    const shortenAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Получаем название сети по chainId
    const getNetworkName = (chainId) => {
        return SUPPORTED_CHAINS[chainId] || `Chain ID: ${chainId}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dutch Auction</CardTitle>
                <CardDescription>
                    Децентрализованный аукцион с понижением цены
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!account ? (
                    <Button
                        onClick={onConnect}
                        disabled={isConnecting}
                        className="w-full"
                    >
                        {isConnecting ? "Подключение..." : "Подключить MetaMask"}
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 px-4 bg-secondary rounded-md">
                            <span className="text-sm text-muted-foreground">Адрес:</span>
                            <span className="font-medium">{shortenAddress(account)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-4 bg-secondary rounded-md">
                            <span className="text-sm text-muted-foreground">Сеть:</span>
                            <span className="font-medium">{getNetworkName(chainId)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WalletConnection;