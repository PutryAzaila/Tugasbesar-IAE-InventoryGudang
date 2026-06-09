import { productService } from '../services/product.service';
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

interface ItemInput {
  unit_id: string;
  category_id?: string;
  sku: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export const productResolver = {
  Query: {
    items: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      return productService.getItems(requireAuth(token));
    },

    item: async (_: unknown, { id }: { id: string }, { token }: GatewayContext) => {
      return productService.getItem(id, requireAuth(token));
    },

    itemUnits: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      return productService.getItemUnits(requireAuth(token));
    },

    itemCategories: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      return productService.getItemCategories(requireAuth(token));
    },
  },

  Mutation: {
    createItem: async (
      _: unknown,
      { input }: { input: ItemInput },
      { token }: GatewayContext,
    ) => {
      return productService.createItem(input, requireAuth(token));
    },

    updateItem: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<ItemInput> },
      { token }: GatewayContext,
    ) => {
      return productService.updateItem(id, input, requireAuth(token));
    },

    deleteItem: async (_: unknown, { id }: { id: string }, { token }: GatewayContext) => {
      await productService.deleteItem(id, requireAuth(token));
      return { success: true, message: `Item ${id} deleted` };
    },
  },
};
