import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface CreateTaskInput {
  name: string;
  taskTitle: string;
  serviceDescription: string;
}

export interface TaskRecord {
  TaskIdentity: number;
  TaskId: string;
  Name: string;
  TaskTitle: string;
  ServiceDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly taskFunctionUrl = environment.supabaseUrl.replace(/\/rest\/v1\/?$/, '/functions/v1/create-task');

  async getTaskById(taskId: string): Promise<TaskRecord | null> {
    const normalizedTaskId = taskId.trim();

    if (!normalizedTaskId) {
      return null;
    }

    const response = await this.invokeTaskFunction<TaskRecord | null>(
      `?taskId=${encodeURIComponent(normalizedTaskId)}`,
      { method: 'GET' },
    );

    return response;
  }

  async getTasks(): Promise<TaskRecord[]> {
    return await this.invokeTaskFunction<TaskRecord[]>('', { method: 'GET' });
  }

  async createTask(input: CreateTaskInput): Promise<TaskRecord> {
    return await this.invokeTaskFunction<TaskRecord>('', {
      method: 'POST',
      body: {
        name: input.name,
        taskTitle: input.taskTitle,
        serviceDescription: input.serviceDescription,
      },
    });
  }

  private async invokeTaskFunction<T>(path = '', init: { method: 'GET' | 'POST'; body?: unknown }): Promise<T> {
    const response = await fetch(`${this.taskFunctionUrl}${path}`, {
      method: init.method,
      headers: {
        Accept: 'application/json',
        apikey: environment.supabasePublishableKey,
        Authorization: `Bearer ${environment.supabasePublishableKey}`,
        ...(init.method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      body: init.method === 'POST' ? JSON.stringify(init.body ?? {}) : undefined,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error?: unknown }).error ?? 'Unknown error')
          : 'Unknown error';

      throw new Error(`Task service request failed (${response.status}): ${message}`);
    }

    return payload as T;
  }
}
