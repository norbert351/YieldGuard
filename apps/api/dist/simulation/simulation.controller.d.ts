import { SimulationService } from './simulation.service';
export declare class SimulationController {
    private readonly simulationService;
    constructor(simulationService: SimulationService);
    getAll(): any[];
    create(config: any): {
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
}
