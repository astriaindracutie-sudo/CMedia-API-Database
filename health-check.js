#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔍 CMedia API Health Check');
console.log('==========================');

try {
  // Check if backend is running on port 3000
  const backendCheck = execSync('curl -s http://localhost:3000/').toString();
  console.log('✅ Backend (port 3000): Running');
  
  // Check CORS headers
  const corsCheck = execSync('curl -s -H "Origin: http://localhost:5173" -X OPTIONS http://localhost:3000/auth/staff -I').toString();
  if (corsCheck.includes('Access-Control-Allow-Origin: http://localhost:5173')) {
    console.log('✅ CORS: Properly configured for localhost:5173');
  } else {
    console.log('❌ CORS: Misconfigured');
  }
  
} catch (error) {
  console.log('❌ Backend (port 3000): Not responding');
}

try {
  // Check if frontend is running on port 5173
  const frontendCheck = execSync('curl -s http://localhost:5173/').toString();
  if (frontendCheck.includes('html') || frontendCheck.includes('<!DOCTYPE')) {
    console.log('✅ Frontend (port 5173): Running');
  } else {
    console.log('⚠️  Frontend (port 5173): Responding but may not be fully loaded');
  }
} catch (error) {
  console.log('❌ Frontend (port 5173): Not responding');
}

console.log('\n📋 To restart servers: npm run dev');
console.log('📋 To check this again: node health-check.js');
