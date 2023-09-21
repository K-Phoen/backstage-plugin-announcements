import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { InfoCard } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  makeStyles,
  Select,
  TextField,
} from '@material-ui/core';
import {
  Announcement,
  announcementsApiRef,
  CreateAnnouncementRequest,
} from '../../api';
import { Autocomplete } from '@material-ui/lab';
import { useAsync } from 'react-use';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles(theme => ({
  formRoot: {
    '& > *': {
      margin: theme.spacing(1),
    },
    formControl: {
      minWidth: '150px',
    },
  },
}));

export type AnnouncementFormProps = {
  initialData: Announcement;
  onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
};

export const AnnouncementForm = ({
  initialData,
  onSubmit,
}: AnnouncementFormProps) => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const [form, setForm] = React.useState({
    ...initialData,
    category: initialData.category?.slug,
  });
  const [loading, setLoading] = React.useState(false);

  const announcementsApi = useApi(announcementsApiRef);
  const { value: categories, loading: categoriesLoading } = useAsync(
    () => announcementsApi.categories(),
    [announcementsApi],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const key = event.target.id ?? event.target.name;
    setForm({
      ...form,
      [key]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    const userIdentity = await identityApi.getBackstageIdentity();
    const createRequest = {
      ...form,
      ...{
        publisher: userIdentity.userEntityRef,
      },
    };

    await onSubmit(createRequest);
    setLoading(false);
  };

  return (
    <InfoCard
      title={initialData.title ? `Edit announcement` : 'New announcement'}
    >
      <form className={classes.formRoot} onSubmit={handleSubmit}>
        <TextField
          id="title"
          type="text"
          label="Title"
          value={form.title}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <FormControl className={classes.formControl}>
          <Select
            id="type"
            name="type"
            defaultValue="info"
            variant="outlined"
            value={form.type ?? 'info'}
            onChange={handleChange}
          >
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="error">Error</MenuItem>
          </Select>
          <FormHelperText>Announcement type</FormHelperText>
        </FormControl>
        <Autocomplete
          fullWidth
          getOptionSelected={(option, value) => option.slug === value.slug}
          getOptionLabel={option => option.title}
          value={initialData.category}
          onChange={(_event, newInputValue) =>
            setForm({ ...form, category: newInputValue?.slug })
          }
          options={categories || []}
          loading={categoriesLoading}
          renderInput={params => (
            <TextField
              {...params}
              id="category"
              label="Category"
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {categoriesLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <TextField
          id="excerpt"
          type="text"
          label="Excerpt"
          value={form.excerpt}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <MDEditor
          value={form.body}
          style={{ minHeight: '30rem' }}
          onChange={value => setForm({ ...form, ...{ body: value || '' } })}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading || !form.body}
        >
          Submit
        </Button>
      </form>
    </InfoCard>
  );
};
