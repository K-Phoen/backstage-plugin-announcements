import fetch from 'node-fetch';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { TokenManager } from '@backstage/backend-common';
import {
  Announcement,
  AnnouncementsList,
} from '@absa-common/plugin-announcements-common';

export class AnnouncementsClient {
  private readonly discoveryApi: DiscoveryApi;
  private readonly tokenManager?: TokenManager;

  constructor(opts: {
    discoveryApi: DiscoveryApi;
    tokenManager?: TokenManager;
  }) {
    this.discoveryApi = opts.discoveryApi;
  }

  private async fetch<T = any>(input: string): Promise<T> {
    const baseApiUrl = await this.discoveryApi.getBaseUrl('announcements');

    let headers = {};

    if (this.tokenManager) {
      const { token } = await this.tokenManager.getToken();
      headers = {
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(`${baseApiUrl}${input}`, headers);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }

  async announcements({
    page,
    maxPerPage,
  }: {
    page: number;
    maxPerPage: number;
  }): Promise<Announcement[]> {
    return this.fetch<AnnouncementsList>(
      `/announcements?page=${page}&max=${maxPerPage}`,
    ).then(response => {
      return response.results || [];
    });
  }
}
