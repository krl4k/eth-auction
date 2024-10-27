import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SUPPORTED_CHAINS } from '../constants/contract';

const useWeb3 = () => {
    const [account, setAccount] = useState('');
    const [chainId, setChainId] = useState('');
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Подключение к MetaMask
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            setError('Пожалуйста, установите MetaMask');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            // Запрос на подключение аккаунта
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            // Получение провайдера и подписчика
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();

            // Проверка поддерживаемой сети
            const chainId = network.chainId.toString(16);
            console.log('chainId', chainId);
            if (!SUPPORTED_CHAINS[chainId]) {
                throw new Error('Пожалуйста, переключитесь на поддерживаемую сеть');
            }

            // Создание экземпляра контракта
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );

            setAccount(accounts[0]);
            setChainId(`0x${chainId}`);
            setProvider(provider);
            setSigner(signer);
            setContract(contract);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Получение списка аукционов
    const getAuctions = useCallback(async () => {
        if (!contract) return [];

        try {
            setIsLoading(true);
            const auctionCount = await contract.auctionIdCounter();
            const auctions = [];

            for (let i = 0; i < auctionCount; i++) {
                const auction = await contract.getAuction(i);
                const currentPrice = await contract.getCurrentPrice(i);

                auctions.push({
                    id: i,
                    seller: auction.seller,
                    itemDescription: auction.itemDescription,
                    startingPrice: auction.startingPrice,
                    endingPrice: auction.endingPrice,
                    duration: auction.duration,
                    startAt: auction.startAt,
                    currentPrice: currentPrice,
                    active: auction.active
                });
            }

            return auctions;
        } catch (err) {
            setError('Ошибка при загрузке аукционов: ' + err.message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    // Создание аукциона
    const createAuction = useCallback(async (itemDescription, startingPrice, endingPrice, duration) => {
        if (!contract) throw new Error('Контракт не инициализирован');

        try {
            setIsLoading(true);
            setError('');

            const tx = await contract.createAuction(
                itemDescription,
                ethers.parseEther(startingPrice.toString()),
                ethers.parseEther(endingPrice.toString()),
                duration * 60 // конвертируем минуты в секунды
            );

            await tx.wait();
            return tx.hash;
        } catch (err) {
            setError('Ошибка при создании аукциона: ' + err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    // Покупка предмета
    const buyItem = useCallback(async (auctionId, price) => {
        if (!contract) throw new Error('Контракт не инициализирован');

        try {
            setIsLoading(true);
            setError('');

            const tx = await contract.buy(auctionId, {
                value: price
            });

            await tx.wait();
            return tx.hash;
        } catch (err) {
            setError('Ошибка при покупке: ' + err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    // Отмена аукциона
    const cancelAuction = useCallback(async (auctionId) => {
        if (!contract) throw new Error('Контракт не инициализирован');

        try {
            setIsLoading(true);
            setError('');

            const tx = await contract.cancelAuction(auctionId);
            await tx.wait();
            return tx.hash;
        } catch (err) {
            setError('Ошибка при отмене аукциона: ' + err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    // Обработчики событий MetaMask
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setAccount(accounts[0] || '');
                if (!accounts[0]) {
                    setError('Пожалуйста, подключите кошелек');
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            window.ethereum.on('disconnect', () => {
                setAccount('');
                setError('Кошелек отключен');
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners();
            }
        };
    }, []);

    return {
        account,
        chainId,
        provider,
        signer,
        contract,
        error,
        isLoading,
        connectWallet,
        getAuctions,
        createAuction,
        buyItem,
        cancelAuction
    };
};

export default useWeb3;