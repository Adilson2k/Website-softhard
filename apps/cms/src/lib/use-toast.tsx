/**
 * Hook customizado para Toast Notifications
 * 
 * Padroniza as mensagens de notificação para:
 * - Criação de usuários
 * - Edição de usuários
 * - Deleção de usuários
 * - Erros gerais
 */

import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { log } from './logger-improved';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * Hook para gerenciar notificações de toast
 */
export function useToast() {
  const defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'top-right',
  };

  /**
   * Exibe toast customizado
   */
  const show = (message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const config = { ...defaultOptions, ...options };
    
    log.action('toast_shown', { message, type });

    return toast.custom(
      (t) => (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${
            type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : type === 'loading'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-slate-50 text-slate-800 border border-slate-200'
          }`}
        >
          {type === 'success' && <CheckCircle size={18} className="flex-shrink-0" />}
          {type === 'error' && <AlertCircle size={18} className="flex-shrink-0" />}
          {type === 'info' && <Info size={18} className="flex-shrink-0" />}
          {type === 'loading' && (
            <div className="animate-spin">
              <Info size={18} className="flex-shrink-0" />
            </div>
          )}
          <span className="flex-1">{message}</span>
        </div>
      ),
      {
        duration: type === 'loading' ? Infinity : config.duration,
        position: config.position as any,
      }
    );
  };

  return {
    show,
    /**
     * Sucesso genérico
     */
    success: (message: string, options?: ToastOptions) => {
      log.action('toast_success', { message });
      return show(message, 'success', options);
    },

    /**
     * Erro genérico
     */
    error: (message: string, options?: ToastOptions) => {
      log.action('toast_error', { message });
      return show(message, 'error', options);
    },

    /**
     * Informação genérica
     */
    info: (message: string, options?: ToastOptions) => {
      log.action('toast_info', { message });
      return show(message, 'info', options);
    },

    /**
     * Carregamento
     */
    loading: (message: string = 'Processando...', options?: ToastOptions) => {
      log.action('toast_loading', { message });
      return show(message, 'loading', options);
    },

    /**
     * Usuário criado com sucesso
     */
    userCreated: (userName: string, options?: ToastOptions) => {
      const message = `Usuário "${userName}" criado com sucesso!`;
      log.action('user_created', { userName });
      return show(message, 'success', options);
    },

    /**
     * Usuário atualizado com sucesso
     */
    userUpdated: (userName: string, options?: ToastOptions) => {
      const message = `Usuário "${userName}" atualizado com sucesso!`;
      log.action('user_updated', { userName });
      return show(message, 'success', options);
    },

    /**
     * Usuário deletado com sucesso
     */
    userDeleted: (userName: string, options?: ToastOptions) => {
      const message = `Usuário "${userName}" deletado com sucesso!`;
      log.action('user_deleted', { userName });
      return show(message, 'success', { ...options, position: 'top-right' });
    },

    /**
     * Erro ao criar usuário
     */
    userCreationFailed: (error: string, options?: ToastOptions) => {
      const message = `Erro ao criar usuário: ${error}`;
      log.action('user_creation_failed', { error });
      return show(message, 'error', options);
    },

    /**
     * Erro ao atualizar usuário
     */
    userUpdateFailed: (error: string, options?: ToastOptions) => {
      const message = `Erro ao atualizar usuário: ${error}`;
      log.action('user_update_failed', { error });
      return show(message, 'error', options);
    },

    /**
     * Erro ao deletar usuário
     */
    userDeleteFailed: (error: string, options?: ToastOptions) => {
      const message = `Erro ao deletar usuário: ${error}`;
      log.action('user_delete_failed', { error });
      return show(message, 'error', options);
    },

    /**
     * Validação falhou
     */
    validationFailed: (fieldName: string, options?: ToastOptions) => {
      const message = `Validação falhou: ${fieldName}`;
      log.action('validation_failed', { fieldName });
      return show(message, 'error', options);
    },

    /**
     * Dissolve um toast por ID
     */
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },
  };
}
