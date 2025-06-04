
import { lazy } from 'react';

// NOTA: Este arquivo foi arquivado. Os imports abaixo foram ajustados para refletir os caminhos corretos
// desde a pasta _archive, mas alguns componentes podem não existir mais.

// Lazy loading de todas as páginas principais - ajustando caminhos para _archive
export const Dashboard = lazy(() => import('../../components/dashboard/Dashboard'));
export const SemanticSearch = lazy(() => import('../../components/SemanticSearch'));
export const MemoryManager = lazy(() => import('../../components/MemoryManager'));
export const DocumentsManager = lazy(() => import('../../components/DocumentsManager'));
export const ProjectsManager = lazy(() => import('../../components/ProjectsManager'));
export const SettingsScreen = lazy(() => import('../../components/settings/SettingsScreen'));

// Páginas cognitivas pesadas - ajustando caminhos para _archive
export const CognitiveGraphPage = lazy(() => import('../../components/cognitive/CognitiveGraphPage'));
export const InsightsPage = lazy(() => import('../../components/cognitive/InsightsPage'));
export const CortexDashboard = lazy(() => import('../../components/cognitive/CortexDashboard'));

// Páginas de integração - ajustando caminhos para _archive
export const IntegrationsStatusPage = lazy(() => import('../../components/integrations/IntegrationsStatusPage'));
export const IntegrationsManagerPage = lazy(() => import('../../components/integrations/IntegrationsManagerPage'));
