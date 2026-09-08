import { Resend } from 'resend';
import { MailerPort } from '@/services';
import { EMAIL_VERIFICATION_CODE_TTL_MINUTES, PASSWORD_RESET_CODE_TTL_MINUTES } from '@/shared/constants';

export class ResendMailerService implements MailerPort {
  private readonly client = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordResetCode(params: { to: string; code: string }): Promise<void> {
    await this.send({
      to: params.to,
      subject: 'Código para redefinir sua senha - Plataforma IBBF',
      text:
        `Seu código para redefinir a senha é: ${params.code}\n\n` +
        `Ele é válido por ${PASSWORD_RESET_CODE_TTL_MINUTES} minutos. ` +
        'Se você não solicitou essa troca, pode ignorar este email.',
    });
  }

  async sendEmailVerificationCode(params: { to: string; code: string }): Promise<void> {
    await this.send({
      to: params.to,
      subject: 'Confirme seu email - Plataforma IBBF',
      text:
        `Seu código de confirmação é: ${params.code}\n\n` +
        `Ele é válido por ${EMAIL_VERIFICATION_CODE_TTL_MINUTES} minutos. ` +
        'Se você não criou uma conta na Plataforma IBBF, pode ignorar este email.',
    });
  }

  private async send(params: { to: string; subject: string; text: string }): Promise<void> {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Plataforma IBBF <onboarding@resend.dev>';

    const { error } = await this.client.emails.send({
      from: fromEmail,
      to: [params.to],
      subject: params.subject,
      text: params.text,
    });

    if (error) {
      throw new Error(`Falha ao enviar email via Resend: ${error.message}`);
    }
  }
}
