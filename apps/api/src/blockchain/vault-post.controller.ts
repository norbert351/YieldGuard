import { Controller, Post, Param, Body } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain/vaults')
export class VaultPostController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post(':address')
  async postVault(@Param('address') address: string, @Body() body: any) {
    try {
      const { network } = body || {};
      const { getConfig } = (this.blockchainService as any);
      const config = getConfig?.call(this.blockchainService, network);
      const vaultAddr = address || config?.vaultAddress;
      return await this.blockchainService.getVaultInfo(vaultAddr, network);
    } catch (e: any) {
      return { error: e?.reason || e?.message || 'vault info failed', detail: String(e) };
    }
  }

  @Post(':address/deposit')
  async deposit(@Param('address') address: string, @Body() body: { amount: string; network?: string }) {
    try {
      return await this.blockchainService.depositToVault(address, body.amount, body.network);
    } catch (e: any) {
      return { error: e?.reason || e?.message || 'deposit failed', detail: String(e) };
    }
  }

  @Post(':address/withdraw')
  async withdraw(@Param('address') address: string, @Body() body: { shares: string; network?: string }) {
    try {
      return await this.blockchainService.withdrawFromVault(address, body.shares, body.network);
    } catch (e: any) {
      return { error: e?.reason || e?.message || 'withdraw failed', detail: String(e) };
    }
  }

  @Post(':address/balance/:user')
  async postBalance(@Param('address') address: string, @Param('user') user: string, @Body() body: any) {
    try {
      return await this.blockchainService.getUserBalance(address, user, body?.network);
    } catch (e: any) {
      return { error: e?.reason || e?.message || 'balance check failed', detail: String(e) };
    }
  }

  @Post(':address/add-strategy')
  async addStrategy(@Param('address') address: string, @Body() body: { strategy: string; network?: string }) {
    try {
      return await this.blockchainService.addStrategy(address, body.strategy, body.network);
    } catch (e: any) {
      return { error: e?.reason || e?.message || 'add strategy failed', detail: String(e) };
    }
  }

  @Post(':address/allocate')
  async allocate(@Param('address') address: string, @Body() body: { strategy: string; amount: string; network?: string }) {
    try {
      return await this.blockchainService.allocateToStrategy(address, body.strategy, body.amount, body.network);
    } catch (e: any) {
      return { error: e?.reason || e?.message || 'allocate failed', detail: String(e) };
    }
  }

  @Post(':address/harvest')
  async harvest(@Param('address') address: string, @Body() body: any) {
    try {
      return await this.blockchainService.harvestAll(address, body?.network);
    } catch (e: any) {
      return { error: e?.reason || e?.message || 'harvest failed', detail: String(e) };
    }
  }

  @Post(':address/strategies')
  async strategies(@Param('address') address: string, @Body() body: any) {
    try {
      return await this.blockchainService.getStrategies(address, body?.network);
    } catch (e: any) {
      return { error: e?.reason || e?.message || 'strategies failed', detail: String(e) };
    }
  }
}
