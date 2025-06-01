/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Stories para o componente FeedbackSystem
 */

import type { Meta, StoryObj } from '@storybook/react';
import FeedbackSystem from '../components/FeedbackSystem';

// Metadados do componente para o Storybook
const meta: Meta<typeof FeedbackSystem> = {
  title: 'Components/FeedbackSystem',
  component: FeedbackSystem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    context: { control: 'object' },
    onFeedbackSubmitted: { action: 'feedback submitted' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof FeedbackSystem>;

// Contexto de exemplo para as stories
const sampleContext = {
  question: "Qual artista chegou ao festival com uma Ferrari azul?",
  answer: "Gusttavo Lima chegou ao festival com uma Ferrari azul, conforme mencionado no Texto 3 dos documentos sobre o evento de música sertaneja em Blumenau.",
  modelName: "gpt-4o-mini",
  provider: "OpenAI",
  usedFallback: false,
  responseTime: 1250,
  tokensUsed: 320,
  timestamp: new Date(),
  sessionId: "session-123",
  userId: "user-456"
};

// Story padrão - visualização normal
export const Default: Story = {
  args: {
    context: sampleContext,
    className: '',
  },
};

// Story para visualização mobile
export const Mobile: Story = {
  args: {
    context: sampleContext,
    className: '',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Story para feedback já enviado
export const FeedbackSubmitted: Story = {
  args: {
    context: sampleContext,
    className: '',
  },
  play: async ({ canvasElement, args }) => {
    // Simular que o feedback já foi enviado
    if (args.onFeedbackSubmitted) {
      args.onFeedbackSubmitted('positive', 5);
    }
  },
};

// Story para feedback com animação de sucesso
export const FeedbackSuccess: Story = {
  args: {
    context: sampleContext,
    className: 'feedback-success',
  },
};

// Story para modo escuro
export const DarkMode: Story = {
  args: {
    context: sampleContext,
    className: '',
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
