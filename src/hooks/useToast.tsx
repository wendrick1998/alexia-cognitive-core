
import { toast } from "sonner"

// Simple wrapper around sonner for consistent API
export const useToast = () => {
  return {
    toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
      if (options.variant === 'destructive') {
        toast.error(options.title, {
          description: options.description,
        })
      } else {
        toast.success(options.title, {
          description: options.description,
        })
      }
    }
  }
}

// Export individual toast functions for convenience
export const showSuccess = (title: string, description?: string) => 
  toast.success(title, { description })

export const showError = (title: string, description?: string) => 
  toast.error(title, { description })

export const showWarning = (title: string, description?: string) => 
  toast.warning(title, { description })

export const showInfo = (title: string, description?: string) => 
  toast.info(title, { description })
