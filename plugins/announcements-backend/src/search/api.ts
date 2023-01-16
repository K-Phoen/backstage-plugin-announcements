import crossFetch from 'cross-fetch';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

export type Announcement = {
  id: string;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: string;
};

export class AnnouncementsClient {
  private readonly discoveryApi: DiscoveryApi;

  constructor(opts: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = opts.discoveryApi;
  }

  private async fetch<T = any>(input: string): Promise<T> {
    const baseApiUrl = await this.discoveryApi.getBaseUrl('announcements');

    return crossFetch(`${baseApiUrl}${input}`).then(async response => {
      if (!response.ok) {
        throw await ResponseError.fromResponse(response);
      }
      return response.json() as Promise<T>;
    });
  }

  async announcements(): Promise<Announcement[]> {
    return await this.fetch<Announcement[]>('/');
  }
}
