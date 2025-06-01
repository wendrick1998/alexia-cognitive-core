/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Stories para o componente ResponseSource
 */

import type { Meta, StoryObj } from '@storybook/react';
import ResponseSource from '../components/ResponseSource';

// Metadados do componente para o Storybook
const meta: Meta<typeof ResponseSource> = {
  title: 'Components/ResponseSource',
  component: ResponseSource,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fromCache: { control: 'boolean' },
    usedFallback: { control: 'boolean' },
    originalModel: { control: 'text' },
    currentModel: { control: 'text' },
    responseTime: { control: 'number' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ResponseSource>;

// Story para resposta do cache
export const FromCache: Story = {
  args: {
    fromCache: true,
    usedFallback: false,
    currentModel: 'gpt-4o-mini',
    responseTime: 120,
  },
};

// Story para fallback entre modelos
export const Fallback: Story = {
  args: {
    fromCache: false,
    usedFallback: true,
    originalModel: 'claude-3-opus',
    currentModel: 'gpt-4o-mini',
    responseTime: 1850,
  },
};

// Story para resposta rápida
export const FastResponse: Story = {
  args: {
    fromCache: false,
    usedFallback: false,
    currentModel: 'gpt-4o-mini',
    responseTime: 350,
  },
};

// Story para múltiplos indicadores
export const MultipleIndicators: Story = {
  args: {
    fromCache: true,
    usedFallback: true,
    originalModel: 'claude-3-opus',
    currentModel: 'gpt-4o-mini',
    responseTime: 120,
  },
};

// Story para modo escuro
export const DarkMode: Story = {
  args: {
    fromCache: true,
    usedFallback: false,
    currentModel: 'gpt-4o-mini',
    responseTime: 120,
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
    fromCache: true,
    usedFallback: true,
    originalModel: 'claude-3-opus',
    currentModel: 'gpt-4o-mini',
    responseTime: 120,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
