import React from 'react';
import { cn } from "../lib/utils";

const Navigation = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'auctions', label: 'Аукционы' },
        { id: 'create', label: 'Создать аукцион' },
        { id: 'my-auctions', label: 'Мои аукционы' }
    ];

    return (
        <div className="border-b bg-white sticky top-0 z-10">
            <nav className="container mx-auto flex border-b">
                {tabs.map((tab, index) => (
                    <React.Fragment key={tab.id}>
                        <button
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex-1 px-4 py-3 relative transition-all duration-200",
                                "text-base font-medium",
                                "hover:bg-slate-50 active:bg-slate-100",
                                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",

                                activeTab === tab.id ? (
                                    "text-primary border-b-2 border-primary"
                                ) : (
                                    "text-muted-foreground hover:text-foreground"
                                ),

                                "border-r border-slate-200 last:border-r-0",

                                "group cursor-pointer",
                            )}
                        >
                            {/* Текст вкладки */}
                            <span className={cn(
                                "relative z-10",
                                // Анимация при наведении
                                "group-hover:transform group-hover:scale-105 transition-transform duration-200",
                            )}>
                {tab.label}
              </span>

                            {/* Индикатор активной вкладки */}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}

                            {/* Эффект при нажатии */}
                            <span className={cn(
                                "absolute inset-0 transform transition-transform duration-200",
                                "active:scale-95"
                            )} />
                        </button>
                    </React.Fragment>
                ))}
            </nav>
        </div>
    );
};

export default Navigation;