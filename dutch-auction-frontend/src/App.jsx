import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import WalletConnection from './components/WalletConnection';
import CreateAuctionForm from './components/CreateAuctionForm';
import AuctionList from './components/AuctionList';
import ErrorAlert from './components/ErrorAlert';
import useWeb3 from './hooks/useWeb3';

const LoadingScreen = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Connecting to wallet...</p>
        </div>
    </div>
);

function App() {
    const {
        account,
        chainId,
        error: web3Error,
        isLoading: web3Loading,
        connectWallet,
        disconnect,
        getAuctions,
        createAuction,
        buyItem,
        cancelAuction
    } = useWeb3();

    const [activeTab, setActiveTab] = useState('auctions');
    const [auctions, setAuctions] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        itemDescription: '',
        startingPrice: '',
        endingPrice: '',
        duration: ''
    });

    const loadAuctions = async () => {
        try {
            const loadedAuctions = await getAuctions();
            setAuctions(loadedAuctions);
        } catch (err) {
            setError('Failed to load auctions');
        }
    };

    const handleCreateAuction = async () => {
        try {
            await createAuction(
                formData.itemDescription,
                formData.startingPrice,
                formData.endingPrice,
                formData.duration
            );

            setFormData({
                itemDescription: '',
                startingPrice: '',
                endingPrice: '',
                duration: ''
            });

            await loadAuctions();
            setActiveTab('auctions'); // Переключаемся на вкладку с аукционами после создания
        } catch (err) {
            setError('Failed to create auction');
        }
    };

    const handleBuy = async (auctionId, price) => {
        try {
            await buyItem(auctionId, price);
            await loadAuctions();
        } catch (err) {
            setError('Failed to buy item');
        }
    };

    const handleCancel = async (auctionId) => {
        try {
            await cancelAuction(auctionId);
            await loadAuctions();
        } catch (err) {
            setError('Failed to cancel auction');
        }
    };

    // Фильтрация для "Мои аукционы"
    const myAuctions = auctions.filter(
        auction => auction.seller.toLowerCase() === account?.toLowerCase()
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'create':
                return (
                    <div className="max-w-2xl mx-auto">
                        <CreateAuctionForm
                            formData={formData}
                            onChange={setFormData}
                            onSubmit={handleCreateAuction}
                            isLoading={web3Loading}
                            error={error}
                        />
                    </div>
                );

            case 'my-auctions':
                return (
                    <AuctionList
                        auctions={myAuctions}
                        account={account}
                        onBuy={handleBuy}
                        onCancel={handleCancel}
                        isLoading={web3Loading}
                        error={error}
                        showEmpty={true}
                        emptyMessage="You don't have any auctions yet"
                    />
                );

            default:
                return (
                    <AuctionList
                        auctions={auctions}
                        account={account}
                        onBuy={handleBuy}
                        onCancel={handleCancel}
                        isLoading={web3Loading}
                        error={error}
                    />
                );
        }
    };

    useEffect(() => {
        if (account) {
            loadAuctions();
        }
    }, [account]);

    // Показываем экран загрузки только при первичной инициализации
    if (web3Loading && !account) {
        return <LoadingScreen />;
    }

    if (!account) {
        return (
            <WalletConnection
                account={account}
                chainId={chainId}
                isConnecting={web3Loading}
                error={web3Error}
                onConnect={connectWallet}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto p-4">
                    <WalletConnection
                        account={account}
                        chainId={chainId}
                        isConnecting={web3Loading}
                        error={web3Error}
                        onConnect={connectWallet}
                        onDisconnect={disconnect}
                    />
                </div>
            </header>

            <Navigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <main className="flex-1 container mx-auto p-4">
                <ErrorAlert error={error || web3Error} />
                {renderContent()}
            </main>

            <footer className="border-t">
                <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
                    Dutch Auction © 2024
                </div>
            </footer>
        </div>
    );
}

export default App;