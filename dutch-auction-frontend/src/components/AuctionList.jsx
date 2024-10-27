import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import AuctionCard from './AuctionCard';
import { Alert, AlertDescription } from './ui/alert';

const AuctionList = ({
                         auctions,
                         account,
                         onBuy,
                         onCancel,
                         isLoading,
                         error
                     }) => {
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

    // Фильтрация аукционов
    const filteredAuctions = auctions.filter(auction => {
        switch(filter) {
            case 'active':
                return auction.active;
            case 'completed':
                return !auction.active;
            default:
                return true;
        }
    });

    const myAuctions = auctions.filter(
        auction => auction.seller.toLowerCase() === account?.toLowerCase()
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Аукционы</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2 mb-4">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                        >
                            Все ({auctions.length})
                        </Button>
                        <Button
                            variant={filter === 'active' ? 'default' : 'outline'}
                            onClick={() => setFilter('active')}
                        >
                            Активные ({auctions.filter(a => a.active).length})
                        </Button>
                        <Button
                            variant={filter === 'completed' ? 'default' : 'outline'}
                            onClick={() => setFilter('completed')}
                        >
                            Завершенные ({auctions.filter(a => !a.active).length})
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {account && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Мои аукционы</h3>
                            {myAuctions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myAuctions.map(auction => (
                                        <AuctionCard
                                            key={auction.id}
                                            auction={auction}
                                            account={account}
                                            onBuy={onBuy}
                                            onCancel={onCancel}
                                            isLoading={isLoading}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">У вас пока нет аукционов</p>
                            )}
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Все аукционы</h3>
                        {filteredAuctions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredAuctions.map(auction => (
                                    <AuctionCard
                                        key={auction.id}
                                        auction={auction}
                                        account={account}
                                        onBuy={onBuy}
                                        onCancel={onCancel}
                                        isLoading={isLoading}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Нет доступных аукционов</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuctionList;