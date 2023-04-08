import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, Header, Content } from '@backstage/core-components';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import {
  Announcement,
  announcementsApiRef,
  CreateAnnouncementRequest,
} from '../../api';
import { rootRouteRef } from '../../routes';
import { AnnouncementForm } from '../AnnouncementForm';

type CreateAnnouncementPageProps = {
  themeId: string;
  title: string;
  subtitle?: ReactNode;
};

export const CreateAnnouncementPage = (props: CreateAnnouncementPageProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const rootPage = useRouteRef(rootRouteRef);
  const alertApi = useApi(alertApiRef);
  const navigate = useNavigate();

  const onSubmit = async (request: CreateAnnouncementRequest) => {
    try {
      await announcementsApi.createAnnouncement(request);
      alertApi.post({ message: 'Announcement created.', severity: 'success' });

      navigate(rootPage());
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  return (
    <Page themeId={props.themeId}>
      <Header title={props.title} subtitle={props.subtitle} />

      <Content>
        <AnnouncementForm
          initialData={{} as Announcement}
          onSubmit={onSubmit}
        />
      </Content>
    </Page>
  );
};
