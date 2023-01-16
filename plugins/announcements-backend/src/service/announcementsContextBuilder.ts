import { Logger } from 'winston';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import {
  initializePersistenceContext,
  PersistenceContext,
} from './persistence/persistenceContext';

export type AnnouncementsContextOptions = {
  logger: Logger;
  database: PluginDatabaseManager;
  permissions: PermissionEvaluator;
};

export type AnnouncementsContext = {
  logger: Logger;
  persistenceContext: PersistenceContext;
  permissions: PermissionEvaluator;
};

export const buildAnnouncementsContext = async ({
  logger,
  database,
  permissions,
}: AnnouncementsContextOptions): Promise<AnnouncementsContext> => {
  return {
    logger: logger,
    persistenceContext: await initializePersistenceContext(database),
    permissions: permissions,
  };
};
