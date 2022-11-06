import React from 'react';
import { Content, Header, Page } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { Grid, Typography } from '@material-ui/core';
import {
  announcementsPlugin,
  AnnouncementsPage,
  AnnouncementsCard,
  NewAnnouncementBanner,
} from '../src/plugin';

createDevApp()
  .registerPlugin(announcementsPlugin)
  .addPage({
    element: <AnnouncementsPage />,
    title: 'Root Page',
    path: '/announcements'
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
              <NewAnnouncementBanner />
            </Grid>
            <Grid item md={6}>
              <AnnouncementsCard max={2} />
            </Grid>
          </Grid>
        </Content>
      </Page>
    ),
    title: 'AnnouncementsCard',
    path: '/announcements/card'
  })
  .render();
