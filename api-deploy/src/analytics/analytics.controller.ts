import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics')
  getMetrics() {
    return this.analyticsService.getMetrics();
  }

  @Get('history/:days')
  getHistory(@Param('days') days: string) {
    return this.analyticsService.getHistory(parseInt(days) || 30);
  }
}
