import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  loginInputSchema,
  changePasswordInputSchema,
  createUserInputSchema,
  updateUserInputSchema,
  createMonthlyFeeInputSchema,
  updateMonthlyFeeInputSchema,
  uploadPaymentProofInputSchema,
  createExpenseInputSchema,
  updateExpenseInputSchema,
  createQrCodeInputSchema,
  createNotificationInputSchema,
  createMessageTemplateInputSchema,
  createAuditLogInputSchema,
  createSystemSettingInputSchema
} from './schema';

// Import handlers
import { login, changePassword, getCurrentUser } from './handlers/auth';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  searchUsers 
} from './handlers/users';
import {
  getMonthlyFees,
  getMonthlyFeesByUser,
  getMonthlyFeesByPeriod,
  createMonthlyFee,
  updateMonthlyFee,
  uploadPaymentProof,
  approvePayment,
  rejectPayment,
  getPendingApprovals,
  getOverduePayments
} from './handlers/monthly_fees';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByCategory,
  getExpensesByDateRange,
  lockExpensesOlderThan48Hours
} from './handlers/expenses';
import {
  getActiveQrCode,
  getAllQrCodes,
  createQrCode,
  activateQrCode,
  deactivateQrCode,
  deleteQrCode
} from './handlers/qr_codes';
import {
  getNotifications,
  getUnreadNotifications,
  createNotification,
  createBulkNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendPaymentReminders
} from './handlers/notifications';
import {
  getMessageTemplates,
  getMessageTemplateById,
  getMessageTemplateByType,
  createMessageTemplate,
  updateMessageTemplate,
  toggleMessageTemplateStatus,
  deleteMessageTemplate,
  previewMessageTemplate
} from './handlers/message_templates';
import {
  getAuditLogs,
  getAuditLogsByAdmin,
  getAuditLogsByTable,
  getAuditLogsByDateRange,
  createAuditLog,
  getAuditLogById,
  searchAuditLogs,
  getAuditLogStatistics
} from './handlers/audit_logs';
import {
  getSystemSettings,
  getSystemSettingByKey,
  createSystemSetting,
  updateSystemSetting,
  toggleSystemSetting,
  deleteSystemSetting,
  getMaintenanceMode,
  setMaintenanceMode,
  getAppSettings
} from './handlers/system_settings';
import {
  getDashboardStats,
  getMemberDashboardData,
  getMonthlyIncomeExpenseChart,
  getExpenseCategoryChart,
  getPaymentStatusSummary,
  getRecentActivities
} from './handlers/dashboard';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  login: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => login(input)),
  
  changePassword: publicProcedure
    .input(changePasswordInputSchema)
    .mutation(({ input }) => changePassword(input)),
  
  getCurrentUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getCurrentUser(input.userId)),

  // User management routes
  getUsers: publicProcedure
    .query(() => getUsers()),
  
  getUserById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getUserById(input.id)),
  
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),
  
  deleteUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteUser(input.id)),
  
  searchUsers: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => searchUsers(input.query)),

  // Monthly fees routes
  getMonthlyFees: publicProcedure
    .query(() => getMonthlyFees()),
  
  getMonthlyFeesByUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getMonthlyFeesByUser(input.userId)),
  
  getMonthlyFeesByPeriod: publicProcedure
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(({ input }) => getMonthlyFeesByPeriod(input.month, input.year)),
  
  createMonthlyFee: publicProcedure
    .input(createMonthlyFeeInputSchema)
    .mutation(({ input }) => createMonthlyFee(input)),
  
  updateMonthlyFee: publicProcedure
    .input(updateMonthlyFeeInputSchema)
    .mutation(({ input }) => updateMonthlyFee(input)),
  
  uploadPaymentProof: publicProcedure
    .input(uploadPaymentProofInputSchema)
    .mutation(({ input }) => uploadPaymentProof(input)),
  
  approvePayment: publicProcedure
    .input(z.object({ feeId: z.number(), adminId: z.number() }))
    .mutation(({ input }) => approvePayment(input.feeId, input.adminId)),
  
  rejectPayment: publicProcedure
    .input(z.object({ feeId: z.number(), adminId: z.number() }))
    .mutation(({ input }) => rejectPayment(input.feeId, input.adminId)),
  
  getPendingApprovals: publicProcedure
    .query(() => getPendingApprovals()),
  
  getOverduePayments: publicProcedure
    .query(() => getOverduePayments()),

  // Expenses routes
  getExpenses: publicProcedure
    .query(() => getExpenses()),
  
  getExpenseById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getExpenseById(input.id)),
  
  createExpense: publicProcedure
    .input(createExpenseInputSchema)
    .mutation(({ input }) => createExpense(input)),
  
  updateExpense: publicProcedure
    .input(updateExpenseInputSchema)
    .mutation(({ input }) => updateExpense(input)),
  
  deleteExpense: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteExpense(input.id)),
  
  getExpensesByCategory: publicProcedure
    .query(() => getExpensesByCategory()),
  
  getExpensesByDateRange: publicProcedure
    .input(z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }))
    .query(({ input }) => getExpensesByDateRange(input.startDate, input.endDate)),
  
  lockExpensesOlderThan48Hours: publicProcedure
    .mutation(() => lockExpensesOlderThan48Hours()),

  // QR codes routes
  getActiveQrCode: publicProcedure
    .query(() => getActiveQrCode()),
  
  getAllQrCodes: publicProcedure
    .query(() => getAllQrCodes()),
  
  createQrCode: publicProcedure
    .input(createQrCodeInputSchema)
    .mutation(({ input }) => createQrCode(input)),
  
  activateQrCode: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => activateQrCode(input.id)),
  
  deactivateQrCode: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deactivateQrCode(input.id)),
  
  deleteQrCode: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteQrCode(input.id)),

  // Notifications routes
  getNotifications: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getNotifications(input.userId)),
  
  getUnreadNotifications: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getUnreadNotifications(input.userId)),
  
  createNotification: publicProcedure
    .input(createNotificationInputSchema)
    .mutation(({ input }) => createNotification(input)),
  
  createBulkNotifications: publicProcedure
    .input(z.object({ userIds: z.array(z.number()), title: z.string(), message: z.string(), type: z.string() }))
    .mutation(({ input }) => createBulkNotifications(input.userIds, input.title, input.message, input.type)),
  
  markNotificationAsRead: publicProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(({ input }) => markNotificationAsRead(input.notificationId)),
  
  markAllNotificationsAsRead: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(({ input }) => markAllNotificationsAsRead(input.userId)),
  
  deleteNotification: publicProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(({ input }) => deleteNotification(input.notificationId)),
  
  sendPaymentReminders: publicProcedure
    .mutation(() => sendPaymentReminders()),

  // Message templates routes
  getMessageTemplates: publicProcedure
    .query(() => getMessageTemplates()),
  
  getMessageTemplateById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getMessageTemplateById(input.id)),
  
  getMessageTemplateByType: publicProcedure
    .input(z.object({ type: z.string() }))
    .query(({ input }) => getMessageTemplateByType(input.type)),
  
  createMessageTemplate: publicProcedure
    .input(createMessageTemplateInputSchema)
    .mutation(({ input }) => createMessageTemplate(input)),
  
  updateMessageTemplate: publicProcedure
    .input(z.object({ id: z.number(), updates: z.any() }))
    .mutation(({ input }) => updateMessageTemplate(input.id, input.updates)),
  
  toggleMessageTemplateStatus: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => toggleMessageTemplateStatus(input.id)),
  
  deleteMessageTemplate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteMessageTemplate(input.id)),
  
  previewMessageTemplate: publicProcedure
    .input(z.object({ templateId: z.number(), variables: z.record(z.string()) }))
    .query(({ input }) => previewMessageTemplate(input.templateId, input.variables)),

  // Audit logs routes
  getAuditLogs: publicProcedure
    .query(() => getAuditLogs()),
  
  getAuditLogsByAdmin: publicProcedure
    .input(z.object({ adminId: z.number() }))
    .query(({ input }) => getAuditLogsByAdmin(input.adminId)),
  
  getAuditLogsByTable: publicProcedure
    .input(z.object({ tableName: z.string() }))
    .query(({ input }) => getAuditLogsByTable(input.tableName)),
  
  getAuditLogsByDateRange: publicProcedure
    .input(z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }))
    .query(({ input }) => getAuditLogsByDateRange(input.startDate, input.endDate)),
  
  createAuditLog: publicProcedure
    .input(createAuditLogInputSchema)
    .mutation(({ input }) => createAuditLog(input)),
  
  getAuditLogById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getAuditLogById(input.id)),
  
  searchAuditLogs: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => searchAuditLogs(input.query)),
  
  getAuditLogStatistics: publicProcedure
    .query(() => getAuditLogStatistics()),

  // System settings routes
  getSystemSettings: publicProcedure
    .query(() => getSystemSettings()),
  
  getSystemSettingByKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(({ input }) => getSystemSettingByKey(input.key)),
  
  createSystemSetting: publicProcedure
    .input(createSystemSettingInputSchema)
    .mutation(({ input }) => createSystemSetting(input)),
  
  updateSystemSetting: publicProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(({ input }) => updateSystemSetting(input.key, input.value)),
  
  toggleSystemSetting: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(({ input }) => toggleSystemSetting(input.key)),
  
  deleteSystemSetting: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(({ input }) => deleteSystemSetting(input.key)),
  
  getMaintenanceMode: publicProcedure
    .query(() => getMaintenanceMode()),
  
  setMaintenanceMode: publicProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(({ input }) => setMaintenanceMode(input.enabled)),
  
  getAppSettings: publicProcedure
    .query(() => getAppSettings()),

  // Dashboard routes
  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),
  
  getMemberDashboardData: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getMemberDashboardData(input.userId)),
  
  getMonthlyIncomeExpenseChart: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(({ input }) => getMonthlyIncomeExpenseChart(input.year)),
  
  getExpenseCategoryChart: publicProcedure
    .query(() => getExpenseCategoryChart()),
  
  getPaymentStatusSummary: publicProcedure
    .query(() => getPaymentStatusSummary()),
  
  getRecentActivities: publicProcedure
    .input(z.object({ limit: z.number() }))
    .query(({ input }) => getRecentActivities(input.limit)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`KasPro TRPC server listening at port: ${port}`);
}

start();