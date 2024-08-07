import '@/lib/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { resendCoreTable, inventoryTable, extraImagesTable } from '@/db/schema';

const sql = neon(process.env.NEON_DATABASE_URL!);
const db = drizzle(sql);

export { db, resendCoreTable, inventoryTable, extraImagesTable};
