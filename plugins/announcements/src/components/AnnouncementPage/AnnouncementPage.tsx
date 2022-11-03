import React from 'react';
import { Progress, Page, Header, Content, MarkdownContent, InfoCard } from '@backstage/core-components';
import { useApi, useRouteRef, useRouteRefParams } from '@backstage/core-plugin-api';
import Alert from '@material-ui/lab/Alert';
import { DateTime } from 'luxon';
import useAsync from 'react-use/lib/useAsync';
import { Announcement, announcementsApiRef } from '../../api';
import { announcementViewRouteRef, rootRouteRef } from '../../routes';

const AnnouncementDetails = ({ announcement }: { announcement: Announcement }) => {
  const announcementsLink = useRouteRef(rootRouteRef);
  const deepLink = {
    link: announcementsLink(),
    title: 'Back to announcements',
  };

  return (
    <InfoCard
      title={announcement.title}
      subheader={DateTime.fromISO(announcement.created_at).toRelative()}
      deepLink={deepLink}
    >
      <MarkdownContent content={announcement.body} />
    </InfoCard>
  );
};

export const AnnouncementPage = () => {
  const announcementsApi = useApi(announcementsApiRef);
  const { id } = useRouteRefParams(announcementViewRouteRef);
  const { value, loading, error } = useAsync(async () => announcementsApi.announcementByID(id));

  let title = "Announcements";
  let content: React.ReactNode = <Progress />;

  if (loading) {
    content = <Progress />;
  } else if (error) {
    content = <Alert severity="error">{error.message}</Alert>;
  } else {
    title = `${value!.title} – Announcements`
    content = <AnnouncementDetails announcement={value!} />;

    const lastSeen = announcementsApi.lastSeenDate();
    const announcementCreatedAt = DateTime.fromISO(value!.created_at);

    if (announcementCreatedAt > lastSeen) {
      announcementsApi.markLastSeenDate(announcementCreatedAt);
    }
  }

  return (
    <Page themeId="home">
      <Header title={title} />

      <Content>
        {content}
      </Content>
    </Page>
  );
};
