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
    constructor(blockchainService) {
        this.blockchainService = blockchainService;
    }
    async postVault(address, body) {
        const { network } = body || {};
        const { getConfig } = this.blockchainService;
        const config = getConfig?.call(this.blockchainService, network);
        const vaultAddr = address || config?.vaultAddress;
        return this.blockchainService.getVaultInfo(vaultAddr, network);
    }
    async deposit(address, body) {
        return this.blockchainService.depositToVault(address, body.amount, body.network);
    }
    async withdraw(address, body) {
        return this.blockchainService.withdrawFromVault(address, body.shares, body.network);
    }
    async postBalance(address, user, body) {
        return this.blockchainService.getUserBalance(address, user, body?.network);
    }
};
exports.VaultPostController = VaultPostController;
__decorate([
    (0, common_1.Post)(':address'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VaultPostController.prototype, "postVault", null);
__decorate([
    (0, common_1.Post)(':address/deposit'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VaultPostController.prototype, "deposit", null);
__decorate([
    (0, common_1.Post)(':address/withdraw'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VaultPostController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)(':address/balance/:user'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Param)('user')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], VaultPostController.prototype, "postBalance", null);
exports.VaultPostController = VaultPostController = __decorate([
    (0, common_1.Controller)('blockchain/vaults'),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService])
], VaultPostController);
//# sourceMappingURL=vault-post.controller.js.map