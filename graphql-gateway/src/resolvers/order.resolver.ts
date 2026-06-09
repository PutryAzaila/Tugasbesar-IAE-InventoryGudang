import { orderService } from '../services/order.service';
import { GatewayContext } from '../context/context';

export const orderResolver = {
  Query: {
    purchaseOrders: async (_: unknown, __: unknown, _ctx: GatewayContext) => {
      return orderService.getPurchaseOrders();
    },

    purchaseOrder: async (_: unknown, { id }: { id: string }, _ctx: GatewayContext) => {
      return orderService.getPurchaseOrder(id);
    },

    purchaseOrdersBySupplier: async (
      _: unknown,
      { supplier_id }: { supplier_id: number },
      _ctx: GatewayContext,
    ) => {
      return orderService.getPurchaseOrdersBySupplier(supplier_id);
    },
  },

  Mutation: {
    createPurchaseOrder: async (
      _: unknown,
      { input }: { input: { supplier_id: number; item_id: number; quantity: number } },
      _ctx: GatewayContext,
    ) => {
      return orderService.createPurchaseOrder(input);
    },

    updatePurchaseOrderStatus: async (
      _: unknown,
      { id, status }: { id: string; status: string },
      _ctx: GatewayContext,
    ) => {
      return orderService.updatePurchaseOrderStatus(id, status);
    },
  },
};
