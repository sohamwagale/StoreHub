import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {}

  async sendPasswordResetEmail(email: string, resetToken: string, name?: string): Promise<{ sent: boolean; simulated: boolean; resetUrl: string }> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromAddress = this.configService.get<string>('EMAIL_FROM') || 'StoreRank <onboarding@resend.dev>';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; background: #ffffff; color: #09090b;">
        <div style="margin-bottom: 24px; border-bottom: 2px solid #09090b; padding-bottom: 12px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #d97706;">Security Notification</span>
          <h1 style="font-size: 20px; font-weight: 800; margin: 6px 0 0; text-transform: uppercase; letter-spacing: -0.02em;">Password Reset Request</h1>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">
          Hello ${name || 'StoreRank User'},
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">
          We received a request to reset the password for your StoreRank account (${email}). Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.
        </p>

        <div style="margin: 28px 0; text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background-color: #09090b; color: #fefce8; text-decoration: none; font-size: 13px; font-weight: bold; font-family: monospace; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #09090b;">
            Reset Your Password &rarr;
          </a>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 16px;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>

        <p style="font-size: 11px; font-family: monospace; color: #a1a1aa; margin-top: 20px;">
          Direct link: <a href="${resetUrl}" style="color: #d97706; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `;

    if (!resendApiKey) {
      this.logger.warn(`RESEND_API_KEY is not configured in .env. Simulating email delivery.`);
      this.logger.log(`\n========================================================\n[SIMULATED EMAIL TO: ${email}]\nSubject: StoreRank Password Reset Request\nReset Link: ${resetUrl}\n========================================================\n`);
      return { sent: true, simulated: true, resetUrl };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [email],
          subject: 'Reset your StoreRank password',
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Resend API request failed (${response.status}): ${errorBody}`);
        return { sent: false, simulated: false, resetUrl };
      }

      this.logger.log(`Password reset email successfully sent via Resend to ${email}`);
      return { sent: true, simulated: false, resetUrl };
    } catch (err: any) {
      this.logger.error(`Failed to send email via Resend: ${err.message}`);
      return { sent: false, simulated: false, resetUrl };
    }
  }
}
