import React, { ReactNode } from 'react';
import { useAsyncRetry } from 'react-use';
import { useLocation } from 'react-router-dom';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  announcementCreatePermission,
  announcementUpdatePermission,
  announcementDeletePermission,
} from '@k-phoen/backstage-plugin-announcements-common';
import { DateTime } from 'luxon';
import {
  Page,
  Header,
  Content,
  Link,
  ItemCardGrid,
  Progress,
  ItemCardHeader,
  ContentHeader,
  LinkButton,
} from '@backstage/core-components';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { parseEntityRef } from '@backstage/catalog-model';
import {
  EntityPeekAheadPopover,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import Alert from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  makeStyles,
} from '@material-ui/core';
import {
  announcementCreateRouteRef,
  announcementEditRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';
import { Announcement, announcementsApiRef } from '../../api';
import { DeleteAnnouncementDialog } from './DeleteAnnouncementDialog';
import { useDeleteAnnouncementDialogState } from './useDeleteAnnouncementDialogState';
import { Pagination } from '@material-ui/lab';
import { ContextMenu } from './ContextMenu';

export type AnnouncementsStylePickerClassKey =
  | 'itemCardHeader'
  | 'cardHeader'
  | 'link';

const useStyles = makeStyles(
  theme => ({
    cardHeader: {
      color: theme.palette.text.primary,
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme.spacing(4),
    },
    itemCardHeader: {},
    link: {},
  }),
  {
    name: 'AnnouncementsStylePicker',
  },
);

const AnnouncementCard = ({
  announcement,
  onDelete,
}: {
  announcement: Announcement;
  onDelete: () => void;
}) => {
  const classes = useStyles();
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const editAnnouncementLink = useRouteRef(announcementEditRouteRef);
  const entityLink = useRouteRef(entityRouteRef);

  const publisherRef = parseEntityRef(announcement.publisher);
  const title = (
    <Link
      className={classes.cardHeader}
      to={viewAnnouncementLink({ id: announcement.id })}
    >
      {announcement.title}
    </Link>
  );
  const subTitle = (
    <>
      By{' '}
      <EntityPeekAheadPopover entityRef={announcement.publisher}>
        <Link to={entityLink(publisherRef)} className={classes.link}>
          {publisherRef.name}
        </Link>
      </EntityPeekAheadPopover>
      {announcement.category && (
        <>
          {' '}
          in{' '}
          <Link
            to={`${announcementsLink()}?category=${announcement.category.slug}`}
          >
            {announcement.category.title}
          </Link>
        </>
      )}
      , {DateTime.fromISO(announcement.created_at).toRelative()}
    </>
  );
  const { loading: loadingDeletePermission, allowed: canDelete } =
    usePermission({ permission: announcementDeletePermission });
  const { loading: loadingUpdatePermission, allowed: canUpdate } =
    usePermission({ permission: announcementUpdatePermission });

  return (
    <Card>
      <CardMedia>
        <ItemCardHeader
          title={title}
          subtitle={subTitle}
          classes={{ root: useStyles().itemCardHeader }}
        />
      </CardMedia>
      <CardContent>{announcement.excerpt}</CardContent>
      <CardActions>
        {!loadingUpdatePermission && canUpdate && (
          <LinkButton
            to={editAnnouncementLink({ id: announcement.id })}
            color="default"
          >
            <EditIcon />
          </LinkButton>
        )}
        {!loadingDeletePermission && canDelete && (
          <Button onClick={onDelete} color="default">
            <DeleteIcon />
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const AnnouncementsGrid = ({
  maxPerPage,
  category,
}: {
  maxPerPage: number;
  category?: string;
}) => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);

  const [page, setPage] = React.useState(1);
  const handleChange = (_event: any, value: number) => {
    setPage(value);
  };

  const {
    value: announcementsList,
    loading,
    error,
    retry: refresh,
  } = useAsyncRetry(
    async () =>
      announcementsApi.announcements({ max: maxPerPage, page, category }),
    [page, maxPerPage, category],
  );
  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    announcement: announcementToDelete,
  } = useDeleteAnnouncementDialogState();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const onCancelDelete = () => {
    closeDeleteDialog();
  };
  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteAnnouncementByID(announcementToDelete!.id);

      alertApi.post({ message: 'Announcement deleted.', severity: 'success' });
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }

    refresh();
  };

  return (
    <>
      <ItemCardGrid>
        {announcementsList?.results!.map((announcement, index) => (
          <AnnouncementCard
            key={index}
            announcement={announcement}
            onDelete={() => openDeleteDialog(announcement)}
          />
        ))}
      </ItemCardGrid>

      {announcementsList && announcementsList.count !== 0 && (
        <div className={classes.pagination}>
          <Pagination
            count={Math.ceil(announcementsList.count / maxPerPage)}
            page={page}
            onChange={handleChange}
          />
        </div>
      )}

      <DeleteAnnouncementDialog
        open={isDeleteDialogOpen}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

type AnnouncementsPageProps = {
  themeId: string;
  title: string;
  subtitle?: ReactNode;
  maxPerPage?: number;
  category?: string;
};

export const AnnouncementsPage = (props: AnnouncementsPageProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const newAnnouncementLink = useRouteRef(announcementCreateRouteRef);
  const { loading: loadingCreatePermission, allowed: canCreate } =
    usePermission({ permission: announcementCreatePermission });

  return (
    <Page themeId={props.themeId}>
      <Header title={props.title} subtitle={props.subtitle}>
        <ContextMenu />
      </Header>

      <Content>
        <ContentHeader title="">
          {!loadingCreatePermission && (
            <LinkButton
              disabled={!canCreate}
              to={newAnnouncementLink()}
              color="primary"
              variant="contained"
            >
              New announcement
            </LinkButton>
          )}
        </ContentHeader>

        <AnnouncementsGrid
          maxPerPage={props.maxPerPage ?? 10}
          category={props.category ?? queryParams.get('category') ?? undefined}
        />
      </Content>
    </Page>
  );
};
