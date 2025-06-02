
/**
 * @description Secure Supabase client with proper error handling
 * @created_by Security Audit - Alex iA
 */

import { supabase } from '@/integrations/supabase/client';
import { secureConfig } from '@/config/secure-environment';
import { errorHandler } from '@/lib/error-handler';

// Secure wrapper for Supabase operations
export class SecureSupabaseClient {
  private static instance: SecureSupabaseClient;
  
  private constructor() {}
  
  public static getInstance(): SecureSupabaseClient {
    if (!SecureSupabaseClient.instance) {
      SecureSupabaseClient.instance = new SecureSupabaseClient();
    }
    return SecureSupabaseClient.instance;
  }
  
  // Secure select with user validation
  async secureSelect<T>(
    table: string,
    userId: string,
    columns = '*',
    filters: Record<string, any> = {}
  ): Promise<{ data: T[] | null; error: string | null }> {
    try {
      // Use any to bypass TypeScript checking for dynamic table names
      let query = (supabase as any)
        .from(table)
        .select(columns)
        .eq('user_id', userId);
      
      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query;
      
      if (error) {
        await errorHandler.logSecurityEvent({
          userId,
          action: 'database_error',
          resource: table,
          severity: 'medium',
          details: { operation: 'select', error: error.message }
        });
        
        return { data: null, error: errorHandler.handleUserError(error, `select_${table}`) };
      }
      
      return { data, error: null };
    } catch (err) {
      await errorHandler.logSecurityEvent({
        userId,
        action: 'database_exception',
        resource: table,
        severity: 'high',
        details: { operation: 'select', error: err }
      });
      
      return { 
        data: null, 
        error: errorHandler.handleUserError(err, `select_${table}`) 
      };
    }
  }
  
  // Secure insert with validation
  async secureInsert<T extends Record<string, any>>(
    table: string,
    data: T & { user_id: string },
    userId: string
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      // Ensure user_id matches authenticated user
      if (data.user_id !== userId) {
        await errorHandler.logSecurityEvent({
          userId,
          action: 'authorization_violation',
          resource: table,
          severity: 'critical',
          details: { operation: 'insert', attempted_user_id: data.user_id }
        });
        
        return { data: null, error: 'Acesso não autorizado' };
      }
      
      // Use any to bypass TypeScript checking for dynamic table names
      const { data: result, error } = await (supabase as any)
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        await errorHandler.logSecurityEvent({
          userId,
          action: 'database_error',
          resource: table,
          severity: 'medium',
          details: { operation: 'insert', error: error.message }
        });
        
        return { data: null, error: errorHandler.handleUserError(error, `insert_${table}`) };
      }
      
      return { data: result, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: errorHandler.handleUserError(err, `insert_${table}`) 
      };
    }
  }
  
  // Secure update with ownership validation
  async secureUpdate<T extends Record<string, any>>(
    table: string,
    id: string,
    updates: Partial<T>,
    userId: string
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      // Use any to bypass TypeScript checking for dynamic table names
      const { data: result, error } = await (supabase as any)
        .from(table)
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        await errorHandler.logSecurityEvent({
          userId,
          action: 'database_error',
          resource: table,
          severity: 'medium',
          details: { operation: 'update', error: error.message, record_id: id }
        });
        
        return { data: null, error: errorHandler.handleUserError(error, `update_${table}`) };
      }
      
      return { data: result, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: errorHandler.handleUserError(err, `update_${table}`) 
      };
    }
  }
}

export const secureSupabaseClient = SecureSupabaseClient.getInstance();
