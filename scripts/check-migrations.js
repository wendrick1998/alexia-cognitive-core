
#!/usr/bin/env node

/**
 * @description Migration consistency checker for Supabase
 * @created_by Manus AI - Phase 4: Security Implementation
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');
const REQUIRED_TABLES = [
  'conversations',
  'messages',
  'memories',
  'documents',
  'llm_feedback',
  'llm_call_logs',
  'llm_response_cache'
];

function checkMigrationsExist() {
  console.log('🔍 Checking Supabase migrations...\n');

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Migrations directory not found:', MIGRATIONS_DIR);
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.warn('⚠️ No migration files found!');
    return false;
  }

  console.log('📁 Found migration files:');
  migrationFiles.forEach(file => {
    console.log(`  ✓ ${file}`);
  });

  return true;
}

function checkTableDefinitions() {
  console.log('\n🗄️ Checking table definitions...\n');

  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'));

  const allMigrationContent = migrationFiles
    .map(file => fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'))
    .join('\n');

  let allTablesFound = true;

  REQUIRED_TABLES.forEach(table => {
    const hasCreateTable = allMigrationContent.includes(`CREATE TABLE`) && 
                          allMigrationContent.includes(table);
    const hasRLS = allMigrationContent.includes(`ALTER TABLE`) && 
                   allMigrationContent.includes(`${table}`) &&
                   allMigrationContent.includes(`ENABLE ROW LEVEL SECURITY`);

    if (hasCreateTable) {
      console.log(`  ✓ Table '${table}' definition found`);
      if (hasRLS) {
        console.log(`  ✓ RLS enabled for '${table}'`);
      } else {
        console.warn(`  ⚠️ RLS not found for '${table}'`);
      }
    } else {
      console.error(`  ❌ Table '${table}' definition missing`);
      allTablesFound = false;
    }
  });

  return allTablesFound;
}

function generateMigrationSummary() {
  console.log('\n📋 Migration Summary\n');
  
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  migrationFiles.forEach(file => {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const tables = content.match(/CREATE TABLE (?:public\.)?(\w+)/g) || [];
    const functions = content.match(/CREATE (?:OR REPLACE )?FUNCTION (\w+)/g) || [];
    
    console.log(`📄 ${file}:`);
    if (tables.length > 0) {
      console.log(`   Tables: ${tables.map(t => t.replace(/CREATE TABLE (?:public\.)?/, '')).join(', ')}`);
    }
    if (functions.length > 0) {
      console.log(`   Functions: ${functions.map(f => f.replace(/CREATE (?:OR REPLACE )?FUNCTION /, '')).join(', ')}`);
    }
    console.log('');
  });
}

function main() {
  console.log('🚀 Alex iA - Migration Checker\n');
  
  try {
    const migrationsExist = checkMigrationsExist();
    const tablesValid = checkTableDefinitions();
    
    if (migrationsExist) {
      generateMigrationSummary();
    }

    if (migrationsExist && tablesValid) {
      console.log('✅ All migrations are consistent and complete!\n');
      process.exit(0);
    } else {
      console.log('❌ Migration check failed. Please review the issues above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error checking migrations:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkMigrationsExist, checkTableDefinitions };
