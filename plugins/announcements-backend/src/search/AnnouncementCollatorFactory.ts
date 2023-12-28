import { Readable } from 'stream';
import { Logger } from 'winston';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import { AnnouncementsClient } from './api';
import { TokenManager } from '@backstage/backend-common';
import {
  Announcement,
  IndexableAnnouncement,
} from '@k-phoen/backstage-plugin-announcements-common';

type AnnouncementCollatorOptions = {
  logger: Logger;
  discoveryApi: DiscoveryApi;
  tokenManager?: TokenManager;
};

export class AnnouncementCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'announcements';

  private logger: Logger;
  private announcementsClient: AnnouncementsClient;

  static fromConfig(options: AnnouncementCollatorOptions) {
    return new AnnouncementCollatorFactory(options);
  }

  private constructor(options: AnnouncementCollatorOptions) {
    this.logger = options.logger;
    this.announcementsClient = new AnnouncementsClient({
      discoveryApi: options.discoveryApi,
      tokenManager: options.tokenManager,
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  private async *execute(): AsyncGenerator<IndexableAnnouncement> {
    this.logger.info('started indexing announcements');

    let results: Announcement[] = [];
    let page = 1;
    const maxPerPage = 50;

    do {
      results = await this.announcementsClient.announcements({
        page,
        maxPerPage,
      });

      this.logger.debug(`got ${results.length} announcements for page ${page}`);

      for (const result of results) {
        yield this.getDocumentInfo(result);
      }

      page += 1;
    } while (results.length !== 0);

    this.logger.info('finished indexing announcements');
  }

  private getDocumentInfo(announcement: Announcement): IndexableAnnouncement {
    this.logger.debug(
      `mapping announcement ${announcement.id} to indexable document`,
    );

    return {
      title: announcement.title,
      text: announcement.body,
      excerpt: announcement.excerpt,
      createdAt: announcement.created_at,
      // TODO this might not be correct
      location: `/announcements/view/${announcement.id}`,
    };
  }
}
