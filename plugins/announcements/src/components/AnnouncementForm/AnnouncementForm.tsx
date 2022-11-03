import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { Button, makeStyles, TextField } from '@material-ui/core';
import MDEditor from '@uiw/react-md-editor';
import { CreateAnnouncementRequest } from '../../api';

const useStyles = makeStyles((theme) => ({
  formRoot: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export type AnnouncementFormProps = {
  initialData: CreateAnnouncementRequest;
  onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
};

export const AnnouncementForm = ({ initialData, onSubmit }: AnnouncementFormProps) => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const [form, setForm] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    const userIdentity = await identityApi.getBackstageIdentity();
    const createRequest = {
      ...form,
      ...{
        publisher: userIdentity.userEntityRef
      },
    }

    await onSubmit(createRequest);
    setLoading(false);
  };

  return (
    <InfoCard title={initialData.title? `Edit announcement` : "New announcement"}>
      <form className={classes.formRoot} onSubmit={handleSubmit}>
        <div>
          <TextField
            id="title"
            type="text"
            label="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <TextField
            id="excerpt"
            type="text"
            label="Excerpt"
            value={form.excerpt}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <MDEditor
            value={form.body}
            style={{minHeight: '30rem'}}
            onChange={value => setForm({ ...form, ...{ body: value || '' } })}
          />
        </div>
        <Button variant='contained' color='primary' type='submit' disabled={loading}>Submit</Button>
      </form>
    </InfoCard>
  );
};
