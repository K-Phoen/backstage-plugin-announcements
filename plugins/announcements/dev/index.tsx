import React from 'react';
import { Content, Header, Page } from '@backstage/core-components';
import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { createDevApp } from '@backstage/dev-utils';
import {
  CatalogApi,
  catalogApiRef,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { Grid, Typography } from '@material-ui/core';
import {
  announcementsPlugin,
  AnnouncementsPage,
  AnnouncementsCard,
  NewAnnouncementBanner,
} from '../src/plugin';

const mockCatalogApi = {
  getEntityByRef: async (entityRef: string) => {
    if (entityRef === 'user:default/guest') {
      return {
        kind: 'User',
        metadata: {
          name: 'guest',
          namespace: 'default',
          description: 'Anonymous to the max',
        },
        spec: {},
      };
    }
    return undefined;
  },
};

const fakeCatalogPlugin = createPlugin({
  id: 'catalog',
  routes: {
    catalogEntity: entityRouteRef,
  },
  apis: [
    createApiFactory({
      api: catalogApiRef,
      deps: {},
      factory: () => {
        return mockCatalogApi as CatalogApi;
      },
    }),
  ],
});

export const CatalogEntityPage: () => JSX.Element = fakeCatalogPlugin.provide(
  createRoutableExtension({
    name: 'CatalogEntityPage',
    component: () =>
      import('./FakeCatalogEntityPage').then(m => m.FakeCatalogEntityPage),
    mountPoint: entityRouteRef,
  }),
);

createDevApp()
  .registerPlugin(fakeCatalogPlugin)
  .registerPlugin(announcementsPlugin)
  .addPage({
    element: <AnnouncementsPage />,
    title: 'Root Page',
    path: '/announcements',
  })
  .addPage({
    element: <CatalogEntityPage />,
    title: 'Catalog Entity Page',
    path: '/catalog',
  })
  .addPage({
    element: (
      <Page themeId="home">
        <Header title="AnnouncementsCard" />

        <Content>
          <Grid container>
            <Grid item xs={12} md={12}>
              <Typography variant="h4">Test homepage</Typography>
            </Grid>

            <Grid item md={12}>
              <NewAnnouncementBanner max={2} />
            </Grid>
            <Grid item md={6}>
              <AnnouncementsCard max={2} />
            </Grid>
          </Grid>
        </Content>
      </Page>
    ),
    title: 'AnnouncementsCard',
    path: '/announcements/card',
  })
  .render();
