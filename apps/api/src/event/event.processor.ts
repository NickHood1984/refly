import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { EventService } from './event.service';
import { CHANNEL_REPORT_EVENT, QUEUE_EVENT } from '../utils/const';
import { ReportEventData } from './event.dto';

@Processor(QUEUE_EVENT)
export class ResourceProcessor {
  private readonly logger = new Logger(ResourceProcessor.name);

  constructor(private eventService: EventService) {}

  @Process(CHANNEL_REPORT_EVENT)
  async processReportEvent(job: Job<ReportEventData>) {
    this.logger.log(`[processReportEvent] job: ${JSON.stringify(job)}`);

    await this.eventService.handleEvent(job.data);
  }
}
