import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">24/7 NRI Services App</p>
          <h1>NRI Customer Dashboard</h1>
        </div>

        <div class="topbar-actions">
          @if (authService.user(); as user) {
            <div class="user-card">
              @if (avatarUrl(user)) {
                <img [src]="avatarUrl(user)" [alt]="displayName(user) + ' profile photo'" class="user-avatar" />
              } @else {
                <span class="user-avatar user-avatar--fallback" aria-hidden="true">{{ initials(user) }}</span>
              }

              <div class="user-card-copy">
                <strong>{{ displayName(user) }}</strong>
                <span>{{ user.email ?? 'Signed in user' }}</span>
              </div>
            </div>
          }
          <button type="button" class="ghost-button" (click)="signOut()">Sign out</button>
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
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly taskStore = inject(TaskStoreService);

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

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
    } finally {
      await this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }

  displayName(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }): string {
    const metadata = user.user_metadata ?? {};
    const fullName = typeof metadata['full_name'] === 'string' ? metadata['full_name'] : undefined;
    const name = typeof metadata['name'] === 'string' ? metadata['name'] : undefined;

    return fullName ?? name ?? user.email?.split('@')[0] ?? 'Account';
  }

  avatarUrl(user: { user_metadata?: Record<string, unknown> | null }): string | null {
    const metadata = user.user_metadata ?? {};
    const avatar = metadata['avatar_url'] ?? metadata['picture'];

    return typeof avatar === 'string' && avatar.length > 0 ? avatar : null;
  }

  initials(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }): string {
    const displayName = this.displayName(user);
    const parts = displayName.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return 'A';
    }

    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  }
}
