import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TaskService, type TaskRecord } from '../core/services/task.service';

@Component({
  selector: 'app-tasks-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="screen-shell">
      <header class="screen-header">
        <div>
          <p class="eyebrow">Task Center</p>
          <h2>Tasks</h2>
        </div>

        <a class="primary-link" routerLink="/tasks/new">Create New Task</a>
      </header>

      <section class="task-search card">
        <div class="task-search-copy">
          <p class="eyebrow">Find your Task details</p>
          <h3>Search by Task ID</h3>
          <p class="muted">Enter your Task ID to view the saved request details from your account.</p>
        </div>

        <form [formGroup]="searchForm" (ngSubmit)="searchTask()" class="task-search-form">
          <label class="task-search-field">
            <span class="sr-only">Task ID</span>
            <input formControlName="taskId" type="text" placeholder="Enter your Task ID" />
          </label>

          <button type="submit" class="search-button" [disabled]="searchForm.invalid || searching()">
            @if (searching()) {
              Searching...
            } @else {
              Search
            }
          </button>
        </form>

        @if (searchError()) {
          <p class="search-feedback search-feedback--error" role="alert">{{ searchError() }}</p>
        }

        @if (searchedTask()) {
          <article class="search-result-card">
            <div class="search-result-topbar">
              <div class="search-result-badge">
                <i class="bi bi-receipt-cutoff" aria-hidden="true"></i>
                <span>Task details found</span>
              </div>
              <button type="button" class="copy-task-id" (click)="copySearchTaskId()">
                <i class="bi bi-clipboard me-2" aria-hidden="true"></i>
                {{ copiedSearchTaskId() ? 'Copied' : 'Copy ID' }}
              </button>
            </div>

            <div class="search-result-header">
              <div>
                <p class="eyebrow">Task reference</p>
                <h4>{{ searchedTask()!.Name }} — Task #{{ searchedTask()!.TaskId }}</h4>
              </div>
              <span class="task-id-chip">ID {{ searchedTask()!.TaskId }}</span>
            </div>

            <div class="search-result-grid">
              <div>
                <span class="detail-label">Task Title</span>
                <p>{{ searchedTask()!.TaskTitle }}</p>
              </div>
              <div>
                <span class="detail-label">Service Description</span>
                <p>{{ searchedTask()!.ServiceDescription }}</p>
              </div>
              <div>
                <span class="detail-label">Created At</span>
                <p>{{ searchedTask()!.CreatedAt }}</p>
              </div>
              <div>
                <span class="detail-label">Updated At</span>
                <p>{{ searchedTask()!.UpdatedAt }}</p>
              </div>
            </div>
          </article>
        }
      </section>

      <section class="task-summary card">
          <p class="eyebrow">Current queue</p>
          @if (loading()) {
          <h3>Loading your tasks…</h3>
          <p class="muted">Fetching the latest tasks from Supabase.</p>
          } @else if (errorMessage()) {
            <h3>Unable to load tasks</h3>
            <p class="muted">{{ errorMessage() }}</p>
          } @else {
          <h3>Top 10 latest tasks</h3>
          <p class="muted">Showing the newest tasks for your signed-in account.</p>
          }
      </section>

      <section class="task-list card">
        @if (loading()) {
          <article class="task-status-card task-status-card--loading" aria-busy="true">
            <div>
              <p class="task-title">Loading your task list…</p>
              <p class="muted">Please wait while we sync the latest records.</p>
            </div>
          </article>
        } @else if (errorMessage()) {
          <article class="task-status-card task-status-card--error">
            <div>
              <p class="task-title">Unable to load tasks</p>
              <p class="muted">{{ errorMessage() }}</p>
            </div>
          </article>
        } @else {
          <div class="task-table-wrap">
            <table class="task-table">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Name</th>
                  <th>Task Title</th>
                  <th>Service Description</th>
                  <th>Updated At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (task of topTasks(); track task.TaskId) {
                  <tr>
                    <td>
                      <span class="task-id-chip">Task #{{ task.TaskId }}</span>
                    </td>
                    <td class="task-cell-strong">{{ task.Name }}</td>
                    <td class="task-cell-accent">{{ task.TaskTitle }}</td>
                    <td>{{ task.ServiceDescription }}</td>
                    <td>
                      <span class="task-date">{{ task.UpdatedAt }}</span>
                    </td>
                    <td>
                      <button type="button" class="task-copy-button" (click)="copyTaskId(task.TaskId)">
                        <i class="bi bi-clipboard me-2" aria-hidden="true"></i>
                        {{ copiedTaskId() === task.TaskId ? 'Copied' : 'Copy ID' }}
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6">
                      <div class="task-status-card task-status-card--empty">
                        <div>
                          <p class="task-title">No tasks yet</p>
                          <p class="muted">Create a task to see it listed here.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </main>
  `,
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly taskService = inject(TaskService);

  protected readonly tasks = signal<TaskRecord[]>([]);
  protected readonly topTasks = computed(() => this.tasks().slice(0, 10));
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly searching = signal(false);
  protected readonly searchError = signal('');
  protected readonly searchedTask = signal<TaskRecord | null>(null);
  protected readonly copiedSearchTaskId = signal(false);
  protected readonly copiedTaskId = signal('');

  protected readonly searchForm = this.fb.group({
    taskId: ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    await this.loadTasks();
  }

  private async loadTasks(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      this.tasks.set(await this.taskService.getTasks());
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'We could not load tasks right now. Please try again later.');
    } finally {
      this.loading.set(false);
    }
  }

  async searchTask(): Promise<void> {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.searching.set(true);
    this.searchError.set('');
    this.searchedTask.set(null);
    this.copiedSearchTaskId.set(false);

    try {
      const { taskId } = this.searchForm.getRawValue();
      const task = await this.taskService.getTaskById(taskId);

      if (!task) {
        this.searchError.set(`No task found for Task ID ${taskId}.`);
        return;
      }

      this.searchedTask.set(task);
    } catch (error) {
      console.error('Failed to search task:', error);
      this.searchError.set(error instanceof Error && error.message ? error.message : 'We could not search for that Task ID right now. Please try again.');
    } finally {
      this.searching.set(false);
    }
  }

  async copySearchTaskId(): Promise<void> {
    const taskId = this.searchedTask()?.TaskId;

    if (!taskId || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(taskId);
    this.copiedSearchTaskId.set(true);
    setTimeout(() => this.copiedSearchTaskId.set(false), 1500);
  }

  async copyTaskId(taskId: string): Promise<void> {
    if (!taskId || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(taskId);
    this.copiedTaskId.set(taskId);
    setTimeout(() => {
      if (this.copiedTaskId() === taskId) {
        this.copiedTaskId.set('');
      }
    }, 1500);
  }
}
