import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailNotifier } from '../ports/email-notifier.port.js';

@Injectable()
export class NodemailerEmailNotifier implements IEmailNotifier {
  private readonly logger = new Logger(NodemailerEmailNotifier.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor() {
    this.fromAddress = process.env.SMTP_FROM ?? 'no-reply@snackoverflow.local';
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'localhost',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS ?? '',
            }
          : undefined,
    });
  }

  async sendPasswordReset(toEmail: string, rawToken: string): Promise<void> {
    const resetUrl = `${process.env.APP_BASE_URL ?? 'http://localhost:3001'}/reset-password?token=${rawToken}`;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: toEmail,
      subject: 'Recuperar contraseña — Snack Overflow',
      text: `Hacé clic en el siguiente enlace para restablecer tu contraseña (válido por 30 minutos):\n\n${resetUrl}\n\nSi no solicitaste este correo, ignoralo.`,
      html: `<p>Hacé clic en el siguiente enlace para restablecer tu contraseña (válido por 30 minutos):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no solicitaste este correo, ignoralo.</p>`,
    });

    // Log only that a reset email was dispatched — never log the email address (RNF-S.4)
    this.logger.log('PASSWORD_RESET_EMAIL_SENT');
  }
}
