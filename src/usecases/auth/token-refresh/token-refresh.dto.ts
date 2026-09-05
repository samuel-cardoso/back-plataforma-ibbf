export interface TokenRefreshInput {
  refreshToken: string;
  userAgent?: string;
  jwtSign: (payload: Record<string, unknown>) => Promise<string>;
}
