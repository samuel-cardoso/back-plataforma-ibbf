export interface MailerPort {
  sendPasswordResetCode(params: { to: string; code: string }): Promise<void>;
}
