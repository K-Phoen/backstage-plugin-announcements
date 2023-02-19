import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

type RouterProps = {
  title?: string;
  subtitle?: string;
};

export const Router = (props: RouterProps) => {
  return (
    <Routes>
      <Route path="/" element={<AnnouncementsPage {...props} />} />
      <Route
        path={`${announcementViewRouteRef.path}`}
        element={<AnnouncementPage {...props} />}
      />
      <Route
        path={`${announcementCreateRouteRef.path}`}
        element={
          <RequirePermission permission={announcementCreatePermission}>
            <CreateAnnouncementPage {...props} />
          </RequirePermission>
        }
      />
      <Route
        path={`${announcementEditRouteRef.path}`}
        element={
          <RequirePermission permission={announcementUpdatePermission}>
            <EditAnnouncementPage {...props} />
          </RequirePermission>
        }
      />
    </Routes>
  );
};
