import React, { useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { Page, Header, Content, Link, ItemCardGrid, Progress, Button, ItemCardHeader, ContentHeader } from '@backstage/core-components';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import Alert from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Announcement, announcementsApiRef } from '../../api';
import { announcementCreateRouteRef, announcementEditRouteRef, announcementViewRouteRef } from '../../routes';
import { Card, CardActions, CardContent, CardMedia, makeStyles } from '@material-ui/core';
import { DateTime } from 'luxon';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    color: theme.palette.text.primary,
  },
}));

const AnnouncementCard = ({ announcement, onChange }: { announcement: Announcement, onChange?: () => void }) => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const editAnnouncementLink = useRouteRef(announcementEditRouteRef);
  const [deleting, setDeleting] = useState(false);

  const title = <Link className={classes.cardHeader} to={viewAnnouncementLink({ id: announcement.id })}>{announcement.title}</Link>;
  const subTitle = (
    <>
      By {announcement.publisher}, {DateTime.fromISO(announcement.created_at).toRelative()}
    </>
  );

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await announcementsApi.deleteAnnouncementByID(announcement.id);

      alertApi.post({ message: 'Announcement deleted.', severity: 'success' });
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }

    if (onChange) {
      onChange();
    }
  };

  if (deleting) {
    return <Progress />;
  }

  return (
    <Card>
      <CardMedia>
        <ItemCardHeader title={title} subtitle={subTitle} />
      </CardMedia>
      <CardContent>
        {announcement.excerpt}
      </CardContent>
      <CardActions>
        <Button to={editAnnouncementLink({ id: announcement.id })} color="default">
          <EditIcon />
        </Button>
        <Button to="#" onClick={handleDelete} color="default">
          <DeleteIcon />
        </Button>
      </CardActions>
    </Card>
  );
};

const AnnouncementsGrid = () => {
  const announcementsApi = useApi(announcementsApiRef);
  const { value: announcements, loading, error, retry: refresh } = useAsyncRetry(async () => announcementsApi.announcements({}));

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <ItemCardGrid>
      {announcements!.map((announcement, index) => (
        <AnnouncementCard key={index} announcement={announcement} onChange={refresh} />
      ))}
    </ItemCardGrid>
  );
};

type AnnouncementsPageOpts = {
  title?: string;
};

export const AnnouncementsPage = (opts: AnnouncementsPageOpts) => {
  const newAnnouncementLink = useRouteRef(announcementCreateRouteRef);

  return (
    <Page themeId="home">
      <Header title={opts.title || "Announcements"} />

      <Content>
        <ContentHeader title="">
          <Button to={newAnnouncementLink()} color="primary" variant="contained">
            New announcement
          </Button>
        </ContentHeader>

        <AnnouncementsGrid />
      </Content>
    </Page>
  );
};
