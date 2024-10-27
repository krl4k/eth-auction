import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';

const CreateAuctionForm = ({
                               formData,
                               onChange,
                               onSubmit,
                               isLoading,
                               error
                           }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Создать новый аукцион</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Описание предмета</label>
                        <Input
                            placeholder="Введите описание предмета"
                            value={formData.itemDescription}
                            onChange={(e) => onChange({
                                ...formData,
                                itemDescription: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Начальная цена (ETH)</label>
                        <Input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.00"
                            value={formData.startingPrice}
                            onChange={(e) => onChange({
                                ...formData,
                                startingPrice: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Конечная цена (ETH)</label>
                        <Input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.00"
                            value={formData.endingPrice}
                            onChange={(e) => onChange({
                                ...formData,
                                endingPrice: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Длительность (в минутах)</label>
                        <Input
                            type="number"
                            min="1"
                            placeholder="60"
                            value={formData.duration}
                            onChange={(e) => onChange({
                                ...formData,
                                duration: e.target.value
                            })}
                            required
                        />
                    </div>
                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Создание..." : "Создать аукцион"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateAuctionForm;