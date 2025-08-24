const fs = require('fs');
const path = require('path');

console.log('🗄️ Database Status Checker');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('\n📋 Environment Configuration:');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        if (key === 'DATABASE_URL') {
          // Mask password in DATABASE_URL
          const maskedValue = value.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
          console.log(`   ${key}: ${maskedValue}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      }
    }
  });
} else {
  console.log('❌ .env file not found');
}

// Check if PostgreSQL is installed
console.log('\n🔍 PostgreSQL Installation Check:');
const { exec } = require('child_process');

exec('which psql', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ PostgreSQL CLI (psql) not found');
    console.log('   Please install PostgreSQL first');
  } else {
    console.log('✅ PostgreSQL CLI found at:', stdout.trim());
    
    // Check if PostgreSQL service is running
    exec('pg_isready', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ PostgreSQL service is not running');
        console.log('   Please start PostgreSQL service');
      } else {
        console.log('✅ PostgreSQL service is running');
      }
    });
  }
});

// Check database schema files
console.log('\n📁 Database Schema Files:');
const schemaDir = path.join(__dirname, 'src', 'database');
const schemaFiles = [
  'complete_schema.sql',
  'schema_v2.sql',
  'drop_tables.sql',
  'test_queries.sql'
];

schemaFiles.forEach(file => {
  const filePath = path.join(schemaDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (missing)`);
  }
});

// Check if server is running
console.log('\n🌐 Server Status Check:');
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Server is running');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.message}`);
    } catch (e) {
      console.log('⚠️  Server responded but with unexpected format');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Server is not running');
  console.log('   Start server with: npm run dev');
});

req.on('timeout', () => {
  console.log('⏰ Server connection timeout');
  console.log('   Server might be starting up...');
});

req.end();

// Provide helpful commands
console.log('\n🚀 Quick Commands:');
console.log('   Start server: npm run dev');
console.log('   Test database: curl http://localhost:3001/api/db-test');
console.log('   Check health: curl http://localhost:3001/api/health');
console.log('   Initialize DB: npm run db:init');
console.log('   Test auth: npm run test:auth');
console.log('   Test tasks: npm run test:tasks');

console.log('\n📚 Documentation:');
console.log('   Database setup: DATABASE_SETUP_GUIDE.md');
console.log('   API docs: TASKS_API_DOCUMENTATION.md');
console.log('   Auth docs: AUTH_DOCUMENTATION.md');
console.log('   Socket.IO docs: SOCKET_IO_DOCUMENTATION.md');

console.log('\n🎯 Next Steps:');
console.log('   1. Install PostgreSQL (see DATABASE_SETUP_GUIDE.md)');
console.log('   2. Update .env with correct DATABASE_URL');
console.log('   3. Run: npm run db:init');
console.log('   4. Start server: npm run dev');
console.log('   5. Test: curl http://localhost:3001/api/db-test');

