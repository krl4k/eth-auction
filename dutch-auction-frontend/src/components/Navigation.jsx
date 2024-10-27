// components/Navigation.js
import React from 'react';
import { cn } from "../lib/utils";

const Navigation = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'auctions', label: 'Аукционы' },
        { id: 'create', label: 'Создать аукцион' },
        { id: 'my-auctions', label: 'Мои аукционы' }
    ];

    return (
        <div className="border-b">
            <nav className="container mx-auto flex justify-center space-x-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "px-4 py-2 relative",
                            "hover:text-primary transition-colors",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
                            activeTab === tab.id ? "text-primary" : "text-muted-foreground",
                            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                            activeTab === tab.id ? "after:bg-primary" : "after:bg-transparent",
                            "after:transition-colors"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Navigation;