import { Module } from '@nestjs/common';
import { MailerService } from 'api/libs/mailer/mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
