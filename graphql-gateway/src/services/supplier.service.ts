import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

interface SupplierInput {
  name: string;
  tax_number?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}

export const supplierService = {
  async getSuppliers(token: string) {
    try {
      const client = createHttpClient(env.SUPPLIER_SERVICE_URL, token);
      const { data } = await client.get('/suppliers');
      return data;
    } catch (err) {
      return handleServiceError(err, 'supplier-service');
    }
  },

  async getSupplier(id: string, token: string) {
    try {
      const client = createHttpClient(env.SUPPLIER_SERVICE_URL, token);
      const { data } = await client.get(`/suppliers/${id}`);
      return data;
    } catch (err) {
      return handleServiceError(err, 'supplier-service');
    }
  },

  async createSupplier(input: SupplierInput, token: string) {
    try {
      const client = createHttpClient(env.SUPPLIER_SERVICE_URL, token);
      const { data } = await client.post('/suppliers', input);
      return data;
    } catch (err) {
      return handleServiceError(err, 'supplier-service');
    }
  },

  async updateSupplier(id: string, input: Partial<SupplierInput>, token: string) {
    try {
      const client = createHttpClient(env.SUPPLIER_SERVICE_URL, token);
      const { data } = await client.put(`/suppliers/${id}`, input);
      return data;
    } catch (err) {
      return handleServiceError(err, 'supplier-service');
    }
  },

  async deleteSupplier(id: string, token: string) {
    try {
      const client = createHttpClient(env.SUPPLIER_SERVICE_URL, token);
      await client.delete(`/suppliers/${id}`);
    } catch (err) {
      return handleServiceError(err, 'supplier-service');
    }
  },
};
