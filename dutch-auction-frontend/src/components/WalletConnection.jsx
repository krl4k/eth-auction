import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { LogOut } from 'lucide-react';
import {SUPPORTED_CHAINS} from "../constants/contract.js"; // Импортируем иконку

const WalletConnection = ({
                              account,
                              chainId,
                              isConnecting,
                              error,
                              onConnect,
                              onDisconnect
                          }) => {
    const shortenAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getNetworkName = (chainId) => {
        return SUPPORTED_CHAINS[chainId] || `Chain ID: ${chainId}`;
    };

    if (!account) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Card className="w-[400px] shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Dutch Auction</CardTitle>
                        <CardDescription>
                            Подключите кошелек для начала работы
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={onConnect}
                            disabled={isConnecting}
                            className="w-full h-12 text-lg"
                            size="lg"
                        >
                            {isConnecting ? (
                                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Подключение...
                </span>
                            ) : (
                                "Подключить MetaMask"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Dutch Auction</CardTitle>
                        <CardDescription>
                            Децентрализованный аукцион с понижением цены
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDisconnect}
                        className="flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Сменить кошелек
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    );
};

export default WalletConnection;