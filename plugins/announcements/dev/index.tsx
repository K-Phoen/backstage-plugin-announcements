import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { announcementsPlugin, AnnouncementsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(announcementsPlugin)
  .addPage({
    element: <AnnouncementsPage />,
    title: 'Root Page',
    path: '/announcements'
  })
  .render();
