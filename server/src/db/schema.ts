import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer, 
  boolean, 
  pgEnum,
  index,
  foreignKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'member']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue', 'rejected']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
export const notificationTypeEnum = pgEnum('notification_type', ['payment_reminder', 'payment_confirmation', 'system_update', 'general']);
export const activityTypeEnum = pgEnum('activity_type', ['login', 'create', 'update', 'delete', 'approve', 'reject']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name: text('full_name').notNull(),
  phone: text('phone'),
  profile_photo: text('profile_photo'),
  role: userRoleEnum('role').notNull().default('member'),
  is_active: boolean('is_active').notNull().default(true),
  cash_balance: numeric('cash_balance', { precision: 12, scale: 2 }).notNull().default('0.00'),
  joined_date: timestamp('joined_date').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// Monthly fees table
export const monthlyFeesTable = pgTable('monthly_fees', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  payment_date: timestamp('payment_date'),
  payment_proof: text('payment_proof'),
  approved_by: integer('approved_by'),
  approved_at: timestamp('approved_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userMonthYearIdx: index('monthly_fees_user_month_year_idx').on(table.user_id, table.month, table.year),
  statusIdx: index('monthly_fees_status_idx').on(table.status),
  userFk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [usersTable.id],
  }),
  approvedByFk: foreignKey({
    columns: [table.approved_by],
    foreignColumns: [usersTable.id],
  }),
}));

// Expenses table
export const expensesTable = pgTable('expenses', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  expense_date: timestamp('expense_date').notNull(),
  receipt_image: text('receipt_image'),
  created_by: integer('created_by').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  is_locked: boolean('is_locked').notNull().default(false),
}, (table) => ({
  categoryIdx: index('expenses_category_idx').on(table.category),
  dateIdx: index('expenses_date_idx').on(table.expense_date),
  createdByFk: foreignKey({
    columns: [table.created_by],
    foreignColumns: [usersTable.id],
  }),
}));

// QR codes table
export const qrCodesTable = pgTable('qr_codes', {
  id: serial('id').primaryKey(),
  image_url: text('image_url').notNull(),
  is_active: boolean('is_active').notNull().default(false),
  created_by: integer('created_by').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  activeIdx: index('qr_codes_active_idx').on(table.is_active),
  createdByFk: foreignKey({
    columns: [table.created_by],
    foreignColumns: [usersTable.id],
  }),
}));

// Notifications table
export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.user_id),
  typeIdx: index('notifications_type_idx').on(table.type),
  readIdx: index('notifications_read_idx').on(table.is_read),
  userFk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [usersTable.id],
  }),
}));

// Message templates table
export const messageTemplatesTable = pgTable('message_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  template: text('template').notNull(),
  type: notificationTypeEnum('type').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('message_templates_name_idx').on(table.name),
  typeIdx: index('message_templates_type_idx').on(table.type),
}));

// Audit logs table
export const auditLogsTable = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  admin_id: integer('admin_id').notNull(),
  activity_type: activityTypeEnum('activity_type').notNull(),
  table_name: text('table_name').notNull(),
  record_id: integer('record_id'),
  old_values: text('old_values'), // JSON string
  new_values: text('new_values'), // JSON string
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  adminIdx: index('audit_logs_admin_idx').on(table.admin_id),
  activityIdx: index('audit_logs_activity_idx').on(table.activity_type),
  tableIdx: index('audit_logs_table_idx').on(table.table_name),
  dateIdx: index('audit_logs_date_idx').on(table.created_at),
  adminFk: foreignKey({
    columns: [table.admin_id],
    foreignColumns: [usersTable.id],
  }),
}));

// System settings table
export const systemSettingsTable = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  keyIdx: index('system_settings_key_idx').on(table.key),
}));

// Define relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  monthlyFees: many(monthlyFeesTable),
  approvedFees: many(monthlyFeesTable, { relationName: 'approver' }),
  expenses: many(expensesTable),
  qrCodes: many(qrCodesTable),
  notifications: many(notificationsTable),
  auditLogs: many(auditLogsTable),
}));

export const monthlyFeesRelations = relations(monthlyFeesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [monthlyFeesTable.user_id],
    references: [usersTable.id],
  }),
  approver: one(usersTable, {
    fields: [monthlyFeesTable.approved_by],
    references: [usersTable.id],
    relationName: 'approver',
  }),
}));

export const expensesRelations = relations(expensesTable, ({ one }) => ({
  creator: one(usersTable, {
    fields: [expensesTable.created_by],
    references: [usersTable.id],
  }),
}));

export const qrCodesRelations = relations(qrCodesTable, ({ one }) => ({
  creator: one(usersTable, {
    fields: [qrCodesTable.created_by],
    references: [usersTable.id],
  }),
}));

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [notificationsTable.user_id],
    references: [usersTable.id],
  }),
}));

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  admin: one(usersTable, {
    fields: [auditLogsTable.admin_id],
    references: [usersTable.id],
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type MonthlyFee = typeof monthlyFeesTable.$inferSelect;
export type NewMonthlyFee = typeof monthlyFeesTable.$inferInsert;
export type Expense = typeof expensesTable.$inferSelect;
export type NewExpense = typeof expensesTable.$inferInsert;
export type QrCode = typeof qrCodesTable.$inferSelect;
export type NewQrCode = typeof qrCodesTable.$inferInsert;
export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
export type MessageTemplate = typeof messageTemplatesTable.$inferSelect;
export type NewMessageTemplate = typeof messageTemplatesTable.$inferInsert;
export type AuditLog = typeof auditLogsTable.$inferSelect;
export type NewAuditLog = typeof auditLogsTable.$inferInsert;
export type SystemSetting = typeof systemSettingsTable.$inferSelect;
export type NewSystemSetting = typeof systemSettingsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  monthlyFees: monthlyFeesTable,
  expenses: expensesTable,
  qrCodes: qrCodesTable,
  notifications: notificationsTable,
  messageTemplates: messageTemplatesTable,
  auditLogs: auditLogsTable,
  systemSettings: systemSettingsTable,
};