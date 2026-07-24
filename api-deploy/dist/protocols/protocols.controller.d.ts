import { ProtocolsService } from './protocols.service';
export declare class ProtocolsController {
    private readonly protocolsService;
    constructor(protocolsService: ProtocolsService);
    getAll(): Promise<({
        id: any;
        name: any;
        address: string;
        supportedAssets: number;
    } | null)[]>;
    getRates(): Promise<({
        asset: any;
        protocol: any;
        apy: number;
    } | null)[]>;
}
