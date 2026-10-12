import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskStoreService } from '../tasks/task-store.service';

interface SummaryCard {
  label: string;
  value: string;
  note: string;
}

interface ActivityItem {
  title: string;
  detail: string;
  time: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  template: `
    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">NRI Services App</p>
          <h1>NRI Customer Dashboard</h1>
        </div>

        <div class="topbar-actions">
          <button type="button" class="ghost-button">Notifications</button>
          <button type="button" class="profile-button">{{ userName }}</button>
        </div>
      </header>

      <section class="hero card">
        <div>
          <p class="eyebrow">Welcome back</p>
          <h2>Need attention: 2 tasks waiting for your review</h2>
          <p class="muted">Start new service requests, review quotations, and track completion from one place.</p>
        </div>

        <div class="hero-actions">
          @for (action of quickActions; track action.label) {
            <a class="primary-action" [routerLink]="action.link">
              <span>{{ action.label }}</span>
              <small>{{ action.hint }}</small>
            </a>
          }
        </div>
      </section>

      <section class="summary-grid">
        @for (card of summaryCards; track card.label) {
          <article class="card summary-card">
            <p class="eyebrow">{{ card.label }}</p>
            <h3>{{ card.value }}</h3>
            <p class="muted">{{ card.note }}</p>
          </article>
        }
      </section>

      <section class="content-grid">
        <article class="card panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Active Work</p>
              <h2>Tasks that need your attention</h2>
            </div>
            <a class="link-button" routerLink="/tasks">View all</a>
          </div>

          <div class="task-list">
            @for (task of activeTasks(); track task.id) {
              <div class="task-row">
                <div>
                  <p class="task-title">{{ task.name }} — Task #{{ task.id }} - {{ task.title }}</p>
                  <p class="muted">{{ task.serviceDescription }}</p>
                </div>
                <div class="task-meta">
                  <small>{{ task.updatedAt }}</small>
                </div>
              </div>
            }
          </div>
        </article>

        <article class="card panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Recent Activity</p>
              <h2>Latest updates</h2>
            </div>
          </div>

          <div class="activity-list">
            @for (item of recentActivity; track item.title) {
              <div class="activity-item">
                <div class="activity-dot" aria-hidden="true"></div>
                <div>
                  <p class="task-title">{{ item.title }}</p>
                  <p class="muted">{{ item.detail }}</p>
                </div>
                <small>{{ item.time }}</small>
              </div>
            }
          </div>
        </article>
      </section>
    </main>
  `,
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  private readonly taskStore = inject(TaskStoreService);

  protected readonly userName = 'Rahul';

  protected readonly summaryCards: SummaryCard[] = [
    { label: 'Draft tasks', value: '01', note: 'Waiting to be submitted' },
    { label: 'Pending quotation', value: '02', note: 'Needs your approval' },
    { label: 'Awaiting review', value: '03', note: 'Evidence ready to inspect' },
    { label: 'Completed', value: '12', note: 'Closed and settled' },
  ];

  protected readonly quickActions = [
    { label: 'Create New Task', hint: 'Start a new service request', link: '/tasks/new' },
    { label: 'View Active Tasks', hint: 'See work that needs attention', link: '/tasks' },
    { label: 'Payment Status', hint: 'Review settlement progress', link: '/payment-status' },
  ];

  protected readonly activeTasks = this.taskStore.tasks;

  protected readonly recentActivity: ActivityItem[] = [
    { title: 'Quotation approved for Passport renewal', detail: 'The partner can now begin execution.', time: '10 min ago' },
    { title: 'Evidence uploaded for Address proof', detail: 'A document is ready for your review.', time: '1 hour ago' },
    { title: 'Settlement pending for Task #1042', detail: 'Payment will be released after approval.', time: 'Today' },
    { title: 'Partner assigned to Task #1038', detail: 'Task partner accepted the assignment.', time: 'Today' },
  ];
}
