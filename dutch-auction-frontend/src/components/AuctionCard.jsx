import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ethers } from 'ethers';

const AuctionCard = ({
                         auction,
                         account,
                         onBuy,
                         onCancel,
                         isLoading
                     }) => {
    const [timeLeft, setTimeLeft] = useState('');

    const formatPrice = (price) => {
        return Number(ethers.formatEther(price)).toFixed(3);
    };

    const calculateTimeLeft = () => {
        const now = Date.now() / 1000; // текущее время в секундах
        const endTime = Number(auction.startAt) + Number(auction.duration);
        const diff = endTime - now;

        if (diff <= 0) return 'Завершен';

        const minutes = Math.floor(diff / 60);
        const seconds = Math.floor(diff % 60);
        return `${minutes}м ${seconds}с`;
    };

    useEffect(() => {
        if (!auction.active) return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [auction]);

    const isSeller = account?.toLowerCase() === auction.seller.toLowerCase();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{auction.itemDescription}</CardTitle>
                <CardDescription>
                    Продавец: {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between items-center py-2 px-4 bg-secondary rounded-md">
                    <span className="text-sm text-muted-foreground">Текущая цена:</span>
                    <span className="font-medium">{formatPrice(auction.currentPrice)} ETH</span>
                </div>

                <div className="flex justify-between items-center py-2 px-4 bg-secondary rounded-md">
                    <span className="text-sm text-muted-foreground">Начальная цена:</span>
                    <span className="font-medium">{formatPrice(auction.startingPrice)} ETH</span>
                </div>

                <div className="flex justify-between items-center py-2 px-4 bg-secondary rounded-md">
                    <span className="text-sm text-muted-foreground">Конечная цена:</span>
                    <span className="font-medium">{formatPrice(auction.endingPrice)} ETH</span>
                </div>

                {auction.active && (
                    <div className="flex justify-between items-center py-2 px-4 bg-secondary rounded-md">
                        <span className="text-sm text-muted-foreground">Осталось времени:</span>
                        <span className="font-medium">{timeLeft}</span>
                    </div>
                )}

                <div className="flex justify-between items-center py-2 px-4 bg-secondary rounded-md">
                    <span className="text-sm text-muted-foreground">Статус:</span>
                    <span className={`font-medium ${auction.active ? 'text-green-600' : 'text-red-600'}`}>
            {auction.active ? 'Активный' : 'Завершен'}
          </span>
                </div>
            </CardContent>
            <CardFooter className="space-x-2">
                {auction.active && (
                    <>
                        {!isSeller && (
                            <Button
                                className="flex-1"
                                onClick={() => onBuy(auction.id, auction.currentPrice)}
                                disabled={isLoading}
                            >
                                Купить
                            </Button>
                        )}
                        {isSeller && (
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => onCancel(auction.id)}
                                disabled={isLoading}
                            >
                                Отменить
                            </Button>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default AuctionCard;