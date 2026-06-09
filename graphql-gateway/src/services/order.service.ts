import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

interface PurchaseOrderInput {
  supplier_id: number;
  item_id: number;
  quantity: number;
}

export const orderService = {
  async getPurchaseOrders() {
    try {
      const client = createHttpClient(env.PURCHASE_ORDER_SERVICE_URL);
      const { data } = await client.get('/purchase-orders');
      return data.data ?? data;
    } catch (err) {
      return handleServiceError(err, 'purchase-order-service');
    }
  },

  async getPurchaseOrder(id: string) {
    try {
      const client = createHttpClient(env.PURCHASE_ORDER_SERVICE_URL);
      const { data } = await client.get(`/purchase-orders/${id}`);
      return data.data ?? data;
    } catch (err) {
      return handleServiceError(err, 'purchase-order-service');
    }
  },

  async createPurchaseOrder(input: PurchaseOrderInput) {
    try {
      const client = createHttpClient(env.PURCHASE_ORDER_SERVICE_URL);
      const { data } = await client.post('/purchase-orders', input);
      return data.data ?? data;
    } catch (err) {
      return handleServiceError(err, 'purchase-order-service');
    }
  },

  async updatePurchaseOrderStatus(id: string, status: string) {
    try {
      const client = createHttpClient(env.PURCHASE_ORDER_SERVICE_URL);
      const { data } = await client.patch(`/purchase-orders/${id}/status`, { status });
      return data.data ?? data;
    } catch (err) {
      return handleServiceError(err, 'purchase-order-service');
    }
  },

  async getPurchaseOrdersBySupplier(supplier_id: number) {
    try {
      const client = createHttpClient(env.PURCHASE_ORDER_SERVICE_URL);
      const { data } = await client.get(`/purchase-orders/supplier/${supplier_id}`);
      return data;
    } catch (err) {
      return handleServiceError(err, 'purchase-order-service');
    }
  },
};
