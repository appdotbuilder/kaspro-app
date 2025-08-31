import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['admin', 'member']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Payment status enum
export const paymentStatusSchema = z.enum(['pending', 'paid', 'overdue', 'rejected']);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// Transaction type enum
export const transactionTypeSchema = z.enum(['income', 'expense']);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

// Notification type enum
export const notificationTypeSchema = z.enum(['payment_reminder', 'payment_confirmation', 'system_update', 'general']);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

// Activity type enum for audit log
export const activityTypeSchema = z.enum(['login', 'create', 'update', 'delete', 'approve', 'reject']);
export type ActivityType = z.infer<typeof activityTypeSchema>;

// Users schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  full_name: z.string(),
  phone: z.string().nullable(),
  profile_photo: z.string().nullable(),
  role: userRoleSchema,
  is_active: z.boolean(),
  cash_balance: z.number(),
  joined_date: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Input schema for creating users
export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  phone: z.string().nullable(),
  profile_photo: z.string().nullable(),
  role: userRoleSchema
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Input schema for updating users
export const updateUserInputSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  full_name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  profile_photo: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Monthly fees schema
export const monthlyFeeSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  amount: z.number().positive(),
  status: paymentStatusSchema,
  payment_date: z.coerce.date().nullable(),
  payment_proof: z.string().nullable(),
  approved_by: z.number().nullable(),
  approved_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MonthlyFee = z.infer<typeof monthlyFeeSchema>;

// Input schema for creating monthly fees
export const createMonthlyFeeInputSchema = z.object({
  user_id: z.number(),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  amount: z.number().positive()
});

export type CreateMonthlyFeeInput = z.infer<typeof createMonthlyFeeInputSchema>;

// Input schema for updating monthly fees
export const updateMonthlyFeeInputSchema = z.object({
  id: z.number(),
  status: paymentStatusSchema.optional(),
  payment_date: z.coerce.date().nullable().optional(),
  payment_proof: z.string().nullable().optional(),
  approved_by: z.number().nullable().optional()
});

export type UpdateMonthlyFeeInput = z.infer<typeof updateMonthlyFeeInputSchema>;

// Expenses schema
export const expenseSchema = z.object({
  id: z.number(),
  category: z.string(),
  amount: z.number().positive(),
  description: z.string(),
  expense_date: z.coerce.date(),
  receipt_image: z.string().nullable(),
  created_by: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  is_locked: z.boolean()
});

export type Expense = z.infer<typeof expenseSchema>;

// Input schema for creating expenses
export const createExpenseInputSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string(),
  expense_date: z.coerce.date(),
  receipt_image: z.string().nullable(),
  created_by: z.number()
});

export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

// Input schema for updating expenses
export const updateExpenseInputSchema = z.object({
  id: z.number(),
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  expense_date: z.coerce.date().optional(),
  receipt_image: z.string().nullable().optional()
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>;

// QR codes schema
export const qrCodeSchema = z.object({
  id: z.number(),
  image_url: z.string(),
  is_active: z.boolean(),
  created_by: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type QrCode = z.infer<typeof qrCodeSchema>;

// Input schema for creating QR codes
export const createQrCodeInputSchema = z.object({
  image_url: z.string().url(),
  created_by: z.number()
});

export type CreateQrCodeInput = z.infer<typeof createQrCodeInputSchema>;

// Notifications schema
export const notificationSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type Notification = z.infer<typeof notificationSchema>;

// Input schema for creating notifications
export const createNotificationInputSchema = z.object({
  user_id: z.number(),
  type: notificationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1)
});

export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;

// Message templates schema
export const messageTemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  template: z.string(),
  type: notificationTypeSchema,
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MessageTemplate = z.infer<typeof messageTemplateSchema>;

// Input schema for creating message templates
export const createMessageTemplateInputSchema = z.object({
  name: z.string().min(1),
  template: z.string().min(1),
  type: notificationTypeSchema
});

export type CreateMessageTemplateInput = z.infer<typeof createMessageTemplateInputSchema>;

// Audit logs schema
export const auditLogSchema = z.object({
  id: z.number(),
  admin_id: z.number(),
  activity_type: activityTypeSchema,
  table_name: z.string(),
  record_id: z.number().nullable(),
  old_values: z.string().nullable(), // JSON string
  new_values: z.string().nullable(), // JSON string
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.coerce.date()
});

export type AuditLog = z.infer<typeof auditLogSchema>;

// Input schema for creating audit logs
export const createAuditLogInputSchema = z.object({
  admin_id: z.number(),
  activity_type: activityTypeSchema,
  table_name: z.string(),
  record_id: z.number().nullable(),
  old_values: z.string().nullable(),
  new_values: z.string().nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable()
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogInputSchema>;

// System settings schema
export const systemSettingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type SystemSetting = z.infer<typeof systemSettingSchema>;

// Input schema for creating system settings
export const createSystemSettingInputSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().nullable()
});

export type CreateSystemSettingInput = z.infer<typeof createSystemSettingInputSchema>;

// Dashboard statistics schema
export const dashboardStatsSchema = z.object({
  total_cash: z.number(),
  active_members: z.number(),
  monthly_income: z.number(),
  monthly_expenses: z.number(),
  pending_approvals: z.number(),
  overdue_payments: z.number()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Login input schema
export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Change password input schema
export const changePasswordInputSchema = z.object({
  user_id: z.number(),
  current_password: z.string().min(1),
  new_password: z.string().min(6)
});

export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;

// Payment proof upload schema
export const uploadPaymentProofInputSchema = z.object({
  fee_id: z.number(),
  payment_proof: z.string().url()
});

export type UploadPaymentProofInput = z.infer<typeof uploadPaymentProofInputSchema>;