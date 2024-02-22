import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerConfig } from 'api/config/mailer.config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  constructor(private readonly config: ConfigService) {}

  async sendEmail(email: string, resetCode: number) {
    const mailerConfig = this.config.get<MailerConfig>('mailer');
    const transporter = nodemailer.createTransport({
      service: mailerConfig.service,
      port: mailerConfig.port,
      secure: false,
      auth: {
        user: mailerConfig.email,
        pass: mailerConfig.password,
      },
    });

    const mailOptions = {
      from: mailerConfig.email,
      to: email,
      subject: 'Password Reset',
      text: `Your verification code: ${resetCode}`,
    };

    return await transporter.sendMail(mailOptions);
  }
}
