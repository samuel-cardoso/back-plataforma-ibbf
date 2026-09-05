import 'dotenv/config';
import { createServer } from './server';

async function bootstrap() {
  const server = await createServer();
  const port = Number(process.env.PORT) || 3010;
  await server.listen({ port, host: '0.0.0.0' });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
