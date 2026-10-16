import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import type { TaskRecord } from './task.service';

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminConsultationRecord {
  id: number;
  name: string;
  phone_number: string;
  city: string;
  country: string;
  created_at: string;
}

export interface AdminSummary {
  taskCount: number;
  consultationCount: number;
  latestTasks: TaskRecord[];
  latestConsultations: AdminConsultationRecord[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly authService = inject(AuthService);
  private readonly summaryUrl = new URL('/functions/v1/admin-summary', environment.supabaseUrl).toString();
  private readonly tasksUrl = new URL('/functions/v1/admin-tasks', environment.supabaseUrl).toString();
  private readonly consultationsUrl = new URL('/functions/v1/admin-consultations', environment.supabaseUrl).toString();

  async getSummary(): Promise<AdminSummary> {
    return await this.fetchAdminData<AdminSummary>(this.summaryUrl);
  }

  async getTasks(page = 1, pageSize = 10, search = ''): Promise<PagedResult<TaskRecord>> {
    const query = this.buildQuery({ page, pageSize, search });
    return await this.fetchAdminData<PagedResult<TaskRecord>>(`${this.tasksUrl}?${query}`);
  }

  async getConsultations(page = 1, pageSize = 10, search = ''): Promise<PagedResult<AdminConsultationRecord>> {
    const query = this.buildQuery({ page, pageSize, search });
    return await this.fetchAdminData<PagedResult<AdminConsultationRecord>>(`${this.consultationsUrl}?${query}`);
  }

  private async fetchAdminData<T>(url: string): Promise<T> {
    const session = await this.authService.getCurrentSession();

    if (!session?.access_token) {
      throw new Error('You must be signed in to access admin data.');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        apikey: environment.supabasePublishableKey,
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error?: unknown }).error ?? 'Unknown error')
          : 'Unknown error';

      throw new Error(message);
    }

    return payload as T;
  }

  private buildQuery(input: { page: number; pageSize: number; search: string }): string {
    const params = new URLSearchParams();
    params.set('page', String(Math.max(1, Math.floor(input.page))));
    params.set('pageSize', String(Math.max(1, Math.floor(input.pageSize))));

    const search = input.search.trim();
    if (search) {
      params.set('search', search);
    }

    return params.toString();
  }
}
