import { supplierService } from '../services/supplier.service';
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

interface SupplierInput {
  name: string;
  tax_number?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}

export const supplierResolver = {
  Query: {
    suppliers: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      return supplierService.getSuppliers(requireAuth(token));
    },

    supplier: async (_: unknown, { id }: { id: string }, { token }: GatewayContext) => {
      return supplierService.getSupplier(id, requireAuth(token));
    },
  },

  Mutation: {
    createSupplier: async (
      _: unknown,
      { input }: { input: SupplierInput },
      { token }: GatewayContext,
    ) => {
      return supplierService.createSupplier(input, requireAuth(token));
    },

    updateSupplier: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<SupplierInput> },
      { token }: GatewayContext,
    ) => {
      return supplierService.updateSupplier(id, input, requireAuth(token));
    },

    deleteSupplier: async (_: unknown, { id }: { id: string }, { token }: GatewayContext) => {
      await supplierService.deleteSupplier(id, requireAuth(token));
      return { success: true, message: `Supplier ${id} deleted` };
    },
  },
};
