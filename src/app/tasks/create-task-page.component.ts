import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskStoreService } from './task-store.service';

@Component({
  selector: 'app-create-task-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="screen-shell">
      <header class="screen-header">
        <div>
          <p class="eyebrow">Task Center</p>
          <h2>Create New Task</h2>
        </div>

        <a class="secondary-link" routerLink="/tasks">Back to tasks</a>
      </header>

      <section class="form-card card">
        <form [formGroup]="form" (ngSubmit)="saveTask()" class="form-grid">
          <label>
            <span>Task title</span>
            <input formControlName="title" type="text" placeholder="Passport renewal" />
          </label>

          <label>
            <span>Service</span>
            <input formControlName="service" type="text" placeholder="Awaiting evidence review" />
          </label>

          <label>
            <span>Status</span>
            <input formControlName="status" type="text" placeholder="Needs attention" />
          </label>

          <div class="actions">
            <button type="submit" class="primary-button" [disabled]="form.invalid || isSaving()">Save task</button>
            <a class="ghost-link" routerLink="/tasks">Cancel</a>
          </div>
        </form>
      </section>
    </main>
  `,
  styleUrl: './create-task-page.component.scss',
})
export class CreateTaskPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly taskStore = inject(TaskStoreService);
  private readonly router = inject(Router);

  protected readonly isSaving = signal(false);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    service: ['', Validators.required],
    status: ['Draft', Validators.required],
  });

  async saveTask(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.taskStore.addTask(this.form.getRawValue());
    await this.router.navigate(['/tasks']);
    this.isSaving.set(false);
  }
}
