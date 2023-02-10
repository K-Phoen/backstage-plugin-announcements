# Integration with `@backstage/plugin-search`

Enable announcements indexing in the search engine:

```typescript
// packages/backend/src/plugins/search.ts
import { AnnouncementCollatorFactory } from '@k-phoen/backstage-plugin-announcements-backend';

export default async function createPlugin({
  logger,
  permissions,
  discovery,
  config,
  tokenManager,
}: PluginEnvironment) {
  // Initialize a connection to a search engine.
  const searchEngine = await ElasticSearchSearchEngine.fromConfig({
    logger,
    config,
  });
  const indexBuilder = new IndexBuilder({ logger, searchEngine });

  // …

  const tenMinutesSchedule = env.scheduler.createScheduledTaskRunner({
    frequency: Duration.fromObject({ minutes: 10 }),
    timeout: Duration.fromObject({ minutes: 15 }),
    // A 3 second delay gives the backend server a chance to initialize before
    // any collators are executed, which may attempt requests against the API.
    initialDelay: Duration.fromObject({ seconds: 3 }),
  });

  // Announcements indexing
  indexBuilder.addCollator({
    schedule: tenMinutesSchedule,
    factory: AnnouncementCollatorFactory.fromConfig({ logger: env.logger, discoveryApi: env.discovery }),
  });

  // …

  // The scheduler controls when documents are gathered from collators and sent
  // to the search engine for indexing.
  const { scheduler } = await indexBuilder.build();

  // A 3 second delay gives the backend server a chance to initialize before
  // any collators are executed, which may attempt requests against the API.
  setTimeout(() => scheduler.start(), 3000);
  useHotCleanup(module, () => scheduler.stop());

  return await createRouter({
    engine: indexBuilder.getSearchEngine(),
    types: indexBuilder.getDocumentTypes(),
    permissions,
    config,
    logger,
  });
}
```

Nicely display announcements search results:

```typescript
// packages/app/src/components/search/SearchPage.tsx

import { AnnouncementSearchResultListItem } from '@k-phoen/backstage-plugin-announcements';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';

// ...
<SearchType.Accordion
  name="Result Type"
  defaultValue="software-catalog"
  types={[
    // ...
    {
      value: 'announcements',
      name: 'Announcements',
      icon: <RecordVoiceOverIcon />,
    },
  ]}
/>

<SearchResult>
  {({ results }) => (
    <List>
      {results.map(({ type, document, highlight, rank }) => {
        switch (type) {
          case 'announcements':
            return (
              <AnnouncementSearchResultListItem
                key={document.location}
                result={document}
                highlight={highlight}
                rank={rank}
              />
            );
          // ...
        }
      })}
    </List>
  )}
</SearchResult>
```
