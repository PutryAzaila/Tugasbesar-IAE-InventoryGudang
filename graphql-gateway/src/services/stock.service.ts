import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

interface StockInput {
  item_id: string;
  location_id?: string;
  quantity: number;
  min_quantity: number;
}

interface AdjustInput {
  delta: number;
  reason_code: string;
  note: string;
}

export const stockService = {
  async getStocks(token: string) {
    try {
      const client = createHttpClient(env.STOCK_SERVICE_URL, token);
      const { data } = await client.get('/stock');
      return data;
    } catch (err) {
      return handleServiceError(err, 'stock-service');
    }
  },

  async getStock(id: string, token: string) {
    try {
      const client = createHttpClient(env.STOCK_SERVICE_URL, token);
      const { data } = await client.get(`/stock/${id}`);
      return data;
    } catch (err) {
      return handleServiceError(err, 'stock-service');
    }
  },

  async createStock(input: StockInput, token: string) {
    try {
      const client = createHttpClient(env.STOCK_SERVICE_URL, token);
      const body = {
        ...input,
        item_id: parseInt(input.item_id),
        location_id: input.location_id ? parseInt(input.location_id) : undefined,
      };
      const { data } = await client.post('/stock', body);
      return data;
    } catch (err) {
      return handleServiceError(err, 'stock-service');
    }
  },

  async updateStock(id: string, input: Partial<StockInput>, token: string) {
    try {
      const client = createHttpClient(env.STOCK_SERVICE_URL, token);
      const body = {
        ...input,
        item_id: input.item_id ? parseInt(input.item_id) : undefined,
        location_id: input.location_id ? parseInt(input.location_id) : undefined,
      };
      const { data } = await client.put(`/stock/${id}`, body);
      return data;
    } catch (err) {
      return handleServiceError(err, 'stock-service');
    }
  },

  async adjustStock(id: string, input: AdjustInput, token: string) {
    try {
      const client = createHttpClient(env.STOCK_SERVICE_URL, token);
      const { data } = await client.patch(`/stock/${id}/adjust`, input);
      return data;
    } catch (err) {
      return handleServiceError(err, 'stock-service');
    }
  },

  async deleteStock(id: string, token: string) {
    try {
      const client = createHttpClient(env.STOCK_SERVICE_URL, token);
      await client.delete(`/stock/${id}`);
    } catch (err) {
      return handleServiceError(err, 'stock-service');
    }
  },

  async getStockMovements(token: string, item_id?: string) {
    try {
      const client = createHttpClient(env.STOCK_SERVICE_URL, token);
      const params = item_id ? { item_id } : {};
      const { data } = await client.get('/stock-movements', { params });
      return data;
    } catch (err) {
      return handleServiceError(err, 'stock-service');
    }
  },
};
