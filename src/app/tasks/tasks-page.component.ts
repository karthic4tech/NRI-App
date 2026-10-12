import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskStoreService } from './task-store.service';

@Component({
  selector: 'app-tasks-page',
  imports: [RouterLink],
  template: `
    <main class="screen-shell">
      <header class="screen-header">
        <div>
          <p class="eyebrow">Task Center</p>
          <h2>Tasks</h2>
        </div>

        <a class="primary-link" routerLink="/tasks/new">Create New Task</a>
      </header>

      <section class="task-summary card">
        <p class="eyebrow">Current queue</p>
        <h3>{{ tasks().length }} tasks in mock data</h3>
        <p class="muted">New tasks created from the form are stored in memory and appear here immediately.</p>
      </section>

      <section class="task-list card">
        @for (task of tasks(); track task.id) {
          <article class="task-row">
            <div>
              <p class="task-title">Task #{{ task.id }} - {{ task.title }}</p>
              <p class="muted">{{ task.service }}</p>
            </div>

            <div class="task-meta">
              <span class="status-pill">{{ task.status }}</span>
              <small>{{ task.updatedAt }}</small>
            </div>
          </article>
        }
      </section>
    </main>
  `,
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent {
  private readonly taskStore = inject(TaskStoreService);

  protected readonly tasks = this.taskStore.tasks;
}
