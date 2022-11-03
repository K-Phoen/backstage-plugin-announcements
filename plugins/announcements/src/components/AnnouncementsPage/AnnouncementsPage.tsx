import React from 'react';
import { Table, TableColumn, Page, Header, Content, Link } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import Alert from '@material-ui/lab/Alert';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Announcement, announcementsApiRef } from '../../api';
import { announcementCreateRouteRef, announcementEditRouteRef, announcementViewRouteRef } from '../../routes';
import { useAsyncRetry } from 'react-use';

const AnnouncementsTable = () => {
  const announcementsApi = useApi(announcementsApiRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const newAnnouncementLink = useRouteRef(announcementCreateRouteRef);
  const editAnnouncementLink = useRouteRef(announcementEditRouteRef);
  const { value: announcements, loading, error, retry: refreshAnnouncements } = useAsyncRetry(async () => announcementsApi.announcements());

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const columns: TableColumn<Announcement>[] = [
    {
      title: 'Title',
      field: 'title',
      render: a => {
        return <Link to={viewAnnouncementLink({ id: a.id })}>{a.title}</Link>;
      },
    },
    { title: 'Excerpt', field: 'excerpt' },
    { title: 'Created At', field: 'created_at', type: 'datetime' },
  ];

  const handleDelete = async (announcement: Announcement) => {
    await announcementsApi.deleteAnnouncementByID(announcement.id);

    refreshAnnouncements();
  };

  return (
    <Table
      title="Announcements list"
      isLoading={loading}
      options={{
        sorting: true,
        search: true,
        paging: true,
        actionsColumnIndex: -1,
      }}
      columns={columns}
      data={announcements || []}
      actions={[
        (rowData: Announcement) => ({
            icon: () => <Link to={editAnnouncementLink({id: rowData.id})}><EditIcon /></Link>,
            tooltip: 'Edit announcement',
            onClick: (_) => { },
            position: "auto",
        }),
        {
          icon: DeleteIcon,
          tooltip: 'Delete announcement',
          onClick: (_, rowData) => { handleDelete(rowData as Announcement) },
        },
        {
          icon: () => <Link to={newAnnouncementLink()}><AddIcon /></Link>,
          tooltip: 'New announcement',
          isFreeAction: true,
          onClick: (_) => { },
        },
      ]}
    />
  );
};

export const AnnouncementsPage = () => {
  return (
    <Page themeId="home">
      <Header title="Announcements" />

      <Content>
        <AnnouncementsTable />
      </Content>
    </Page>
  );
};
