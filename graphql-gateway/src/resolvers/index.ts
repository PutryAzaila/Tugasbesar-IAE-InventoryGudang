import { authResolver } from './auth.resolver';
import { userResolver } from './user.resolver';
import { supplierResolver } from './supplier.resolver';
import { productResolver } from './product.resolver';
import { stockResolver } from './stock.resolver';
import { orderResolver } from './order.resolver';
import { notificationResolver } from './notification.resolver';
import { historyResolver } from './history.resolver';
import { reportResolver } from './report.resolver';
import { paymentResolver } from './payment.resolver';

export const resolvers = {
  Query: {
    ...userResolver.Query,
    ...supplierResolver.Query,
    ...productResolver.Query,
    ...stockResolver.Query,
    ...orderResolver.Query,
    ...notificationResolver.Query,
    ...historyResolver.Query,
    ...reportResolver.Query,
    ...paymentResolver.Query,
  },
  Mutation: {
    ...authResolver.Mutation,
    ...supplierResolver.Mutation,
    ...productResolver.Mutation,
    ...stockResolver.Mutation,
    ...orderResolver.Mutation,
    ...notificationResolver.Mutation,
    ...paymentResolver.Mutation,
  },
};
