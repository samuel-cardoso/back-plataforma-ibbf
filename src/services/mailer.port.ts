export interface MailerPort {
  sendPasswordResetCode(params: { to: string; code: string }): Promise<void>;
  sendEmailVerificationCode(params: { to: string; code: string }): Promise<void>;
}
