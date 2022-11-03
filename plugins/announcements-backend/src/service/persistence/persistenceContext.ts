import {
  PluginDatabaseManager,
  resolvePackagePath,
} from '@backstage/backend-common';
import { AnnouncementsDatabase } from './AnnouncementsDatabase';

const migrationsDir = resolvePackagePath(
  '@internal/plugin-announcements-backend',
  'migrations',
);

/**
 * A Container for persistence related components in Announcements
 *
 * @public
 */
export type PersistenceContext = {
  announcementsStore: AnnouncementsDatabase;
};

/**
 * A factory method to construct persistence context.
 *
 * @public
 */
export const initializePersistenceContext = async (database: PluginDatabaseManager): Promise<PersistenceContext> => {
  const client = await database.getClient();

  if (!database.migrations?.skip) {
    await client.migrate.latest({
      directory: migrationsDir,
    });
  }

  return {
    announcementsStore: new AnnouncementsDatabase(client),
  };
};
