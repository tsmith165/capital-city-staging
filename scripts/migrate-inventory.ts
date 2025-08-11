/**
 * Migration script to sync existing inventory from PostgreSQL to Convex database
 * Run this after setting up Convex schema to migrate existing inventory data
 * 
 * Usage:
 *   npx tsx scripts/migrate-inventory.ts [--production]
 *   npx tsx scripts/migrate-inventory.ts --dev (default)
 */

import dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { inventoryTable, extraImagesTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';

// Check command line arguments
const isProduction = process.argv.includes('--production');

// Convex URLs
const CONVEX_DEV_URL = 'https://proficient-cod-5.convex.cloud';
const CONVEX_PROD_URL = 'https://valuable-mosquito-910.convex.cloud';

// Choose the appropriate Convex URL
const convexUrl = isProduction ? CONVEX_PROD_URL : CONVEX_DEV_URL;

console.log(`🎯 Target environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`🔗 Convex URL: ${convexUrl}`);

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Create database connection directly (avoiding the config import issue)
const sql = neon(process.env.NEON_DATABASE_URL!);
const db = drizzle(sql);

const convex = new ConvexHttpClient(convexUrl);

async function migrateInventory() {
  console.log('🚀 Starting inventory migration from PostgreSQL to Convex...');
  
  try {
    // Get all inventory from PostgreSQL
    console.log('📋 Fetching inventory from PostgreSQL...');
    const inventory = await db.select().from(inventoryTable).execute();
    
    console.log(`📦 Found ${inventory.length} inventory items to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const item of inventory) {
      try {
        console.log(`📦 Migrating inventory: ${item.name} (pId: ${item.p_id})`);
        
        // Create inventory item in Convex using internal migration function
        const inventoryData = {
          oId: item.o_id,
          pId: item.p_id,
          active: item.active ?? true,
          name: item.name,
          cost: item.cost ?? undefined,
          price: item.price,
          vendor: item.vendor,
          category: item.category,
          description: item.description,
          count: item.count,
          location: item.location,
          realWidth: item.real_width,
          realHeight: item.real_height,
          realDepth: item.real_depth,
          imagePath: item.image_path,
          width: item.width,
          height: item.height,
          smallImagePath: item.small_image_path,
          smallWidth: item.small_width,
          smallHeight: item.small_height,
        };
        
        console.log(`📊 Sending to Convex:`, inventoryData);
        
        try {
          const inventoryId = await convex.mutation(api.inventory.migrateCreateInventory, inventoryData);
          console.log(`✨ Created inventory ID: ${inventoryId}`);
        } catch (convexError: any) {
          console.error(`🔥 Convex mutation error:`, convexError);
          console.error(`🔥 Error details:`, JSON.stringify(convexError, null, 2));
          throw convexError;
        }
        
        // Get extra images for this inventory item
        const extraImages = await db
          .select()
          .from(extraImagesTable)
          .where(eq(extraImagesTable.inventory_id, item.id))
          .execute();
        
        // Migrate extra images using internal migration function
        for (const extraImage of extraImages) {
          await convex.mutation(api.inventory.migrateAddExtraImage, {
            inventoryId,
            title: extraImage.title || undefined,
            imagePath: extraImage.image_path,
            width: extraImage.width,
            height: extraImage.height,
            smallImagePath: extraImage.small_image_path || undefined,
            smallWidth: extraImage.small_width || undefined,
            smallHeight: extraImage.small_height || undefined,
          });
        }
        
        migratedCount++;
        console.log(`✅ Successfully migrated: ${item.name} (with ${extraImages.length} extra images)`);
        
      } catch (error) {
        console.error(`❌ Error migrating inventory ${item.id} (${item.name}):`, error);
        
        // Log item details for debugging
        console.log(`   📋 Item details:`, {
          oId: item.o_id,
          pId: item.p_id,
          active: item.active,
          name: item.name,
          vendor: item.vendor,
          category: item.category,
          description: item.description,
          count: item.count,
          location: item.location,
          price: item.price,
        });
        
        errorCount++;
        
        // Check if it's a duplicate error and skip
        if (error instanceof Error && (error.message.includes('duplicate') || error.message.includes('already exists'))) {
          console.log(`⚠️  Skipping duplicate: ${item.name}`);
          skippedCount++;
          errorCount--; // Don't count as error if it's just a duplicate
        }
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} inventory items`);
    console.log(`⚠️  Skipped (duplicates): ${skippedCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    console.log(`📝 Total processed: ${inventory.length} items`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some items failed to migrate. Check the errors above.');
    } else {
      console.log('\n🎉 All inventory items migrated successfully!');
    }
    
  } catch (error) {
    console.error('💥 Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateInventory()
  .then(() => {
    console.log('\n🎉 Inventory migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });