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

export type Category = {
  slug: string;
  title: string;
};

export type Announcement = {
  id: string;
  category?: Category;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: string;
};

export type AnnouncementsList = {
  count: number;
  results: Announcement[];
};

export type CreateAnnouncementRequest = Omit<
  Announcement,
  'id' | 'category' | 'created_at'
> & {
  category?: string;
};

export type CreateCategoryRequest = {
  title: string;
};

export interface AnnouncementsApi {
  announcements(opts: {
    max?: number;
    page?: number;
    category?: string;
  }): Promise<AnnouncementsList>;
  announcementByID(id: string): Promise<Announcement>;

  createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement>;
  updateAnnouncement(
    id: string,
    request: CreateAnnouncementRequest,
  ): Promise<Announcement>;
  deleteAnnouncementByID(id: string): Promise<void>;

  categories(): Promise<Category[]>;
  createCategory(request: CreateCategoryRequest): Promise<void>;

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

  async announcements({
    max,
    page,
    category,
  }: {
    max?: number;
    page?: number;
    category?: string;
  }): Promise<AnnouncementsList> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    if (max) {
      params.append('max', max.toString());
    }
    if (page) {
      params.append('page', page.toString());
    }

    return this.fetch<AnnouncementsList>(`/announcements?${params.toString()}`);
  }

  async announcementByID(id: string): Promise<Announcement> {
    return this.fetch<Announcement>(`/announcements/${id}`);
  }

  async createAnnouncement(
    request: CreateAnnouncementRequest,
  ): Promise<Announcement> {
    return await this.fetch<Announcement>(`/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async updateAnnouncement(
    id: string,
    request: CreateAnnouncementRequest,
  ): Promise<Announcement> {
    return this.fetch<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteAnnouncementByID(id: string): Promise<void> {
    return this.delete(`/announcements/${id}`, { method: 'DELETE' });
  }

  async categories(): Promise<Category[]> {
    return this.fetch<Category[]>('/categories');
  }

  async createCategory(request: CreateCategoryRequest): Promise<void> {
    await this.fetch<Category>(`/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
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
    this.webStorage.set<string>(lastSeenKey, date.toISO()!);
  }
}
