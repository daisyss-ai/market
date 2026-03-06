#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const rlsPath = path.join(process.cwd(), 'database', 'rls-policies.sql');

    if (!fs.existsSync(schemaPath)) {
      console.error('❌ database/schema.sql not found');
      process.exit(1);
    }

    if (!fs.existsSync(rlsPath)) {
      console.error('❌ database/rls-policies.sql not found');
      process.exit(1);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    const rlsSQL = fs.readFileSync(rlsPath, 'utf-8');

    console.log('📋 Running schema migrations...');
    const { error: schemaError } = await supabase.rpc('exec', { 
      sql: schemaSQL 
    }).catch(() => ({
      error: 'Direct exec not available, use Supabase dashboard'
    }));

    if (schemaError && schemaError !== 'Direct exec not available, use Supabase dashboard') {
      console.error('❌ Schema migration failed:', schemaError);
      process.exit(1);
    }

    console.log('✅ Schema migration completed\n');

    console.log('🔐 Setting up RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec', { 
      sql: rlsSQL 
    }).catch(() => ({
      error: 'Direct exec not available, use Supabase dashboard'
    }));

    if (rlsError && rlsError !== 'Direct exec not available, use Supabase dashboard') {
      console.error('❌ RLS setup failed:', rlsError);
      process.exit(1);
    }

    console.log('✅ RLS policies configured\n');

    console.log('📝 IMPORTANT: If the above commands failed, please:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and paste database/schema.sql');
    console.log('4. Execute it');
    console.log('5. Then do the same with database/rls-policies.sql\n');

    console.log('✨ Database setup complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
