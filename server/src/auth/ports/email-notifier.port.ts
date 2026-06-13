export const EMAIL_NOTIFIER = 'EMAIL_NOTIFIER';

export interface IEmailNotifier {
  sendPasswordReset(toEmail: string, rawToken: string): Promise<void>;
}
