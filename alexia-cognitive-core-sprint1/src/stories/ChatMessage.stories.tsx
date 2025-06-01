/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Stories para o componente ChatMessage
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from '../components/chat/ChatMessage';
import ResponseSource from '../components/ResponseSource';

// Metadados do componente para o Storybook
const meta: Meta<typeof ChatMessage> = {
  title: 'Components/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'object' },
    isLast: { control: 'boolean' },
    showFeedback: { control: 'boolean' },
    renderExtras: { control: 'function' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatMessage>;

// Mensagem de exemplo do usuário
const userMessage = {
  id: 'msg-1',
  conversation_id: 'conv-1',
  role: 'user',
  content: 'Qual artista chegou ao festival com uma Ferrari azul?',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mensagem de exemplo do assistente
const assistantMessage = {
  id: 'msg-2',
  conversation_id: 'conv-1',
  role: 'assistant',
  content: 'Gusttavo Lima chegou ao festival com uma Ferrari azul, conforme mencionado no Texto 3 dos documentos sobre o evento de música sertaneja em Blumenau.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  metadata: {
    fromCache: false,
    usedFallback: false,
    currentModel: 'gpt-4o-mini',
    responseTime: 1250,
  },
};

// Mensagem de exemplo do assistente (cache)
const cachedMessage = {
  id: 'msg-3',
  conversation_id: 'conv-1',
  role: 'assistant',
  content: 'Gusttavo Lima chegou ao festival com uma Ferrari azul, conforme mencionado no Texto 3 dos documentos sobre o evento de música sertaneja em Blumenau.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  metadata: {
    fromCache: true,
    usedFallback: false,
    currentModel: 'gpt-4o-mini',
    responseTime: 120,
  },
};

// Mensagem de exemplo do assistente (fallback)
const fallbackMessage = {
  id: 'msg-4',
  conversation_id: 'conv-1',
  role: 'assistant',
  content: 'Gusttavo Lima chegou ao festival com uma Ferrari azul, conforme mencionado no Texto 3 dos documentos sobre o evento de música sertaneja em Blumenau.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  metadata: {
    fromCache: false,
    usedFallback: true,
    originalModel: 'claude-3-opus',
    currentModel: 'gpt-4o-mini',
    responseTime: 1850,
  },
};

// Função para renderizar extras (ResponseSource)
const renderExtras = (message: any) => {
  if (message.role !== 'assistant' || !message.metadata) {
    return null;
  }
  
  return (
    <ResponseSource 
      fromCache={message.metadata.fromCache}
      usedFallback={message.metadata.usedFallback}
      originalModel={message.metadata.originalModel}
      currentModel={message.metadata.currentModel}
      responseTime={message.metadata.responseTime}
    />
  );
};

// Story para mensagem do usuário
export const UserMessage: Story = {
  args: {
    message: userMessage,
    isLast: false,
    showFeedback: false,
  },
};

// Story para mensagem do assistente
export const AssistantMessage: Story = {
  args: {
    message: assistantMessage,
    isLast: true,
    showFeedback: true,
    renderExtras,
  },
};

// Story para mensagem do cache
export const CachedMessage: Story = {
  args: {
    message: cachedMessage,
    isLast: true,
    showFeedback: true,
    renderExtras,
  },
};

// Story para mensagem com fallback
export const FallbackMessage: Story = {
  args: {
    message: fallbackMessage,
    isLast: true,
    showFeedback: true,
    renderExtras,
  },
};

// Story para modo escuro
export const DarkMode: Story = {
  args: {
    message: assistantMessage,
    isLast: true,
    showFeedback: true,
    renderExtras,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

// Story para visualização mobile
export const Mobile: Story = {
  args: {
    message: assistantMessage,
    isLast: true,
    showFeedback: true,
    renderExtras,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
