import React from 'react';
import { Routes, Route } from 'react-router';
import { announcementCreateRouteRef, announcementEditRouteRef, announcementViewRouteRef } from '../routes';
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
        element={<CreateAnnouncementPage />}
      />
      <Route
        path={`${announcementEditRouteRef.path}`}
        element={<EditAnnouncementPage />}
      />
    </Routes>
  );
};
