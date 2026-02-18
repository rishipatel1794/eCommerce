"use client";
import { ChevronDown, Wallet as WalletIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Wallet() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, coins, setCoin } = useAuth();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        // priority: user.coins -> localStorage -> default 0
        const coinsData = async () => {
            if (user && !user.is_admin) {
                await setCoin(user.coin);
            }
        };
        coinsData();
    }, [user]);

    return (
        <div className="relative inline-block">
            <button
                onClick={toggleDropdown}
               
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <WalletIcon size={20} />
                <span>Wallet</span>
                <ChevronDown
                    size={18}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div className="p-4">
                        <p className="text-gray-700 font-semibold mb-2">Balance</p>
                        <p className="text-2xl font-bold text-green-600">{coins} Coins</p>
                        <p className="text-sm text-gray-600 mt-1">(1 Coin = 1 Rupee)</p>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-gray-700">Value</span>
                            <span className="font-semibold">Rs. {coins}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}