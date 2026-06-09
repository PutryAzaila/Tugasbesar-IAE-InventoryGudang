export const typeDefs = `#graphql

  # ============================
  # AUTH & USER TYPES
  # ============================

  type User {
    id: ID!
    username: String!
    role: String!
    is_active: Boolean!
    created_at: String!
    updated_at: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Role {
    id: ID!
    name: String!
  }

  # ============================
  # SUPPLIER TYPES
  # ============================

  type SupplierContact {
    contactName: String
    phone: String
    email: String
    isPrimary: Boolean
  }

  type SupplierAddress {
    label: String
    address: String
  }

  type Supplier {
    id: ID!
    name: String!
    tax_number: String
    is_active: Boolean!
    contacts: [SupplierContact]
    addresses: [SupplierAddress]
    created_at: String!
    updated_at: String!
  }

  # ============================
  # ITEM / PRODUCT TYPES
  # ============================

  type ItemUnit {
    id: ID!
    code: String!
    name: String!
  }

  type ItemCategory {
    id: ID!
    name: String!
    description: String
  }

  type Item {
    id: ID!
    unit_id: ID
    unit: ItemUnit
    category_id: ID
    category: ItemCategory
    sku: String!
    name: String!
    description: String
    is_active: Boolean!
    created_at: String!
    updated_at: String!
  }

  # ============================
  # STOCK TYPES
  # ============================

  type StockLocation {
    id: ID
    name: String
  }

  type Stock {
    id: ID!
    item_id: ID!
    location_id: ID
    location: StockLocation
    quantity: Int!
    min_quantity: Int!
    status: String!
  }

  type StockMovement {
    id: ID!
    stock_id: ID!
    item_id: ID!
    reason: String
    delta: Int!
    note: String
  }

  # ============================
  # HISTORY TYPES
  # ============================

  type HistoryEntry {
    id: ID!
    actor_id: String
    actor_name: String
    actor_role: String
    service: String!
    action: String!
    entity_type: String
    entity_id: String
    metadata: String
    created_at: String!
  }

  # ============================
  # NOTIFICATION TYPES
  # ============================

  type Notification {
    id: ID!
    type: String!
    message: String!
    is_read: Boolean!
    created_at: String!
  }

  type NotificationReadResult {
    message: String!
    data: Notification
  }

  # ============================
  # REPORT TYPES
  # ============================

  type ReportTotals {
    items: Int
    suppliers: Int
    stock_records: Int
    low_stock: Int
  }

  type ReportSupplier {
    id: ID
    name: String
    tax_number: String
    is_active: Boolean
    primary_contact: SupplierContact
    main_address: String
    created_at: String
    updated_at: String
  }

  type ReportSummary {
    generated_at: String
    totals: ReportTotals
    items: [Item]
    suppliers: [ReportSupplier]
    stocks: [Stock]
  }

  # ============================
  # PURCHASE ORDER TYPES
  # ============================

  type PurchaseOrder {
    id: ID!
    supplier_id: Int!
    item_id: Int!
    quantity: Int!
    status: String!
  }

  type PurchaseOrderHistory {
    supplier_id: Int
    total_po: Int
    history: [PurchaseOrder]
  }

  # ============================
  # COMMON TYPES
  # ============================

  type DeleteResult {
    success: Boolean!
    message: String
  }

  # ============================
  # INPUT TYPES
  # ============================

  input LoginInput {
    username: String!
    password: String!
  }

  input RegisterInput {
    username: String!
    password: String!
    role: String!
  }

  input SupplierInput {
    name: String!
    tax_number: String
    contact_name: String
    phone: String
    email: String
    address: String
    is_active: Boolean
  }

  input UpdateSupplierInput {
    name: String
    tax_number: String
    contact_name: String
    phone: String
    email: String
    address: String
    is_active: Boolean
  }

  input ItemInput {
    unit_id: ID!
    category_id: ID
    sku: String!
    name: String!
    description: String
    is_active: Boolean
  }

  input UpdateItemInput {
    unit_id: ID
    category_id: ID
    sku: String
    name: String
    description: String
    is_active: Boolean
  }

  input CreateStockInput {
    item_id: ID!
    location_id: ID
    quantity: Int!
    min_quantity: Int!
  }

  input UpdateStockInput {
    item_id: ID
    location_id: ID
    quantity: Int
    min_quantity: Int
  }

  input AdjustStockInput {
    delta: Int!
    reason_code: String!
    note: String!
  }

  input CreatePurchaseOrderInput {
    supplier_id: Int!
    item_id: Int!
    quantity: Int!
  }

  # ============================
  # ROOT QUERY
  # ============================

  type Query {
    # Auth / User (requires JWT)
    me: User!
    users: [User!]!
    roles: [Role!]!

    # Suppliers (requires JWT: admin, manager)
    suppliers: [Supplier!]!
    supplier(id: ID!): Supplier!

    # Items/Products (requires JWT: admin, manager)
    items: [Item!]!
    item(id: ID!): Item!
    itemUnits: [ItemUnit!]!
    itemCategories: [ItemCategory!]!

    # Stock (requires JWT: admin, manager)
    stocks: [Stock!]!
    stock(id: ID!): Stock!
    stockMovements(item_id: ID): [StockMovement!]!

    # History (requires JWT: admin only)
    history(limit: Int): [HistoryEntry!]!

    # Notifications (no auth required)
    notifications: [Notification!]!

    # Reports (requires JWT: admin only)
    reportSummary: ReportSummary!

    # Purchase Orders (no auth required - sesuaikan jika perlu)
    purchaseOrders: [PurchaseOrder!]!
    purchaseOrder(id: ID!): PurchaseOrder!
    purchaseOrdersBySupplier(supplier_id: Int!): PurchaseOrderHistory!
  }

  # ============================
  # ROOT MUTATION
  # ============================

  type Mutation {
    # Auth
    login(input: LoginInput!): AuthPayload!
    register(input: RegisterInput!): User!

    # Suppliers (requires JWT)
    createSupplier(input: SupplierInput!): Supplier!
    updateSupplier(id: ID!, input: UpdateSupplierInput!): Supplier!
    deleteSupplier(id: ID!): DeleteResult!

    # Items/Products (requires JWT)
    createItem(input: ItemInput!): Item!
    updateItem(id: ID!, input: UpdateItemInput!): Item!
    deleteItem(id: ID!): DeleteResult!

    # Stock (requires JWT)
    createStock(input: CreateStockInput!): Stock!
    updateStock(id: ID!, input: UpdateStockInput!): Stock!
    adjustStock(id: ID!, input: AdjustStockInput!): Stock!
    deleteStock(id: ID!): DeleteResult!

    # Notifications
    markNotificationRead(id: ID!): NotificationReadResult!

    # Purchase Orders
    createPurchaseOrder(input: CreatePurchaseOrderInput!): PurchaseOrder!
    updatePurchaseOrderStatus(id: ID!, status: String!): PurchaseOrder!
  }
`;
