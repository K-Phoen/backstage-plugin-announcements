import React from 'react';
import { useAsync } from 'react-use';
import { Page, Header, Content, Progress } from '@backstage/core-components';
import {
  alertApiRef,
  useApi,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { Alert } from '@material-ui/lab';
import { AnnouncementForm } from '../AnnouncementForm';
import { announcementEditRouteRef } from '../../routes';
import { announcementsApiRef, CreateAnnouncementRequest } from '../../api';

export const EditAnnouncementPage = () => {
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { id } = useRouteRefParams(announcementEditRouteRef);
  const { value, loading, error } = useAsync(async () =>
    announcementsApi.announcementByID(id),
  );

  let title = 'Edit announcement';
  let content: React.ReactNode = <Progress />;

  const onSubmit = async (request: CreateAnnouncementRequest) => {
    try {
      await announcementsApi.updateAnnouncement(id, request);
      alertApi.post({ message: 'Announcement updated.', severity: 'success' });
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  if (loading) {
    content = <Progress />;
  } else if (error) {
    content = <Alert severity="error">{error.message}</Alert>;
  } else {
    title = `Edit "${value!.title}"`;
    content = <AnnouncementForm initialData={value!} onSubmit={onSubmit} />;
  }

  return (
    <Page themeId="home">
      <Header title={title} />

      <Content>{content}</Content>
    </Page>
  );
};
