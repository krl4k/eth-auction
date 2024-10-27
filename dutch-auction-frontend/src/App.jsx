// App.js
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import WalletConnection from './components/WalletConnection';
import CreateAuctionForm from './components/CreateAuctionForm';
import AuctionList from './components/AuctionList';
import ErrorAlert from './components/ErrorAlert';
import useWeb3 from './hooks/useWeb3';

function App() {
    const {
        account,
        chainId,
        error: web3Error,
        isLoading: web3Loading,
        connectWallet,
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

// Загрузка аукционов
    const loadAuctions = async () => {
        try {
            const loadedAuctions = await getAuctions();
            setAuctions(loadedAuctions);
        } catch (err) {
            setError('Ошибка при загрузке аукционов');
        }
    };

    // Создание нового аукциона
    const handleCreateAuction = async () => {
        try {
            await createAuction(
                formData.itemDescription,
                formData.startingPrice,
                formData.endingPrice,
                formData.duration
            );

            // Очистка формы
            setFormData({
                itemDescription: '',
                startingPrice: '',
                endingPrice: '',
                duration: ''
            });

            // Перезагрузка списка аукционов
            await loadAuctions();
        } catch (err) {
            setError('Ошибка при создании аукциона');
        }
    };

    // Покупка предмета
    const handleBuy = async (auctionId, price) => {
        try {
            await buyItem(auctionId, price);
            await loadAuctions();
        } catch (err) {
            setError('Ошибка при покупке');
        }
    };

    // Отмена аукциона
    const handleCancel = async (auctionId) => {
        try {
            await cancelAuction(auctionId);
            await loadAuctions();
        } catch (err) {
            setError('Ошибка при отмене аукциона');
        }
    };

    // Фильтрация для "Мои аукционы"
    const myAuctions = auctions.filter(
        auction => auction.seller.toLowerCase() === account?.toLowerCase()
    );

    // Рендер контента в зависимости от активной вкладки
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
                        emptyMessage="У вас пока нет аукционов"
                    />
                );

            default: // 'auctions'
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

    // Загрузка аукционов при подключении кошелька
    useEffect(() => {
        if (account) {
            loadAuctions();
        }
    }, [account]);

    return (
        <div className="min-h-screen bg-background">
            {!account ? (
                <WalletConnection
                    account={account}
                    chainId={chainId}
                    isConnecting={web3Loading}
                    error={web3Error}
                    onConnect={connectWallet}
                />
            ) : (
                <div className="flex flex-col min-h-screen">
                    <header className="border-b">
                        <div className="container mx-auto p-4">
                            <WalletConnection
                                account={account}
                                chainId={chainId}
                                isConnecting={web3Loading}
                                error={web3Error}
                                onConnect={connectWallet}
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
            )}
        </div>
    );
}

export default App;