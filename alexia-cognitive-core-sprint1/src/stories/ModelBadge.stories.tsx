/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Stories para o componente ModelBadge
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ModelBadge } from '../components/ModelBadge';

// Metadados do componente para o Storybook
const meta: Meta<typeof ModelBadge> = {
  title: 'Components/ModelBadge',
  component: ModelBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    model: { control: 'text' },
    provider: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'outline', 'subtle'] },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ModelBadge>;

// Story para modelo GPT-4o
export const GPT4o: Story = {
  args: {
    model: 'gpt-4o-mini',
    provider: 'OpenAI',
    size: 'md',
    variant: 'default',
  },
};

// Story para modelo Claude
export const Claude: Story = {
  args: {
    model: 'claude-3-opus',
    provider: 'Anthropic',
    size: 'md',
    variant: 'default',
  },
};

// Story para modelo DeepSeek
export const DeepSeek: Story = {
  args: {
    model: 'deepseek-coder',
    provider: 'DeepSeek',
    size: 'md',
    variant: 'default',
  },
};

// Story para modelo Groq
export const Groq: Story = {
  args: {
    model: 'llama-3-70b',
    provider: 'Groq',
    size: 'md',
    variant: 'default',
  },
};

// Story para tamanho pequeno
export const SmallSize: Story = {
  args: {
    model: 'gpt-4o-mini',
    provider: 'OpenAI',
    size: 'sm',
    variant: 'default',
  },
};

// Story para tamanho grande
export const LargeSize: Story = {
  args: {
    model: 'gpt-4o-mini',
    provider: 'OpenAI',
    size: 'lg',
    variant: 'default',
  },
};

// Story para variante outline
export const OutlineVariant: Story = {
  args: {
    model: 'gpt-4o-mini',
    provider: 'OpenAI',
    size: 'md',
    variant: 'outline',
  },
};

// Story para variante subtle
export const SubtleVariant: Story = {
  args: {
    model: 'gpt-4o-mini',
    provider: 'OpenAI',
    size: 'md',
    variant: 'subtle',
  },
};

// Story para modo escuro
export const DarkMode: Story = {
  args: {
    model: 'gpt-4o-mini',
    provider: 'OpenAI',
    size: 'md',
    variant: 'default',
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
