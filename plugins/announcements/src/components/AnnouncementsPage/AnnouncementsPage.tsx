import React, { useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { usePermission } from '@backstage/plugin-permission-react';
import { announcementEntityPermissions } from '@k-phoen/backstage-plugin-announcements-common';
import { DateTime } from 'luxon';
import { Page, Header, Content, Link, ItemCardGrid, Progress, Button, ItemCardHeader, ContentHeader } from '@backstage/core-components';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { parseEntityRef } from '@backstage/catalog-model';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import Alert from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Card, CardActions, CardContent, CardMedia, makeStyles } from '@material-ui/core';
import { announcementCreateRouteRef, announcementEditRouteRef, announcementViewRouteRef } from '../../routes';
import { Announcement, announcementsApiRef } from '../../api';

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
  const entityLink = useRouteRef(entityRouteRef);
  const [deleting, setDeleting] = useState(false);

  const publisherRef = parseEntityRef(announcement.publisher);
  const title = <Link className={classes.cardHeader} to={viewAnnouncementLink({ id: announcement.id })}>{announcement.title}</Link>;
  const subTitle = (
    <>
      By <Link to={entityLink(publisherRef)}>{publisherRef.name}</Link>, {DateTime.fromISO(announcement.created_at).toRelative()}
    </>
  );
  const { announcementUpdatePermission, announcementDeletePermission } = announcementEntityPermissions;
  const { loading: loadingDeletePermission, allowed: canDelete } = usePermission({ permission: announcementDeletePermission });
  const { loading: loadingUpdatePermission, allowed: canUpdate } = usePermission({ permission: announcementUpdatePermission });

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
        {!loadingUpdatePermission && canUpdate && (
          <Button to={editAnnouncementLink({ id: announcement.id })} color="default">
            <EditIcon />
          </Button>
        )}
        {!loadingDeletePermission && canDelete && (
          <Button to="#" onClick={handleDelete} color="default">
            <DeleteIcon />
          </Button>
        )}
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
  const { announcementCreatePermission } = announcementEntityPermissions;
  const { loading: loadingCreatePermission, allowed: canCreate } = usePermission({ permission: announcementCreatePermission });

  return (
    <Page themeId="home">
      <Header title={opts.title || "Announcements"} />

      <Content>
        <ContentHeader title="">
          {!loadingCreatePermission && (
            <Button disabled={!canCreate} to={newAnnouncementLink()} color="primary" variant="contained">
              New announcement
            </Button>
          )}
        </ContentHeader>

        <AnnouncementsGrid />
      </Content>
    </Page>
  );
};
