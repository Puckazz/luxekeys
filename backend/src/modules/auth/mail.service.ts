import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  async sendPasswordResetCode(
    email: string,
    fullName: string,
    code: string,
  ): Promise<void> {
    const transporter = this.getTransporter();
    const from = this.configService.get<string>('MAIL_FROM');

    if (!transporter || !from) {
      this.logger.warn(
        `Mail is not configured. Password reset code for ${email}: ${code}`,
      );
      return;
    }

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your LuxeKeys password reset code',
      text: [
        `Hi ${fullName},`,
        '',
        `Your LuxeKeys password reset code is ${code}.`,
        'This code expires in 15 minutes.',
        '',
        'If you did not request a password reset, you can ignore this email.',
      ].join('\n'),
      html: `
        <p>Hi ${fullName},</p>
        <p>Your LuxeKeys password reset code is <strong>${code}</strong>.</p>
        <p>This code expires in 15 minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      `,
    });
  }

  private getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>('MAIL_HOST');
    const port = parseInt(
      this.configService.get<string>('MAIL_PORT') ?? '587',
      10,
    );
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    if (!host || !user || !pass) {
      return null;
    }

    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }
}
