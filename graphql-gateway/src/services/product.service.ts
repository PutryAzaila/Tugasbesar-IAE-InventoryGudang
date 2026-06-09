import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

interface ItemInput {
  unit_id: string;
  category_id?: string;
  sku: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export const productService = {
  async getItems(token: string) {
    try {
      const client = createHttpClient(env.ITEM_SERVICE_URL, token);
      const { data } = await client.get('/items');
      return data;
    } catch (err) {
      return handleServiceError(err, 'item-service');
    }
  },

  async getItem(id: string, token: string) {
    try {
      const client = createHttpClient(env.ITEM_SERVICE_URL, token);
      const { data } = await client.get(`/items/${id}`);
      return data;
    } catch (err) {
      return handleServiceError(err, 'item-service');
    }
  },

  async createItem(input: ItemInput, token: string) {
    try {
      const client = createHttpClient(env.ITEM_SERVICE_URL, token);
      const body = {
        ...input,
        unit_id: parseInt(input.unit_id),
        category_id: input.category_id ? parseInt(input.category_id) : undefined,
      };
      const { data } = await client.post('/items', body);
      return data;
    } catch (err) {
      return handleServiceError(err, 'item-service');
    }
  },

  async updateItem(id: string, input: Partial<ItemInput>, token: string) {
    try {
      const client = createHttpClient(env.ITEM_SERVICE_URL, token);
      const body = {
        ...input,
        unit_id: input.unit_id ? parseInt(input.unit_id) : undefined,
        category_id: input.category_id ? parseInt(input.category_id) : undefined,
      };
      const { data } = await client.put(`/items/${id}`, body);
      return data;
    } catch (err) {
      return handleServiceError(err, 'item-service');
    }
  },

  async deleteItem(id: string, token: string) {
    try {
      const client = createHttpClient(env.ITEM_SERVICE_URL, token);
      await client.delete(`/items/${id}`);
    } catch (err) {
      return handleServiceError(err, 'item-service');
    }
  },

  async getItemUnits(token: string) {
    try {
      const client = createHttpClient(env.ITEM_SERVICE_URL, token);
      const { data } = await client.get('/item-units');
      return data;
    } catch (err) {
      return handleServiceError(err, 'item-service');
    }
  },

  async getItemCategories(token: string) {
    try {
      const client = createHttpClient(env.ITEM_SERVICE_URL, token);
      const { data } = await client.get('/item-categories');
      return data;
    } catch (err) {
      return handleServiceError(err, 'item-service');
    }
  },
};
