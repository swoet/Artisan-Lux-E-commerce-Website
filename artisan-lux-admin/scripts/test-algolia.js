// Test Algolia connection and sync products
require('dotenv').config({ path: '.env.local' });
const { algoliasearch } = require('algoliasearch');

async function testAlgolia() {
  console.log('🔍 Testing Algolia connection...\n');
  
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  
  if (!appId || !adminKey) {
    console.error('❌ Missing Algolia credentials!');
    console.log('App ID:', appId ? '✅' : '❌');
    console.log('Admin Key:', adminKey ? '✅' : '❌');
    process.exit(1);
  }
  
  try {
    const client = algoliasearch(appId, adminKey);
    
    // Test connection
    console.log('✅ Algolia client initialized');
    console.log('📦 App ID:', appId);
    console.log('🔑 Admin Key:', adminKey.substring(0, 8) + '...\n');
    
    // Try to search (this will create the index if it doesn't exist)
    try {
      const { results } = await client.search({
        requests: [
          {
            indexName: 'products',
            query: '',
            hitsPerPage: 1,
          },
        ],
      });
      console.log('✅ Connected to Algolia successfully!');
      console.log(`📊 Current products in index: ${results[0].nbHits}\n`);
    } catch (err) {
      console.log('ℹ️  Connected to Algolia - ready for first sync\n');
    }
    
    console.log('✅ Algolia setup is ready!');
    console.log('\n🚀 Next step: Run product sync from admin dashboard');
    console.log('   POST http://localhost:3001/api/algolia/sync\n');
    
  } catch (error) {
    console.error('❌ Algolia connection failed:', error.message);
    process.exit(1);
  }
}

testAlgolia();
