import { stockService } from '../services/stock.service';
import { GatewayContext } from '../context/context';
import { GraphQLError } from 'graphql';

function requireAuth(token: string | undefined): string {
  if (!token) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return token;
}

export const stockResolver = {
  Query: {
    stocks: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      return stockService.getStocks(requireAuth(token));
    },

    stock: async (_: unknown, { id }: { id: string }, { token }: GatewayContext) => {
      return stockService.getStock(id, requireAuth(token));
    },

    stockMovements: async (
      _: unknown,
      { item_id }: { item_id?: string },
      { token }: GatewayContext,
    ) => {
      return stockService.getStockMovements(requireAuth(token), item_id);
    },
  },

  Mutation: {
    createStock: async (
      _: unknown,
      { input }: { input: Parameters<typeof stockService.createStock>[0] },
      { token }: GatewayContext,
    ) => {
      return stockService.createStock(input, requireAuth(token));
    },

    updateStock: async (
      _: unknown,
      { id, input }: { id: string; input: Record<string, unknown> },
      { token }: GatewayContext,
    ) => {
      return stockService.updateStock(id, input, requireAuth(token));
    },

    adjustStock: async (
      _: unknown,
      { id, input }: { id: string; input: { delta: number; reason_code: string; note: string } },
      { token }: GatewayContext,
    ) => {
      return stockService.adjustStock(id, input, requireAuth(token));
    },

    deleteStock: async (_: unknown, { id }: { id: string }, { token }: GatewayContext) => {
      await stockService.deleteStock(id, requireAuth(token));
      return { success: true, message: `Stock ${id} deleted` };
    },
  },
};
