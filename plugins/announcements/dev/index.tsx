import React from 'react';
import { Content, Header, Page } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { announcementsPlugin, AnnouncementsPage, AnnouncementsCard } from '../src/plugin';
import { Grid } from '@material-ui/core';

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
