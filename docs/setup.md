# Setup

## Backend

Add the plugin to your backend app:

```bash
cd packages/backend && yarn add @kurtaking/backstage-plugin-announcements-backend
```

Create a file in `packages/backend/src/plugins/announcements.ts`:

```ts
import {
  buildAnnouncementsContext,
  createRouter,
} from '@kurtaking/backstage-plugin-announcements-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  database,
  permissions,
}: PluginEnvironment): Promise<Router> {
  const announcementsContext = await buildAnnouncementsContext({
    logger: logger,
    database: database,
    permissions: permissions,
  });

  return await createRouter(announcementsContext);
}
```

In `packages/backend/src/index.ts` add the following:

```ts
import announcements from './plugins/announcements';

// ...
async function main() {
  // ...
  const announcementsEnv = useHotMemoize(module, () =>
    createEnv('announcements'),
  );

  const apiRouter = Router();
  apiRouter.use('/announcements', await announcements(announcementsEnv));
  // ...
}
```

## Frontend

Add the plugin to your frontend app:

```bash
cd packages/app && yarn add @kurtaking/backstage-plugin-announcements
```

Expose the announcements page:

```ts
// packages/app/src/App.tsx
import { AnnouncementsPage } from '@kurtaking/backstage-plugin-announcements';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/announcements" element={<AnnouncementsPage />} />
    // ...
  </FlatRoutes>
);
```

An interface to create/update/edit/delete announcements is now available at `/announcements`.
