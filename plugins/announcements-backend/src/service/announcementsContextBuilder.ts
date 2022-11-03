import { PluginDatabaseManager } from '@backstage/backend-common';
import { Logger } from 'winston';
import { initializePersistenceContext, PersistenceContext } from './persistence/persistenceContext';

export type AnnouncementsContextOptions = {
  logger: Logger;
  database: PluginDatabaseManager;
};

export type AnnouncementsContext = {
  logger: Logger;
  persistenceContext: PersistenceContext;
};

export const buildAnnouncementsContext = async ({ logger, database }: AnnouncementsContextOptions): Promise<AnnouncementsContext> => {
  return {
    logger: logger,
    persistenceContext: await initializePersistenceContext(database),
  };
};
