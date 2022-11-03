import { createServiceBuilder, useHotMemoize } from '@backstage/backend-common';
import { Server } from 'http';
import Knex from 'knex';
import { Logger } from 'winston';
import { buildAnnouncementsContext } from './announcementsContextBuilder';
import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(options: ServerOptions): Promise<Server> {
  const logger = options.logger.child({ service: 'announcements-backend-backend' });
  logger.debug('Starting application server...');

  const database = useHotMemoize(module, () => {
    return Knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });
  });

  const announcementsContext = await buildAnnouncementsContext({
    logger: logger,
    database: { getClient: async () => database },
  });

  const router = await createRouter(announcementsContext);

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/api/announcements', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
