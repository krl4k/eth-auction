import React, { useState, useEffect } from 'react';
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

    // Загрузка аукционов при подключении кошелька
    useEffect(() => {
        if (account) {
            loadAuctions();
        }
    }, [account]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-4 space-y-6">
                <WalletConnection
                    account={account}
                    chainId={chainId}
                    isConnecting={web3Loading}
                    error={web3Error}
                    onConnect={connectWallet}
                />

                <ErrorAlert error={error || web3Error} />

                {account && (
                    <>
                        <CreateAuctionForm
                            formData={formData}
                            onChange={setFormData}
                            onSubmit={handleCreateAuction}
                            isLoading={web3Loading}
                            error={error}
                        />

                        <AuctionList
                            auctions={auctions}
                            account={account}
                            onBuy={handleBuy}
                            onCancel={handleCancel}
                            isLoading={web3Loading}
                            error={error}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default App;