import React from 'react';
import { Page, Header, Content } from '@backstage/core-components';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef, CreateAnnouncementRequest } from '../../api';
import { AnnouncementForm } from '../AnnouncementForm';

export const CreateAnnouncementPage = () => {
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);

  const onSubmit = async (request: CreateAnnouncementRequest) => {
    try {
      await announcementsApi.createAnnouncement(request);
      alertApi.post({message: 'Announcement created.', severity: 'success'});
    } catch (err) {
      alertApi.post({message: (err as Error).message, severity: 'error'});
    }
  };

  return (
    <Page themeId="home">
      <Header title="New announcement" />

      <Content>
        <AnnouncementForm initialData={{} as CreateAnnouncementRequest} onSubmit={onSubmit} />
      </Content>
    </Page>
  );
};
