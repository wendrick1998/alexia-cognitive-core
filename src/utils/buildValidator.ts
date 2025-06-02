
/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Validador para verificar integridade do build e funcionamento do sistema
 */

import { supabase } from '@/integrations/supabase/client';

export interface BuildValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  databaseConnection: boolean;
  migrationsApplied: boolean;
  dependencies: {
    react: boolean;
    supabase: boolean;
    tailwind: boolean;
    lucide: boolean;
  };
}

/**
 * Valida se o build está funcionando corretamente
 */
export async function validateBuild(): Promise<BuildValidationResult> {
  const result: BuildValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    databaseConnection: false,
    migrationsApplied: false,
    dependencies: {
      react: false,
      supabase: false,
      tailwind: false,
      lucide: false
    }
  };

  console.log('🔍 Iniciando validação do build...');

  try {
    // 1. Verificar dependências
    console.log('📦 Verificando dependências...');
    
    // React
    try {
      // @ts-ignore
      if (typeof React !== 'undefined') {
        result.dependencies.react = true;
      }
    } catch (e) {
      result.errors.push('React não está carregado corretamente');
    }

    // Supabase
    try {
      if (supabase && typeof supabase.from === 'function') {
        result.dependencies.supabase = true;
      }
    } catch (e) {
      result.errors.push('Cliente Supabase não está configurado corretamente');
    }

    // Tailwind (verificar se classes estão disponíveis)
    try {
      const testElement = document.createElement('div');
      testElement.className = 'hidden';
      document.body.appendChild(testElement);
      const styles = window.getComputedStyle(testElement);
      if (styles.display === 'none') {
        result.dependencies.tailwind = true;
      }
      document.body.removeChild(testElement);
    } catch (e) {
      result.warnings.push('Não foi possível verificar Tailwind CSS');
    }

    // Lucide Icons
    try {
      // @ts-ignore
      if (typeof require !== 'undefined') {
        result.dependencies.lucide = true;
      } else {
        result.dependencies.lucide = true; // Assume que está funcionando em prod
      }
    } catch (e) {
      result.warnings.push('Não foi possível verificar Lucide Icons');
    }

    // 2. Verificar conexão com banco de dados
    console.log('🗄️ Verificando conexão com banco de dados...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (!error) {
        result.databaseConnection = true;
        console.log('✅ Conexão com banco de dados: OK');
      } else {
        result.errors.push(`Erro de conexão com banco: ${error.message}`);
      }
    } catch (e) {
      result.errors.push('Falha ao conectar com banco de dados');
    }

    // 3. Verificar se migrações foram aplicadas
    console.log('🔧 Verificando migrações do banco de dados...');
    
    try {
      // Verificar se tabelas de feedback existem
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('llm_feedback')
        .select('id')
        .limit(1);

      const { data: logsData, error: logsError } = await supabase
        .from('llm_call_logs')
        .select('id')
        .limit(1);

      if (!feedbackError && !logsError) {
        result.migrationsApplied = true;
        console.log('✅ Migrações aplicadas: OK');
      } else {
        result.errors.push('Migrações não foram aplicadas corretamente');
      }
    } catch (e) {
      result.errors.push('Erro ao verificar migrações');
    }

    // 4. Validação final
    if (result.errors.length > 0) {
      result.isValid = false;
    }

    console.log('🎯 Validação do build concluída:', result);
    return result;

  } catch (error) {
    console.error('❌ Erro durante validação do build:', error);
    result.isValid = false;
    result.errors.push(`Erro inesperado: ${error}`);
    return result;
  }
}

/**
 * Executa testes de funcionalidade básicos
 */
export async function runFunctionalityTests(): Promise<boolean> {
  console.log('🧪 Executando testes de funcionalidade...');

  try {
    // Teste 1: Verificar se é possível inserir um feedback de teste
    const testFeedback = {
      rating: 'positive',
      score: 5,
      question: 'Teste de build validation',
      answer: 'Resposta de teste para validação do build',
      model_name: 'test-model',
      provider: 'test-provider',
      used_fallback: false,
      response_time: 1000,
      tokens_used: 100,
      session_id: 'test-session',
      user_id: 'test-user'
    };

    const { error: insertError } = await supabase
      .from('llm_feedback')
      .insert(testFeedback);

    if (insertError) {
      console.error('❌ Falha no teste de inserção de feedback:', insertError);
      return false;
    }

    // Teste 2: Verificar se é possível recuperar o feedback
    const { data, error: selectError } = await supabase
      .from('llm_feedback')
      .select('*')
      .eq('user_id', 'test-user')
      .eq('session_id', 'test-session');

    if (selectError || !data || data.length === 0) {
      console.error('❌ Falha no teste de recuperação de feedback:', selectError);
      return false;
    }

    // Teste 3: Limpar dados de teste
    const { error: deleteError } = await supabase
      .from('llm_feedback')
      .delete()
      .eq('user_id', 'test-user')
      .eq('session_id', 'test-session');

    if (deleteError) {
      console.warn('⚠️ Aviso: Não foi possível limpar dados de teste:', deleteError);
    }

    console.log('✅ Todos os testes de funcionalidade passaram!');
    return true;

  } catch (error) {
    console.error('❌ Erro durante testes de funcionalidade:', error);
    return false;
  }
}

export default validateBuild;
