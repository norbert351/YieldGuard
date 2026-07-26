"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultPostController = void 0;
const common_1 = require("@nestjs/common");
const blockchain_service_1 = require("./blockchain.service");
let VaultPostController = class VaultPostController {
    constructor(blockchainService) { this.blockchainService = blockchainService; }

    // POST routes (actual logic)
    async postVault(address, body) {
        try {
            const { network } = body || {};
            const { getConfig } = this.blockchainService;
            const config = getConfig?.call(this.blockchainService, network);
            const vaultAddr = address || config?.vaultAddress;
            return await this.blockchainService.getVaultInfo(vaultAddr, network);
        } catch (e) { return { error: e?.reason || e?.message || 'vault info failed', detail: String(e) }; }
    }
    async deposit(address, body) {
        try { return await this.blockchainService.depositToVault(address, body.amount, body.network); }
        catch (e) { return { error: e?.reason || e?.message || 'deposit failed', detail: String(e) }; }
    }
    async withdraw(address, body) {
        try { return await this.blockchainService.withdrawFromVault(address, body.shares, body.network); }
        catch (e) { return { error: e?.reason || e?.message || 'withdraw failed', detail: String(e) }; }
    }
    async postBalance(address, user, body) {
        try { return await this.blockchainService.getUserBalance(address, user, body?.network); }
        catch (e) { return { error: e?.reason || e?.message || 'balance check failed', detail: String(e) }; }
    }
    async addStrategy(address, body) {
        try { return await this.blockchainService.addStrategy(address, body.strategy, body.network); }
        catch (e) { return { error: e?.reason || e?.message || 'add strategy failed', detail: String(e) }; }
    }
    async allocate(address, body) {
        try { return await this.blockchainService.allocateToStrategy(address, body.strategy, body.amount, body.network); }
        catch (e) { return { error: e?.reason || e?.message || 'allocate failed', detail: String(e) }; }
    }
    async harvest(address, body) {
        try { return await this.blockchainService.harvestAll(address, body?.network); }
        catch (e) { return { error: e?.reason || e?.message || 'harvest failed', detail: String(e) }; }
    }
    async strategies(address, body) {
        try { return await this.blockchainService.getStrategies(address, body?.network); }
        catch (e) { return { error: e?.reason || e?.message || 'strategies failed', detail: String(e) }; }
    }

    // GET routes (redirect to Guard — all return 402 due to X402Guard)
    async getVault(address, body) {
        return { error: 'use POST', message: 'This endpoint requires POST with payment' };
    }
    async getDeposit(address) {
        return { error: 'use POST', message: 'This endpoint requires POST with payment' };
    }
    async getWithdraw(address) {
        return { error: 'use POST', message: 'This endpoint requires POST with payment' };
    }
    async getBalance(address, user) {
        return { error: 'use POST', message: 'This endpoint requires POST with payment' };
    }
    async getStrategies(address) {
        return { error: 'use POST', message: 'This endpoint requires POST with payment' };
    }
};
exports.VaultPostController = VaultPostController;
__decorate([
    (0, common_1.Post)(':address'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "postVault", null);
__decorate([
    (0, common_1.Get)(':address'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "getVault", null);
__decorate([
    (0, common_1.Post)(':address/deposit'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "deposit", null);
__decorate([
    (0, common_1.Get)(':address/deposit'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "getDeposit", null);
__decorate([
    (0, common_1.Post)(':address/withdraw'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Get)(':address/withdraw'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "getWithdraw", null);
__decorate([
    (0, common_1.Post)(':address/balance/:user'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Param)('user')), __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "postBalance", null);
__decorate([
    (0, common_1.Get)(':address/balance/:user'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Param)('user')),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, String]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)(':address/add-strategy'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "addStrategy", null);
__decorate([
    (0, common_1.Post)(':address/allocate'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "allocate", null);
__decorate([
    (0, common_1.Post)(':address/harvest'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "harvest", null);
__decorate([
    (0, common_1.Post)(':address/strategies'),
    __param(0, (0, common_1.Param)('address')), __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String, Object]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "strategies", null);
__decorate([
    (0, common_1.Get)(':address/strategies'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function), __metadata("design:paramtypes", [String]), __metadata("design:returntype", Promise)
], VaultPostController.prototype, "getStrategies", null);
exports.VaultPostController = VaultPostController = __decorate([
    (0, common_1.Controller)('blockchain/vaults'),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService])
], VaultPostController);
