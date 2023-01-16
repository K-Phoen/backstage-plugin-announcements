import { DateTime } from 'luxon';
import { WebStorage } from '@backstage/core-app-api';
import {
  createApiRef,
  DiscoveryApi,
  ErrorApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

const lastSeenKey = 'user_last_seen_date';

export type Announcement = {
  id: string;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: string;
};

export type CreateAnnouncementRequest = {
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
};

export interface AnnouncementsApi {
  announcements(opts: { max?: number }): Promise<Announcement[]>;
  announcementByID(id: string): Promise<Announcement>;

  createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement>;
  updateAnnouncement(
    id: string,
    request: CreateAnnouncementRequest,
  ): Promise<Announcement>;
  deleteAnnouncementByID(id: string): Promise<void>;

  lastSeenDate(): DateTime;
  markLastSeenDate(date: DateTime): void;
}

export const announcementsApiRef = createApiRef<AnnouncementsApi>({
  id: 'plugin.announcements.service',
});

type Options = {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
  errorApi: ErrorApi;
};

export class DefaultAnnouncementsApi implements AnnouncementsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  private readonly webStorage: WebStorage;

  constructor(opts: Options) {
    this.discoveryApi = opts.discoveryApi;
    this.identityApi = opts.identityApi;
    this.webStorage = new WebStorage('announcements', opts.errorApi);
  }

  private async fetch<T = any>(input: string, init?: RequestInit): Promise<T> {
    const baseApiUrl = await this.discoveryApi.getBaseUrl('announcements');
    const { token } = await this.identityApi.getCredentials();

    const headers: HeadersInit = new Headers(init?.headers);
    if (token && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${token}`);
    }

    const request = new Request(`${baseApiUrl}${input}`, {
      ...init,
      headers,
    });

    return fetch(request).then(async response => {
      if (!response.ok) {
        throw await ResponseError.fromResponse(response);
      }

      return response.json() as Promise<T>;
    });
  }

  private async delete(input: string, init?: RequestInit): Promise<void> {
    const baseApiUrl = await this.discoveryApi.getBaseUrl('announcements');
    const { token } = await this.identityApi.getCredentials();

    const headers: HeadersInit = new Headers(init?.headers);
    if (token && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${token}`);
    }

    const request = new Request(`${baseApiUrl}${input}`, {
      ...{ method: 'DELETE' },
      headers,
    });

    return fetch(request).then(async response => {
      if (!response.ok) {
        throw await ResponseError.fromResponse(response);
      }
    });
  }

  async announcements({ max }: { max?: number }): Promise<Announcement[]> {
    return this.fetch<Announcement[]>(`/?${max ? `max=${max}` : ''}`);
  }

  async announcementByID(id: string): Promise<Announcement> {
    return this.fetch<Announcement>(`/${id}`);
  }

  async createAnnouncement(
    request: CreateAnnouncementRequest,
  ): Promise<Announcement> {
    return await this.fetch<Announcement>(`/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async updateAnnouncement(
    id: string,
    request: CreateAnnouncementRequest,
  ): Promise<Announcement> {
    return this.fetch<Announcement>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteAnnouncementByID(id: string): Promise<void> {
    return this.delete(`/${id}`, { method: 'DELETE' });
  }

  lastSeenDate(): DateTime {
    const lastSeen = this.webStorage.get<string>(lastSeenKey);
    if (!lastSeen) {
      // magic default date, probably enough in the past to consider every announcement as "not seen"
      return DateTime.fromISO('1990-01-01');
    }

    return DateTime.fromISO(lastSeen);
  }

  markLastSeenDate(date: DateTime): void {
    this.webStorage.set<string>(lastSeenKey, date.toISO());
  }
}
