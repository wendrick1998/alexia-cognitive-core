/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Stories para o componente NotificationBanner
 */

import type { Meta, StoryObj } from '@storybook/react';
import { NotificationBanner } from '../components/NotificationBanner';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

// Metadados do componente para o Storybook
const meta: Meta<typeof NotificationBanner> = {
  title: 'Components/NotificationBanner',
  component: NotificationBanner,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: { control: 'select', options: ['default', 'success', 'warning', 'error', 'info'] },
    icon: { control: 'object' },
    onClose: { action: 'closed' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationBanner>;

// Story para notificação padrão
export const Default: Story = {
  args: {
    title: 'Notificação',
    description: 'Esta é uma notificação padrão do sistema.',
    variant: 'default',
  },
};

// Story para notificação de sucesso
export const Success: Story = {
  args: {
    title: 'Operação concluída',
    description: 'Sua ação foi realizada com sucesso.',
    variant: 'success',
    icon: <CheckCircle className="h-5 w-5" />,
  },
};

// Story para notificação de aviso
export const Warning: Story = {
  args: {
    title: 'Atenção',
    description: 'Esta ação pode ter consequências inesperadas.',
    variant: 'warning',
    icon: <AlertCircle className="h-5 w-5" />,
  },
};

// Story para notificação de erro
export const Error: Story = {
  args: {
    title: 'Erro',
    description: 'Ocorreu um erro ao processar sua solicitação.',
    variant: 'error',
    icon: <XCircle className="h-5 w-5" />,
  },
};

// Story para notificação de informação
export const Info: Story = {
  args: {
    title: 'Informação',
    description: 'O sistema foi atualizado com novos recursos.',
    variant: 'info',
    icon: <Info className="h-5 w-5" />,
  },
};

// Story para notificação com texto longo
export const LongText: Story = {
  args: {
    title: 'Atualização do sistema',
    description: 'O sistema Alex iA foi atualizado com novos recursos de inteligência artificial. Agora você pode utilizar o sistema multi-LLM com roteamento inteligente entre diferentes modelos, cache semântico para respostas mais rápidas e feedback ativo para melhorar continuamente as respostas.',
    variant: 'info',
    icon: <Info className="h-5 w-5" />,
  },
};

// Story para modo escuro
export const DarkMode: Story = {
  args: {
    title: 'Modo escuro',
    description: 'Esta notificação está sendo exibida no modo escuro.',
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

// Story para visualização mobile
export const Mobile: Story = {
  args: {
    title: 'Visualização mobile',
    description: 'Esta notificação está sendo exibida em um dispositivo móvel.',
    variant: 'info',
    icon: <Info className="h-5 w-5" />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
