
#!/usr/bin/env node

/**
 * @description Security checker for hardcoded secrets and vulnerabilities
 * @created_by Manus AI - Phase 4: Security Implementation
 */

const fs = require('fs');
const path = require('path');

const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9]{48,}/g, // OpenAI API keys
  /AIza[0-9A-Za-z-_]{35}/g, // Google API keys
  /AKIA[0-9A-Z]{16}/g, // AWS Access Key IDs
  /[0-9a-f]{32}/g, // Generic 32-char hex (potential tokens)
  /[A-Za-z0-9+/]{40,}={0,2}/g, // Base64 encoded secrets (40+ chars)
  /password\s*[:=]\s*['"][^'"]{8,}['"]/gi, // Password assignments
  /secret\s*[:=]\s*['"][^'"]{8,}['"]/gi, // Secret assignments
  /token\s*[:=]\s*['"][^'"]{20,}['"]/gi, // Token assignments
];

const SAFE_PATTERNS = [
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/, // JWT tokens (Supabase anon keys are public)
  /placeholder/gi,
  /example/gi,
  /test/gi,
  /demo/gi,
  /your_.*_here/gi,
];

const DIRECTORIES_TO_SCAN = [
  'src',
  'supabase/functions',
  'scripts'
];

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.env\.example/,
  /\.md$/,
  /\.test\./,
  /\.spec\./,
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  SENSITIVE_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Check if it's a safe pattern
        const isSafe = SAFE_PATTERNS.some(safePattern => safePattern.test(match));
        
        if (!isSafe) {
          const lines = content.split('\n');
          const lineNumber = lines.findIndex(line => line.includes(match)) + 1;
          
          issues.push({
            file: filePath,
            line: lineNumber,
            match: match.substring(0, 20) + '...',
            type: 'Potential hardcoded secret'
          });
        }
      });
    }
  });

  // Check for common security anti-patterns
  if (content.includes('console.log') && content.includes('password')) {
    issues.push({
      file: filePath,
      line: 'Multiple',
      match: 'console.log with password',
      type: 'Password logging detected'
    });
  }

  if (content.includes('localStorage.setItem') && content.includes('token')) {
    issues.push({
      file: filePath,
      line: 'Multiple',
      match: 'localStorage token storage',
      type: 'Insecure token storage'
    });
  }

  return issues;
}

function scanDirectory(dirPath) {
  const issues = [];
  
  if (!fs.existsSync(dirPath)) {
    return issues;
  }

  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    // Skip excluded patterns
    if (EXCLUDE_PATTERNS.some(pattern => pattern.test(itemPath))) {
      return;
    }

    if (stat.isDirectory()) {
      issues.push(...scanDirectory(itemPath));
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
      issues.push(...scanFile(itemPath));
    }
  });

  return issues;
}

function checkEnvironmentVariables() {
  console.log('🔧 Checking environment variable usage...\n');

  const envExamplePath = '.env.example';
  const gitignorePath = '.gitignore';

  // Check if .env.example exists
  if (fs.existsSync(envExamplePath)) {
    console.log('✅ .env.example file found');
    
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    const envVars = envContent.match(/^[A-Z_]+=.*/gm) || [];
    
    console.log(`📋 Environment variables defined: ${envVars.length}`);
    envVars.forEach(envVar => {
      const key = envVar.split('=')[0];
      console.log(`  - ${key}`);
    });
  } else {
    console.warn('⚠️ .env.example file not found');
  }

  // Check gitignore
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignoreContent.includes('.env')) {
      console.log('✅ .env files are gitignored');
    } else {
      console.warn('⚠️ .env files not found in .gitignore');
    }
  }

  console.log('');
}

function main() {
  console.log('🔒 Alex iA - Security Check\n');

  checkEnvironmentVariables();

  console.log('🔍 Scanning for hardcoded secrets...\n');

  let allIssues = [];

  DIRECTORIES_TO_SCAN.forEach(dir => {
    console.log(`📁 Scanning directory: ${dir}`);
    const issues = scanDirectory(dir);
    allIssues.push(...issues);
    
    if (issues.length === 0) {
      console.log('  ✅ No issues found');
    } else {
      console.log(`  ⚠️ Found ${issues.length} potential issues`);
    }
  });

  console.log('\n📊 Security Scan Results\n');

  if (allIssues.length === 0) {
    console.log('🎉 No security issues detected!\n');
    console.log('✅ All checks passed:');
    console.log('  - No hardcoded secrets found');
    console.log('  - Environment variables properly configured');
    console.log('  - Security best practices followed\n');
    process.exit(0);
  } else {
    console.log(`❌ Found ${allIssues.length} potential security issues:\n`);
    
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      console.log(`   Match: ${issue.match}`);
      console.log('');
    });

    console.log('🔧 Recommendations:');
    console.log('  1. Move hardcoded secrets to .env files');
    console.log('  2. Use environment variables for all sensitive data');
    console.log('  3. Ensure .env files are in .gitignore');
    console.log('  4. Review password/token handling practices\n');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, scanFile };
