/**
 * Manual script to sync existing Clerk users to Convex database
 * Run this after setting up the webhook to sync existing users
 * 
 * Usage:
 *   npx tsx scripts/sync-clerk-users.ts [--production]
 *   npx tsx scripts/sync-clerk-users.ts --dev (default)
 */

import dotenv from 'dotenv';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

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

const convex = new ConvexHttpClient(convexUrl);

async function syncExistingUsers() {
  console.log('🚀 Starting user sync from Clerk to Convex...');
  
  try {
    // Get all users from Clerk
    const clerkUsersResponse = await clerkClient.users.getUserList({
      limit: 100, // Adjust if you have more users
    });

    const clerkUsers = clerkUsersResponse.data || clerkUsersResponse;

    console.log(`📋 Found ${clerkUsers.length} users in Clerk`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const clerkUser of clerkUsers) {
      try {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (!email) {
          console.log(`⚠️  Skipping user ${clerkUser.id} - no email address`);
          skippedCount++;
          continue;
        }

        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        
        console.log(`👤 Syncing user: ${email} (${clerkUser.id})`);
        
        // Create user in Convex
        await convex.mutation(api.users.getOrCreateUser, {
          clerkId: clerkUser.id,
          email,
          name: name || undefined,
        });
        
        syncedCount++;
        console.log(`✅ Successfully synced: ${email}`);
        
      } catch (error) {
        console.error(`❌ Error syncing user ${clerkUser.id}:`, error);
        skippedCount++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`✅ Successfully synced: ${syncedCount} users`);
    console.log(`⚠️  Skipped: ${skippedCount} users`);
    console.log(`📝 Total processed: ${clerkUsers.length} users`);

    // Show current users in Convex
    console.log('\n🔍 Current users in Convex database:');
    // Note: We can't call queries from this script as it requires auth
    // You can check the Convex dashboard or run a query in your app
    
  } catch (error) {
    console.error('💥 Error during sync:', error);
    process.exit(1);
  }
}

// Run the sync
syncExistingUsers()
  .then(() => {
    console.log('\n🎉 User sync completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });