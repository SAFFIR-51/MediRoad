import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  role: text("role").notNull().default("member"), // member | admin
  status: text("status").notNull().default("active"), // active | withdrawn | blocked
  memo: text("memo"),
  mustChangePw: integer("must_change_pw").notNull().default(0),
  createdAt: text("created_at").notNull(),
  lastLogin: text("last_login"),
});

export const listings = sqliteTable("listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // lease | sale
  category: text("category").notNull(),
  title: text("title").notNull(),
  region: text("region").notNull(),
  address: text("address"),
  dateListed: text("date_listed").notNull(),
  deposit: text("deposit"),
  rent: text("rent"),
  area: text("area"),
  floor: text("floor"),
  features: text("features"), // JSON array
  images: text("images"), // JSON array
  description: text("description"),
  lat: real("lat"),
  lng: real("lng"),
  isSample: integer("is_sample").notNull().default(0),
  status: text("status").notNull().default("open"), // open | closed | hidden
  views: integer("views").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  board: text("board").notNull().default("archive"),
  title: text("title").notNull(),
  content: text("content"),
  filePath: text("file_path"),
  fileName: text("file_name"),
  isNotice: integer("is_notice").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  fields: text("fields"), // JSON object
  message: text("message"),
  listingCode: text("listing_code"),
  status: text("status").notNull().default("new"), // new | done
  memo: text("memo"),
  createdAt: text("created_at").notNull(),
});

export const passwordResets = sqliteTable("password_resets", {
  token: text("token").primaryKey(),
  memberId: integer("member_id").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const popups = sqliteTable("popups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  image: text("image"),
  link: text("link"),
  startAt: text("start_at"),
  endAt: text("end_at"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("skey").primaryKey(),
  value: text("svalue"),
});

export type Member = typeof members.$inferSelect;
export type ListingRow = typeof listings.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type Popup = typeof popups.$inferSelect;
