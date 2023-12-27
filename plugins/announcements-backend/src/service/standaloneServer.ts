import { Server } from 'http';
import { Logger } from 'winston';
import {
  createServiceBuilder,
  ServerTokenManager,
  loadBackendConfig,
  HostDiscovery,
  DatabaseManager,
} from '@backstage/backend-common';
import { buildAnnouncementsContext } from './announcementsContextBuilder';
import { createRouter } from './router';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';
import { ConfigReader } from '@backstage/config';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({
    service: 'announcements-backend-backend',
  });
  const config = await loadBackendConfig({ logger, argv: process.argv });
  const discovery = HostDiscovery.fromConfig(config);
  const tokenManager = ServerTokenManager.fromConfig(config, { logger });
  const permissions = ServerPermissionClient.fromConfig(config, {
    discovery,
    tokenManager,
  });

  logger.debug('Starting application server...');

  const manager = DatabaseManager.fromConfig(
    new ConfigReader({
      backend: {
        database: { client: 'better-sqlite3', connection: ':memory:' },
      },
    }),
  );
  const database = manager.forPlugin('announcements');

  const announcementsContext = await buildAnnouncementsContext({
    logger: logger,
    database: database,
    permissions,
  });

  const router = await createRouter(announcementsContext);

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/api/announcements', router)
    .addRouter('/api/permission', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
