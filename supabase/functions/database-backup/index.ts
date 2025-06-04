
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
import { validateRequest, checkRateLimit, getClientIP, createErrorResponse, createRateLimitResponse, commonSchemas } from '../_shared/validation.ts';
import { z } from 'https://esm.sh/zod@3.22.4';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Validation schemas
const backupRequestSchema = z.object({
  action: z.enum(['backup', 'restore']),
  userId: commonSchemas.userId,
  backupData: z.string().optional(), // For restore action
  options: z.object({
    includeData: z.boolean().default(true),
    includeSchema: z.boolean().default(true),
    compressionLevel: z.number().min(0).max(9).default(6)
  }).optional()
});

async function createBackup(userId: string, options: any = {}) {
  console.log(`🔄 Creating backup for user: ${userId}`);
  
  try {
    // Get user's data from multiple tables
    const tables = [
      'conversations', 
      'messages', 
      'documents', 
      'memories', 
      'cognitive_nodes',
      'llm_feedback'
    ];
    
    const backupData: Record<string, any[]> = {};
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.warn(`⚠️ Error backing up table ${table}:`, error);
        backupData[table] = [];
      } else {
        backupData[table] = data || [];
      }
    }
    
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      userId,
      tables: backupData,
      metadata: {
        totalRecords: Object.values(backupData).reduce((sum, records) => sum + records.length, 0),
        tables: Object.keys(backupData)
      }
    };
    
    // Store backup metadata
    const { data: backupRecord, error: backupError } = await supabase
      .from('backup_history')
      .insert({
        user_id: userId,
        backup_size: JSON.stringify(backup).length,
        table_count: tables.length,
        record_count: backup.metadata.totalRecords,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (backupError) {
      console.error('❌ Error storing backup metadata:', backupError);
    }
    
    console.log(`✅ Backup created successfully - ${backup.metadata.totalRecords} records`);
    
    return {
      success: true,
      backup: JSON.stringify(backup),
      metadata: backup.metadata,
      backupId: backupRecord?.id
    };
    
  } catch (error) {
    console.error('❌ Backup creation failed:', error);
    throw new Error(`Backup failed: ${error.message}`);
  }
}

async function restoreBackup(userId: string, backupDataString: string) {
  console.log(`🔄 Restoring backup for user: ${userId}`);
  
  try {
    const backupData = JSON.parse(backupDataString);
    
    if (!backupData.version || !backupData.tables) {
      throw new Error('Invalid backup format');
    }
    
    if (backupData.userId !== userId) {
      throw new Error('Backup does not belong to this user');
    }
    
    let restoredCount = 0;
    const results: Record<string, any> = {};
    
    // Restore data table by table
    for (const [tableName, records] of Object.entries(backupData.tables)) {
      if (!Array.isArray(records) || records.length === 0) {
        results[tableName] = { restored: 0, skipped: true };
        continue;
      }
      
      try {
        // Delete existing user data from this table
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.warn(`⚠️ Warning deleting from ${tableName}:`, deleteError);
        }
        
        // Insert backup data
        const { data, error } = await supabase
          .from(tableName)
          .insert(records as any[]);
        
        if (error) {
          console.error(`❌ Error restoring ${tableName}:`, error);
          results[tableName] = { restored: 0, error: error.message };
        } else {
          results[tableName] = { restored: records.length };
          restoredCount += records.length;
        }
        
      } catch (tableError) {
        console.error(`❌ Error processing table ${tableName}:`, tableError);
        results[tableName] = { restored: 0, error: tableError.message };
      }
    }
    
    // Log restore operation
    await supabase
      .from('restore_history')
      .insert({
        user_id: userId,
        records_restored: restoredCount,
        backup_version: backupData.version,
        backup_timestamp: backupData.timestamp,
        restored_at: new Date().toISOString()
      });
    
    console.log(`✅ Restore completed - ${restoredCount} records restored`);
    
    return {
      success: true,
      restoredCount,
      details: results,
      backupVersion: backupData.version,
      backupTimestamp: backupData.timestamp
    };
    
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw new Error(`Restore failed: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(clientIP, 10, 60000); // 10 requests per minute
    
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.remaining, corsHeaders);
    }

    // Validate request
    const body = await req.json();
    const validation = validateRequest(backupRequestSchema, body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error, 400, corsHeaders);
    }

    const { action, userId, backupData, options } = validation.data;

    console.log(`🔄 Processing ${action} request for user: ${userId}`);

    let result;
    
    if (action === 'backup') {
      result = await createBackup(userId, options);
    } else if (action === 'restore') {
      if (!backupData) {
        return createErrorResponse('Backup data is required for restore', 400, corsHeaders);
      }
      result = await restoreBackup(userId, backupData);
    } else {
      return createErrorResponse('Invalid action', 400, corsHeaders);
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Database backup/restore error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
