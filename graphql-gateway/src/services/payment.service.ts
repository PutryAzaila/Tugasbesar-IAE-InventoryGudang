import { GraphQLError } from 'graphql';

// Payment service belum ada di project ini.
// File ini adalah placeholder untuk integrasi di masa mendatang.
// Buat payment-service terlebih dahulu sebelum mengisi implementasi di sini.

export const paymentService = {
  async getPayment(_id: string): Promise<never> {
    throw new GraphQLError('Payment service belum tersedia', {
      extensions: { code: 'SERVICE_NOT_IMPLEMENTED' },
    });
  },

  async createPayment(_input: unknown): Promise<never> {
    throw new GraphQLError('Payment service belum tersedia', {
      extensions: { code: 'SERVICE_NOT_IMPLEMENTED' },
    });
  },
};
