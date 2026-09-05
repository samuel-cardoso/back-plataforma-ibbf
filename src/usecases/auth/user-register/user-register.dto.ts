export interface UserRegisterInput {
  email: string;
  password: string;
  /**
   * Assinatura do JWT é responsabilidade do Fastify (via reply.jwtSign),
   * não do usecase — o controller injeta essa função para manter o usecase
   * testável sem precisar de um servidor Fastify de verdade no teste.
   */
  jwtSign: (payload: Record<string, unknown>) => Promise<string>;
}
