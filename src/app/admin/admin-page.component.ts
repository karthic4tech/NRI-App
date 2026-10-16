import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AdminService, type AdminConsultationRecord, type AdminSummary, type PagedResult } from '../core/services/admin.service';
import type { TaskRecord } from '../core/services/task.service';

type AdminTab = 'overview' | 'tasks' | 'consultations';

type DetailDrawerState =
  | {
      kind: 'task';
      title: string;
      subtitle: string;
      badge: string;
      primaryValueLabel: string;
      primaryValue: string;
      fields: Array<{ label: string; value: string }>;
    }
  | {
      kind: 'consultation';
      title: string;
      subtitle: string;
      badge: string;
      primaryValueLabel: string;
      primaryValue: string;
      fields: Array<{ label: string; value: string }>;
    };

@Component({
  selector: 'app-admin-page',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="admin-shell">
      <header class="admin-header">
        <div>
          <p class="eyebrow">Admin Console</p>
          <h1>Tasks & Consultation Requests</h1>
          <p class="muted">Review all submitted tasks and consultation requests from one secure workspace.</p>
        </div>

        <a class="secondary-link" routerLink="/dashboard">Back to dashboard</a>
      </header>

      @if (summaryError()) {
        <section class="message message--error" role="alert">{{ summaryError() }}</section>
      }

      <section class="stats-grid" aria-label="Admin summary">
        <article class="stat-card">
          <span class="stat-label">Total tasks</span>
          <strong class="stat-value">{{ summary()?.taskCount ?? '—' }}</strong>
          <button type="button" class="stat-link" (click)="setActiveTab('tasks')">Open task list</button>
        </article>
        <article class="stat-card">
          <span class="stat-label">Consultation requests</span>
          <strong class="stat-value">{{ summary()?.consultationCount ?? '—' }}</strong>
          <button type="button" class="stat-link" (click)="setActiveTab('consultations')">Open consultation list</button>
        </article>
      </section>

      <nav class="tab-bar" aria-label="Admin sections">
        <button type="button" class="tab-button" [class.is-active]="activeTab() === 'overview'" (click)="setActiveTab('overview')">Overview</button>
        <button type="button" class="tab-button" [class.is-active]="activeTab() === 'tasks'" (click)="setActiveTab('tasks')">Tasks</button>
        <button type="button" class="tab-button" [class.is-active]="activeTab() === 'consultations'" (click)="setActiveTab('consultations')">Consultations</button>
      </nav>

      @if (activeTab() === 'overview') {
        <section class="content-grid">
          <article class="panel card-panel">
            <div class="panel-header">
              <h2>Latest tasks</h2>
              <p class="muted">Newest task submissions across the system.</p>
            </div>

            <div class="table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (task of summary()?.latestTasks ?? []; track task.TaskId) {
                    <tr>
                      <td>{{ task.TaskId }}</td>
                      <td>{{ task.Name }}</td>
                      <td>{{ task.TaskTitle }}</td>
                      <td>{{ formatDate(task.UpdatedAt) }}</td>
                      <td class="row-actions-cell">
                        <button type="button" class="row-action" (click)="openTaskDetails(task)">View</button>
                        <button type="button" class="row-action" (click)="copyToClipboard(task.TaskId)">Copy ID</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5"><div class="empty-state">No tasks available.</div></td></tr>
                  }
                </tbody>
              </table>
            </div>
          </article>

          <article class="panel card-panel">
            <div class="panel-header">
              <h2>Latest consultation requests</h2>
              <p class="muted">Newest public consultation submissions.</p>
            </div>

            <div class="table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of summary()?.latestConsultations ?? []; track item.id) {
                    <tr>
                      <td>{{ item.name }}</td>
                      <td>{{ item.phone_number }}</td>
                      <td>{{ item.city }}, {{ item.country }}</td>
                      <td>{{ formatDate(item.created_at) }}</td>
                      <td class="row-actions-cell">
                        <button type="button" class="row-action" (click)="openConsultationDetails(item)">View</button>
                        <button type="button" class="row-action" (click)="copyToClipboard(item.phone_number)">Copy phone</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5"><div class="empty-state">No consultation requests available.</div></td></tr>
                  }
                </tbody>
              </table>
            </div>
          </article>
        </section>
      }

      @if (activeTab() === 'tasks') {
        <section class="panel card-panel">
          <div class="panel-header panel-header--stacked">
            <div>
              <h2>All tasks</h2>
              <p class="muted">Search and page through every task submission.</p>
            </div>

            <form class="search-bar" [formGroup]="taskSearchForm" (ngSubmit)="applyTaskSearch()">
              <input formControlName="search" type="search" placeholder="Search tasks" />
              <button type="submit" class="search-button">Search</button>
              <button type="button" class="ghost-button" (click)="clearTaskSearch()">Clear</button>
            </form>
          </div>

          @if (tasksError()) {
            <div class="message message--error" role="alert">{{ tasksError() }}</div>
          }

          <div class="table-wrap" [attr.aria-busy]="tasksLoading()">
            @if (tasksLoading()) {
              <div class="loading-state">Loading tasks…</div>
            } @else {
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>User</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (task of taskPageData()?.items ?? []; track task.TaskId) {
                    <tr>
                      <td>{{ task.TaskId }}</td>
                      <td>{{ task.Name }}</td>
                      <td>{{ task.TaskTitle }}</td>
                      <td>{{ task.ServiceDescription }}</td>
                      <td>{{ task.UserEmail }}</td>
                      <td>{{ formatDate(task.UpdatedAt) }}</td>
                      <td class="row-actions-cell">
                        <button type="button" class="row-action" (click)="openTaskDetails(task)">View</button>
                        <button type="button" class="row-action" (click)="copyToClipboard(task.TaskId)">Copy ID</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="7"><div class="empty-state">No tasks found.</div></td></tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <div class="pager">
            <span>Page {{ taskPage() }} of {{ taskTotalPages() }}</span>
            <div class="pager-actions">
              <button type="button" class="ghost-button" (click)="previousTaskPage()" [disabled]="taskPage() <= 1 || tasksLoading()">Previous</button>
              <button type="button" class="ghost-button" (click)="nextTaskPage()" [disabled]="taskPage() >= taskTotalPages() || tasksLoading()">Next</button>
            </div>
          </div>
        </section>
      }

      @if (activeTab() === 'consultations') {
        <section class="panel card-panel">
          <div class="panel-header panel-header--stacked">
            <div>
              <h2>All consultation requests</h2>
              <p class="muted">Search and page through consultation submissions.</p>
            </div>

            <form class="search-bar" [formGroup]="consultationSearchForm" (ngSubmit)="applyConsultationSearch()">
              <input formControlName="search" type="search" placeholder="Search consultations" />
              <button type="submit" class="search-button">Search</button>
              <button type="button" class="ghost-button" (click)="clearConsultationSearch()">Clear</button>
            </form>
          </div>

          @if (consultationsError()) {
            <div class="message message--error" role="alert">{{ consultationsError() }}</div>
          }

          <div class="table-wrap" [attr.aria-busy]="consultationsLoading()">
            @if (consultationsLoading()) {
              <div class="loading-state">Loading consultation requests…</div>
            } @else {
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of consultationPageData()?.items ?? []; track item.id) {
                    <tr>
                      <td>{{ item.name }}</td>
                      <td>{{ item.phone_number }}</td>
                      <td>{{ item.city }}, {{ item.country }}</td>
                      <td>{{ formatDate(item.created_at) }}</td>
                      <td class="row-actions-cell">
                        <button type="button" class="row-action" (click)="openConsultationDetails(item)">View</button>
                        <button type="button" class="row-action" (click)="copyToClipboard(item.phone_number)">Copy phone</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5"><div class="empty-state">No consultation requests found.</div></td></tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <div class="pager">
            <span>Page {{ consultationPage() }} of {{ consultationTotalPages() }}</span>
            <div class="pager-actions">
              <button type="button" class="ghost-button" (click)="previousConsultationPage()" [disabled]="consultationPage() <= 1 || consultationsLoading()">Previous</button>
              <button type="button" class="ghost-button" (click)="nextConsultationPage()" [disabled]="consultationPage() >= consultationTotalPages() || consultationsLoading()">Next</button>
            </div>
          </div>
        </section>
      }

      @if (selectedDetail(); as detail) {
        <aside class="detail-drawer" role="dialog" aria-modal="true" [attr.aria-label]="detail.title">
          <div class="detail-drawer__backdrop" (click)="closeDetailDrawer()"></div>
          <section class="detail-drawer__panel card-panel">
            <div class="detail-drawer__header">
              <div>
                <p class="eyebrow">{{ detail.badge }}</p>
                <h2>{{ detail.title }}</h2>
                <p class="muted">{{ detail.subtitle }}</p>
              </div>

              <button type="button" class="close-button" (click)="closeDetailDrawer()" aria-label="Close details">×</button>
            </div>

            <div class="detail-hero">
              <span class="detail-hero__label">{{ detail.primaryValueLabel }}</span>
              <strong class="detail-hero__value">{{ detail.primaryValue }}</strong>
            </div>

            <div class="detail-fields">
              @for (field of detail.fields; track field.label) {
                <div class="detail-field">
                  <span class="detail-field__label">{{ field.label }}</span>
                  <p class="detail-field__value">{{ field.value }}</p>
                </div>
              }
            </div>

            <div class="detail-actions">
              @if (detail.kind === 'task') {
                <button type="button" class="primary-action" (click)="copyToClipboard(detail.primaryValue)">Copy Task ID</button>
              } @else {
                <button type="button" class="primary-action" (click)="copyToClipboard(detail.primaryValue)">Copy phone number</button>
              }
              <button type="button" class="ghost-button" (click)="closeDetailDrawer()">Close</button>
            </div>
          </section>
        </aside>
      }
    </main>
  `,
  styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly adminService = inject(AdminService);

  protected readonly pageSize = 10;
  protected readonly activeTab = signal<AdminTab>('overview');
  protected readonly summary = signal<AdminSummary | null>(null);
  protected readonly summaryError = signal('');
  protected readonly tasksLoading = signal(true);
  protected readonly tasksError = signal('');
  protected readonly taskPageData = signal<PagedResult<TaskRecord> | null>(null);
  protected readonly taskPage = signal(1);
  protected readonly taskSearchForm = this.fb.group({
    search: [''],
  });
  protected readonly consultationsLoading = signal(true);
  protected readonly consultationsError = signal('');
  protected readonly consultationPageData = signal<PagedResult<AdminConsultationRecord> | null>(null);
  protected readonly consultationPage = signal(1);
  protected readonly consultationSearchForm = this.fb.group({
    search: [''],
  });
  protected readonly selectedDetail = signal<DetailDrawerState | null>(null);

  protected readonly taskTotalPages = computed(() => this.getTotalPages(this.taskPageData()));
  protected readonly consultationTotalPages = computed(() => this.getTotalPages(this.consultationPageData()));

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadSummary(),
      this.loadTasks(),
      this.loadConsultations(),
    ]);
  }

  setActiveTab(tab: AdminTab): void {
    this.closeDetailDrawer();
    this.activeTab.set(tab);
  }

  async applyTaskSearch(): Promise<void> {
    this.taskPage.set(1);
    await this.loadTasks();
  }

  async clearTaskSearch(): Promise<void> {
    this.taskSearchForm.reset({ search: '' });
    this.taskPage.set(1);
    await this.loadTasks();
  }

  async nextTaskPage(): Promise<void> {
    if (this.taskPage() < this.taskTotalPages()) {
      this.taskPage.update((page) => page + 1);
      await this.loadTasks();
    }
  }

  async previousTaskPage(): Promise<void> {
    if (this.taskPage() > 1) {
      this.taskPage.update((page) => page - 1);
      await this.loadTasks();
    }
  }

  async applyConsultationSearch(): Promise<void> {
    this.consultationPage.set(1);
    await this.loadConsultations();
  }

  async clearConsultationSearch(): Promise<void> {
    this.consultationSearchForm.reset({ search: '' });
    this.consultationPage.set(1);
    await this.loadConsultations();
  }

  async nextConsultationPage(): Promise<void> {
    if (this.consultationPage() < this.consultationTotalPages()) {
      this.consultationPage.update((page) => page + 1);
      await this.loadConsultations();
    }
  }

  async previousConsultationPage(): Promise<void> {
    if (this.consultationPage() > 1) {
      this.consultationPage.update((page) => page - 1);
      await this.loadConsultations();
    }
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  openTaskDetails(task: TaskRecord): void {
    this.selectedDetail.set({
      kind: 'task',
      title: `Task ${task.TaskId}`,
      subtitle: `Submitted by ${task.UserEmail}`,
      badge: 'Task details',
      primaryValueLabel: 'Task ID',
      primaryValue: task.TaskId,
      fields: [
        { label: 'Name', value: task.Name },
        { label: 'Task title', value: task.TaskTitle },
        { label: 'Service description', value: task.ServiceDescription },
        { label: 'User email', value: task.UserEmail },
        { label: 'Created at', value: this.formatDate(task.CreatedAt) },
        { label: 'Updated at', value: this.formatDate(task.UpdatedAt) },
      ],
    });
  }

  openConsultationDetails(item: AdminConsultationRecord): void {
    this.selectedDetail.set({
      kind: 'consultation',
      title: `Consultation request from ${item.name}`,
      subtitle: `${item.city}, ${item.country}`,
      badge: 'Consultation details',
      primaryValueLabel: 'Phone number',
      primaryValue: item.phone_number,
      fields: [
        { label: 'Name', value: item.name },
        { label: 'Phone number', value: item.phone_number },
        { label: 'City', value: item.city },
        { label: 'Country', value: item.country },
        { label: 'Created at', value: this.formatDate(item.created_at) },
      ],
    });
  }

  closeDetailDrawer(): void {
    this.selectedDetail.set(null);
  }

  async copyToClipboard(value: string): Promise<void> {
    if (!value || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
  }

  private async loadSummary(): Promise<void> {
    this.summaryError.set('');

    try {
      this.summary.set(await this.adminService.getSummary());
    } catch (error) {
      this.summaryError.set(this.toErrorMessage(error, 'We could not load admin summary right now.'));
    }
  }

  private async loadTasks(): Promise<void> {
    this.tasksLoading.set(true);
    this.tasksError.set('');

    try {
      const search = this.taskSearchForm.getRawValue().search ?? '';
      this.taskPageData.set(await this.adminService.getTasks(this.taskPage(), this.pageSize, search));
    } catch (error) {
      this.tasksError.set(this.toErrorMessage(error, 'We could not load tasks right now.'));
    } finally {
      this.tasksLoading.set(false);
    }
  }

  private async loadConsultations(): Promise<void> {
    this.consultationsLoading.set(true);
    this.consultationsError.set('');

    try {
      const search = this.consultationSearchForm.getRawValue().search ?? '';
      this.consultationPageData.set(await this.adminService.getConsultations(this.consultationPage(), this.pageSize, search));
    } catch (error) {
      this.consultationsError.set(this.toErrorMessage(error, 'We could not load consultation requests right now.'));
    } finally {
      this.consultationsLoading.set(false);
    }
  }

  private getTotalPages<T>(data: PagedResult<T> | null): number {
    const total = data?.total ?? 0;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  private toErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
