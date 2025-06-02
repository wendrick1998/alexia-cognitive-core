
import { lazy } from 'react';

// Lazy loading de todas as páginas principais
export const Dashboard = lazy(() => import('../components/dashboard/Dashboard'));
export const SemanticSearch = lazy(() => import('../components/SemanticSearch'));
export const MemoryManager = lazy(() => import('../components/MemoryManager'));
export const DocumentsManager = lazy(() => import('../components/DocumentsManager'));
export const ProjectsManager = lazy(() => import('../components/ProjectsManager'));
export const SettingsScreen = lazy(() => import('../components/settings/SettingsScreen'));

// Páginas cognitivas pesadas
export const CognitiveGraphPage = lazy(() => import('../components/cognitive/CognitiveGraphPage'));
export const InsightsPage = lazy(() => import('../components/cognitive/InsightsPage'));
export const CortexDashboard = lazy(() => import('../components/cognitive/CortexDashboard'));

// Páginas de integração
export const IntegrationsStatusPage = lazy(() => import('../components/integrations/IntegrationsStatusPage'));
export const IntegrationsManagerPage = lazy(() => import('../components/integrations/IntegrationsManagerPage'));
