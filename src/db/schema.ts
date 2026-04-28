import { pgTable, uuid, text, timestamp, pgEnum, numeric, boolean, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------------------------------------------------------
// ENUMS
// ----------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["admin", "investor", "msme"]);
export const kycStatusEnum = pgEnum("kyc_status", ["pending", "approved", "rejected"]);
export const documentTypeEnum = pgEnum("document_type", ["pan", "gstin", "udyam", "bank_statement", "aadhaar", "cancelled_cheque"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["pending_verification", "approved", "rejected", "funded", "repaid"]);
export const fundingStatusEnum = pgEnum("funding_status", ["open", "filled", "cancelled", "completed"]);
export const investmentStatusEnum = pgEnum("investment_status", ["active", "completed", "defaulted"]);
export const repaymentStatusEnum = pgEnum("repayment_status", ["pending", "completed", "overdue"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "investment", "repayment", "penalty"]);
export const disputeStatusEnum = pgEnum("dispute_status", ["open", "in_review", "resolved", "rejected"]);
export const notificationTypeEnum = pgEnum("notification_type", ["system", "payment", "funding", "kyc", "security"]);
export const preClosureStatusEnum = pgEnum("pre_closure_status", ["pending", "approved", "rejected"]);

// ----------------------------------------------------------------------
// TABLES
// ----------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // Maps to auth.uid() in Supabase
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name"),
  
  // Investor / MSME Profile Details
  panNumber: text("pan_number"),
  aadhaarNumber: text("aadhaar_number"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  
  // Bank Details
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  accountHolderName: text("account_holder_name"),
  
  // Nominee Details (Optional for now)
  nomineeName: text("nominee_name"),
  nomineeRelation: text("nominee_relation"),
  
  kycStatus: kycStatusEnum("kyc_status").notNull().default("pending"),
  walletBalance: numeric("wallet_balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  isSuspended: boolean("is_suspended").notNull().default(false),
  suspensionReason: text("suspension_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const kycDocuments = pgTable("kyc_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  documentType: documentTypeEnum("document_type").notNull(),
  fileUrl: text("file_url").notNull(), // Path in Supabase Storage
  status: kycStatusEnum("status").notNull().default("pending"),
  verifiedBy: uuid("verified_by").references(() => users.id), // Admin who verified
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.userId, t.documentType),
}));

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  msmeId: uuid("msme_id").references(() => users.id).notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: invoiceStatusEnum("status").notNull().default("pending_verification"),
  fileUrl: text("file_url").notNull(),
  verifiedBy: uuid("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (t) => ({
  unq: unique().on(t.msmeId, t.invoiceNumber),
}));

export const fundingRequests = pgTable("funding_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  requestedAmount: numeric("requested_amount", { precision: 12, scale: 2 }).notNull(),
  yieldRate: numeric("yield_rate", { precision: 5, scale: 2 }).notNull(), // e.g., 12.50 for 12.5%
  status: fundingStatusEnum("status").notNull().default("open"),
  fundingDeadline: timestamp("funding_deadline").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const investments = pgTable("investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundingRequestId: uuid("funding_request_id").references(() => fundingRequests.id).notNull(),
  investorId: uuid("investor_id").references(() => users.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: investmentStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repayments = pgTable("repayments", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundingRequestId: uuid("funding_request_id").references(() => fundingRequests.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  status: repaymentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // e.g., 'approve_kyc', 'suspend_user'
  entityType: text("entity_type").notNull(), // e.g., 'users', 'invoices'
  entityId: uuid("entity_id").notNull(),
  oldData: text("old_data"), // JSON string
  newData: text("new_data"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fraudFlags = pgTable("fraud_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(), // 'user' or 'invoice'
  entityId: uuid("entity_id").notNull(),
  flaggedBy: uuid("flagged_by").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  status: text("status").notNull().default("active"), // 'active', 'resolved', 'false_positive'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  referenceId: uuid("reference_id").notNull(), // e.g., invoiceId or investmentId
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("other"), // 'payment', 'invoice', 'kyc', 'technical', 'other'
  status: disputeStatusEnum("status").notNull().default("open"),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const penalties = pgTable("penalties", {
  id: uuid("id").primaryKey().defaultRandom(),
  repaymentId: uuid("repayment_id").references(() => repayments.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason").notNull(), // e.g., 'Late Payment'
  status: text("status").notNull().default("unpaid"), // 'unpaid', 'paid'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preClosureRequests = pgTable("pre_closure_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundingRequestId: uuid("funding_request_id").references(() => fundingRequests.id).notNull(),
  requestedBy: uuid("requested_by").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  status: preClosureStatusEnum("status").notNull().default("pending"),
  penaltyAmount: numeric("penalty_amount", { precision: 12, scale: 2 }).default("0.00"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull().default("system"),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  action: text("action").notNull(), // e.g., 'login', 'upload_invoice', 'request_financing'
  details: text("details"), // JSON or description
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// ----------------------------------------------------------------------
// RELATIONS
// ----------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  kycDocuments: many(kycDocuments),
  invoices: many(invoices),
  investments: many(investments),
  transactions: many(transactions),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  msme: one(users, { fields: [invoices.msmeId], references: [users.id] }),
  fundingRequest: one(fundingRequests, { fields: [invoices.id], references: [fundingRequests.invoiceId] }),
}));

export const fundingRequestsRelations = relations(fundingRequests, ({ one, many }) => ({
  invoice: one(invoices, { fields: [fundingRequests.invoiceId], references: [invoices.id] }),
  investments: many(investments),
  repayments: many(repayments),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  fundingRequest: one(fundingRequests, { fields: [investments.fundingRequestId], references: [fundingRequests.id] }),
  investor: one(users, { fields: [investments.investorId], references: [users.id] }),
}));

export const repaymentsRelations = relations(repayments, ({ one, many }) => ({
  fundingRequest: one(fundingRequests, { fields: [repayments.fundingRequestId], references: [fundingRequests.id] }),
  penalties: many(penalties),
}));

export const penaltiesRelations = relations(penalties, ({ one }) => ({
  repayment: one(repayments, { fields: [penalties.repaymentId], references: [repayments.id] }),
}));

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  user: one(users, { fields: [kycDocuments.userId], references: [users.id] }),
}));
