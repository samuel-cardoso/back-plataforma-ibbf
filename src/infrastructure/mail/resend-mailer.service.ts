import { Resend } from 'resend';
import { MailerPort } from '@/services';
import { PASSWORD_RESET_CODE_TTL_MINUTES } from '@/shared/constants';

export class ResendMailerService implements MailerPort {
  private readonly client = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordResetCode(params: { to: string; code: string }): Promise<void> {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Plataforma IBBF <onboarding@resend.dev>';

    const { error } = await this.client.emails.send({
      from: fromEmail,
      to: [params.to],
      subject: 'Código para redefinir sua senha - Plataforma IBBF',
      text:
        `Seu código para redefinir a senha é: ${params.code}\n\n` +
        `Ele é válido por ${PASSWORD_RESET_CODE_TTL_MINUTES} minutos. ` +
        'Se você não solicitou essa troca, pode ignorar este email.',
    });

    if (error) {
      throw new Error(`Falha ao enviar email via Resend: ${error.message}`);
    }
  }
}
