import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || '4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  APOLLO_SANDBOX: process.env.APOLLO_SANDBOX !== 'false',

  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  ITEM_SERVICE_URL: process.env.ITEM_SERVICE_URL || 'http://localhost:3002',
  SUPPLIER_SERVICE_URL: process.env.SUPPLIER_SERVICE_URL || 'http://localhost:3003',
  STOCK_SERVICE_URL: process.env.STOCK_SERVICE_URL || 'http://localhost:3004',
  REPORT_SERVICE_URL: process.env.REPORT_SERVICE_URL || 'http://localhost:3005',
  HISTORY_SERVICE_URL: process.env.HISTORY_SERVICE_URL || 'http://localhost:3006',
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
  PURCHASE_ORDER_SERVICE_URL: process.env.PURCHASE_ORDER_SERVICE_URL || 'http://localhost:8003',
};
