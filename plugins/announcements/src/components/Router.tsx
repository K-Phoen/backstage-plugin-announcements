import React from 'react';
import { Routes, Route } from 'react-router';
import { RequirePermission } from '@backstage/plugin-permission-react';
import {
  announcementCreatePermission,
  announcementUpdatePermission,
} from '@k-phoen/backstage-plugin-announcements-common';
import {
  announcementCreateRouteRef,
  announcementEditRouteRef,
  announcementViewRouteRef,
} from '../routes';
import { AnnouncementsPage } from './AnnouncementsPage';
import { AnnouncementPage } from './AnnouncementPage';
import { CreateAnnouncementPage } from './CreateAnnouncementPage';
import { EditAnnouncementPage } from './EditAnnouncementPage';

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<AnnouncementsPage />} />
      <Route
        path={`${announcementViewRouteRef.path}`}
        element={<AnnouncementPage />}
      />
      <Route
        path={`${announcementCreateRouteRef.path}`}
        element={
          <RequirePermission permission={announcementCreatePermission}>
            <CreateAnnouncementPage />
          </RequirePermission>
        }
      />
      <Route
        path={`${announcementEditRouteRef.path}`}
        element={
          <RequirePermission permission={announcementUpdatePermission}>
            <EditAnnouncementPage />
          </RequirePermission>
        }
      />
    </Routes>
  );
};
