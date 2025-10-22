require('dotenv').config({path:'.env.local'});

console.log('\n🔍 Environment Check\n');
console.log('='.repeat(50));
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ SET (starts with: ' + process.env.RESEND_API_KEY.substring(0,10) + '...)' : '❌ NOT SET');
console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ SET' : '❌ NOT SET');
console.log('ADMIN_BASE_URL:', process.env.ADMIN_BASE_URL || 'Not set (will use http://localhost:3001)');
console.log('='.repeat(50));
console.log('\n');
