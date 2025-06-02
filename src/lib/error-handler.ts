
// Simple error handler implementation
export const errorHandler = {
  logSecurityEvent: async (event: any) => {
    console.log('Security event logged:', event);
  },
  
  handleUserError: (error: any, context: string): string => {
    console.error(`Error in ${context}:`, error);
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
};
