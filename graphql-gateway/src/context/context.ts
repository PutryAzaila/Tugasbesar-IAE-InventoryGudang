import type { StandaloneServerContextFunctionArgument } from '@apollo/server/standalone';

export interface GatewayContext {
  token?: string;
}

export async function buildContext({ req }: StandaloneServerContextFunctionArgument): Promise<GatewayContext> {
  const raw = req.headers['authorization'] ?? '';
  const authHeader = Array.isArray(raw) ? raw[0] : raw;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  return { token };
}
