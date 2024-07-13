// File 1: /src/db/schema.ts

import { pgTable, text, integer, date, serial, boolean } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

export const inventoryTable = pgTable('inventory', {
    id: serial('id').notNull().primaryKey(),
    o_id: integer('o_id').notNull(),
    p_id: integer('p_id').notNull().default(0),
    active: boolean('active').default(true),
    name: text('name').notNull(),
    cost: integer('cost'),
    price: integer('price').notNull(),
    vendor: text('vendor').notNull(),
    category: text('category').notNull(),
    description: text('description').notNull(),
    count: integer('count').notNull(),
    location: text('location').notNull(),
    real_width: integer('real_width').notNull(),
    real_height: integer('real_height').notNull(),
    real_depth: integer('real_depth').notNull(),
    image_path: text('image_path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    small_image_path: text('small_image_path').notNull(),
    small_width: integer('small_width').notNull(),
    small_height: integer('small_height').notNull(),
});

export type Inventory = InferSelectModel<typeof inventoryTable>;
export type InsertInventory = InferInsertModel<typeof inventoryTable>;

export const extraImagesTable = pgTable('ExtraImages', {
    id: serial('id').notNull().primaryKey(),
    inventory_id: integer('piece_id')
        .notNull()
        .references(() => inventoryTable.id),
    title: text('title').default(''),
    image_path: text('image_path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    small_image_path: text('small_image_path'),
    small_width: integer('small_width'),
    small_height: integer('small_height'),
});

export type ExtraImages = InferSelectModel<typeof extraImagesTable>;
export type InsertExtraImages = InferInsertModel<typeof extraImagesTable>;

export const resendCoreTable = pgTable('resendCoreTable', {
    id: serial('id').notNull().primaryKey(),
    date: date('date').notNull().unique(),
    emails_sent: integer('emails_sent').notNull().default(0),
});

export type ResendCore = InferSelectModel<typeof resendCoreTable>;
export type InsertResendCore = InferInsertModel<typeof resendCoreTable>;

export type InventoryWithImages = Inventory & {
    extraImages: ExtraImages[];
};