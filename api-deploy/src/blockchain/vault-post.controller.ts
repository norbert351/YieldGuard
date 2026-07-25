import { Controller, Post, Param, Body } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain/vaults')
export class VaultPostController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post(':address')
  async postVault(@Param('address') address: string, @Body() body: any) {
    const { network } = body || {};
    const { getConfig } = (this.blockchainService as any);
    const config = getConfig?.call(this.blockchainService, network);
    const vaultAddr = address || config?.vaultAddress;
    return this.blockchainService.getVaultInfo(vaultAddr, network);
  }

  @Post(':address/deposit')
  async deposit(@Param('address') address: string, @Body() body: { amount: string; network?: string }) {
    return this.blockchainService.depositToVault(address, body.amount, body.network);
  }

  @Post(':address/withdraw')
  async withdraw(@Param('address') address: string, @Body() body: { shares: string; network?: string }) {
    return this.blockchainService.withdrawFromVault(address, body.shares, body.network);
  }

  @Post(':address/balance/:user')
  async postBalance(@Param('address') address: string, @Param('user') user: string, @Body() body: any) {
    return this.blockchainService.getUserBalance(address, user, body?.network);
  }

  @Post(':address/add-strategy')
  async addStrategy(@Param('address') address: string, @Body() body: { strategy: string; network?: string }) {
    return this.blockchainService.addStrategy(address, body.strategy, body.network);
  }

  @Post(':address/allocate')
  async allocate(@Param('address') address: string, @Body() body: { strategy: string; amount: string; network?: string }) {
    return this.blockchainService.allocateToStrategy(address, body.strategy, body.amount, body.network);
  }

  @Post(':address/harvest')
  async harvest(@Param('address') address: string, @Body() body: any) {
    return this.blockchainService.harvestAll(address, body?.network);
  }

  @Post(':address/strategies')
  async strategies(@Param('address') address: string, @Body() body: any) {
    return this.blockchainService.getStrategies(address, body?.network);
  }
}
