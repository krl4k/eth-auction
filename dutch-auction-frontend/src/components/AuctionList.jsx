import {Alert, AlertDescription} from "./ui/alert.jsx";
import AuctionCard from "./AuctionCard.jsx";

const AuctionList = ({
                         auctions,
                         account,
                         onBuy,
                         onCancel,
                         isLoading,
                         error,
                         showEmpty = false,
                         emptyMessage = "Нет доступных аукционов"
                     }) => {
    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {auctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {auctions.map(auction => (
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
                showEmpty && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{emptyMessage}</p>
                    </div>
                )
            )}
        </div>
    );
};

export default AuctionList;