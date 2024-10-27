import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, SUPPORTED_CHAINS } from '../constants/contract';
import { abi as CONTRACT_ABI } from "../../../artifacts/contracts/Auction.sol/DutchAuctionWithFee.json";

const useWeb3 = () => {
    const [account, setAccount] = useState('');
    const [chainId, setChainId] = useState('');
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const resetState = () => {
        setAccount('');
        setChainId('');
        setProvider(null);
        setSigner(null);
        setContract(null);
        setError('');
        setIsInitialized(false);
    };

    const disconnect = async () => {
        try {
            if (window.ethereum) {
                resetState();

                // Запрашиваем новое подключение после отключения
                // Это заставит MetaMask показать окно выбора аккаунта
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{
                        eth_accounts: {}
                    }]
                });

                // После выбора нового аккаунта, подключаемся к нему
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                if (accounts.length > 0) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const network = await provider.getNetwork();
                    const chainId = '0x' + network.chainId.toString(16);

                    setAccount(accounts[0]);
                    setChainId(chainId);
                    setProvider(provider);
                    setSigner(signer);
                    await initializeContract(signer);
                }
            }
        } catch (err) {
            console.error('Error during disconnection:', err);
            // Если пользователь отменил выбор аккаунта, сбрасываем состояние
            resetState();
        }
    };

    const initializeContract = async (signer) => {
        try {
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );
            setContract(contract);
        } catch (err) {
            console.error('Contract initialization error:', err);
            setError('Failed to initialize contract');
        }
    };


    const setupProviderAndSigner = async (ethereum) => {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString(16);

        console.log('Chain ID:', chainId);
        if (!SUPPORTED_CHAINS[chainId]) {
            throw new Error('Please switch to a supported network');
        }

        setProvider(provider);
        setSigner(signer);
        setChainId(chainId);
        await initializeContract(signer);
    };

    const initialize = useCallback(async () => {
        if (!window.ethereum || isInitialized) return;

        try {
            setIsLoading(true);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });

            if (accounts.length > 0) {
                await setupProviderAndSigner(window.ethereum);
                setAccount(accounts[0]);
            }
        } catch (err) {
            console.error('Initialization error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
        }
    }, [isInitialized]);

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError('Please install MetaMask');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            await setupProviderAndSigner(window.ethereum);
            setAccount(accounts[0]);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getAuctions = useCallback(async () => {
        if (!contract) {
            console.error('Contract is not initialized');
            return [];
        }

        try {
            setIsLoading(true);
            console.log('Fetching auction count...');

            // Попробуем получить контракт и его методы
            console.log('Contract address:', await contract.getAddress());
            console.log('Contract methods:', contract.interface.fragments);

            const auctionCount = await contract.auctionIdCounter();
            console.log('Auction count:', auctionCount);

            const auctions = [];

            for (let i = 0; i < auctionCount; i++) {
                console.log(`Fetching auction ${i}...`);
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
            console.error('Full error:', err);
            setError('Failed to load auctions: ' + err.message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    const createAuction = useCallback(async (itemDescription, startingPrice, endingPrice, duration) => {
        if (!contract) throw new Error('Contract not initialized');

        try {
            setIsLoading(true);
            const tx = await contract.createAuction(
                itemDescription,
                ethers.parseEther(startingPrice.toString()),
                ethers.parseEther(endingPrice.toString()),
                duration * 60
            );
            await tx.wait();
            return tx.hash;
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    const buyItem = useCallback(async (auctionId, price) => {
        if (!contract) throw new Error('Contract not initialized');

        try {
            setIsLoading(true);
            const tx = await contract.buy(auctionId, { value: price });
            await tx.wait();
            return tx.hash;
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    const cancelAuction = useCallback(async (auctionId) => {
        if (!contract) throw new Error('Contract not initialized');

        try {
            setIsLoading(true);
            const tx = await contract.cancelAuction(auctionId);
            await tx.wait();
            return tx.hash;
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    useEffect(() => {
        initialize();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    setAccount('');
                    setError('Please connect your wallet');
                } else {
                    setAccount(accounts[0]);
                    setError('');
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            window.ethereum.on('disconnect', () => {
                setAccount('');
                setError('Wallet disconnected');
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners();
            }
        };
    }, [initialize]);



    return {
        account,
        chainId,
        provider,
        signer,
        contract,
        error,
        isLoading,
        connectWallet,
        disconnect,
        getAuctions,
        createAuction,
        buyItem,
        cancelAuction
    };
};

export default useWeb3;