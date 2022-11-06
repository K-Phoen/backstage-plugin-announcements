import { createApiFactory, createComponentExtension, createPlugin, createRoutableExtension, discoveryApiRef, errorApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { announcementsApiRef, DefaultAnnouncementsApi } from './api';
import { rootRouteRef } from './routes';

export const announcementsPlugin = createPlugin({
  id: 'announcements',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: announcementsApiRef,
      deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef, errorApi: errorApiRef },
      factory: ({ discoveryApi, identityApi, errorApi }) => {
        return new DefaultAnnouncementsApi({
          discoveryApi: discoveryApi,
          identityApi: identityApi,
          errorApi: errorApi,
        });
      },
    }),
  ]
});

export const AnnouncementsPage = announcementsPlugin.provide(
  createRoutableExtension({
    name: 'AnnouncementsPage',
    component: () =>
      import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

export const AnnouncementsCard = announcementsPlugin.provide(
  createComponentExtension({
    name: 'AnnouncementsCard',
    component: {
      lazy: () =>
        import('./components/AnnouncementsCard').then(m => m.AnnouncementsCard),
    },
  }),
);

export const NewAnnouncementBanner = announcementsPlugin.provide(
  createComponentExtension({
    name: 'NewAnnouncementBanner',
    component: {
      lazy: () =>
        import('./components/NewAnnouncementBanner').then(m => m.NewAnnouncementBanner),
    },
  }),
);
