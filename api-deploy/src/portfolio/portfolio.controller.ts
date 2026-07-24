import { Controller, Get, Post, Body } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  getOverview() {
    return this.portfolioService.getOverview();
  }

  @Post()
  getOverviewPost(@Body() body: any) {
    return this.portfolioService.getOverview();
  }

  @Get('positions')
  getPositions() {
    return this.portfolioService.getPositions();
  }
}
