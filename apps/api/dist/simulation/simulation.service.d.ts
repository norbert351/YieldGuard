export declare class SimulationService {
    private simulations;
    findAll(): any[];
    run(config: {
        capital: number;
        duration: number;
        risk: string;
        market: string;
    }): {
        id: string;
        config: {
            capital: number;
            duration: number;
            risk: string;
            market: string;
        };
        status: string;
        results: {
            finalValue: number;
            totalReturn: number;
            annualizedReturn: number;
            maxDrawdown: number;
            sharpeRatio: number;
            volatility: number;
        };
        createdAt: string;
    };
    private generateResults;
}
