export interface UserLoginInput {
  email: string;
  password: string;
  jwtSign: (payload: Record<string, unknown>) => Promise<string>;
}
