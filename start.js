#!/usr/bin/env node

/**
 * DocuShrink AI - Startup Script
 * Runs both frontend and backend concurrently
 */

import { spawn, exec } from 'child_process';
import { existsSync } from 'fs';
import { platform } from 'os';
import { join } from 'path';

const isWindows = platform() === 'win32';
const backendDir = join(process.cwd(), 'backend');
const venvPath = isWindows 
  ? join(backendDir, 'venv', 'Scripts', 'python.exe')
  : join(backendDir, 'venv', 'bin', 'python');

console.log('\n🚀 Starting DocuShrink AI...\n');

// Check if backend exists
const hasBackend = existsSync(join(backendDir, 'app.py'));

if (hasBackend && existsSync(venvPath)) {
  // Run both frontend and backend
  console.log('📦 Starting Frontend (Vite) on http://localhost:5173');
  console.log('🐍 Starting Backend (Flask) on http://localhost:5000\n');
  
  const frontend = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit', 
    shell: true 
  });
  
  const backend = spawn(venvPath, ['app.py'], { 
    cwd: backendDir, 
    stdio: 'inherit',
    shell: true
  });
  
  process.on('SIGINT', () => {
    frontend.kill();
    backend.kill();
    process.exit();
  });
} else {
  // Run frontend only (client-side processing)
  console.log('📦 Starting Frontend Only (Client-Side Processing)');
  console.log('💡 Tip: Set up backend for enhanced AI features\n');
  
  spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit', 
    shell: true 
  });
}
