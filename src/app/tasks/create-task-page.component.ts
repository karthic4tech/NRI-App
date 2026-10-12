import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TaskService } from '../core/services/task.service';
import { TaskStoreService } from './task-store.service';

@Component({
  selector: 'app-create-task-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="screen-shell">
      @if (toastMessage()) {
        <div class="task-toast" role="status" aria-live="polite">
          <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
          <div>
            <strong>Task saved</strong>
            <p>{{ toastMessage() }}</p>
          </div>
        </div>
      }

      <header class="screen-header">
        <div>
          <p class="eyebrow">Task Center</p>
          <h2>Create New Task</h2>
        </div>

        <a class="secondary-link" routerLink="/tasks">Back to tasks</a>
      </header>

      <section class="form-card card">
        <form [formGroup]="taskForm" (ngSubmit)="saveTask()" class="form-grid">
          @if (errorMessage()) {
            <div class="form-alert" role="alert">{{ errorMessage() }}</div>
          }

          @if (savedTaskId()) {
            <section class="task-id-panel" aria-label="Created task id">
              <div>
                <p class="task-id-label">Your Task ID</p>
                <p class="task-id-help">Please copy this ID for future reference.</p>
              </div>

              <div class="task-id-copy">
                <input [value]="savedTaskId()" type="text" readonly aria-label="Created task id" />
                <button type="button" class="copy-button" (click)="copyTaskId()">
                  <i class="bi bi-clipboard me-2" aria-hidden="true"></i>
                  {{ copiedTaskId() ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </section>
          }

          <label>
            <span>Your name</span>
            <input formControlName="name" type="text" placeholder="Rahul" />
          </label>

          <label>
            <span>Task Title</span>
            <input formControlName="taskTitle" type="text" placeholder="Passport renewal" />
          </label>

          <label>
            <span>Service Description</span>
            <textarea formControlName="serviceDescription" rows="4" placeholder="Describe the service you need in a few words."></textarea>
          </label>

          <div class="actions">
            <button type="submit" class="primary-button" [disabled]="taskForm.invalid || isSaving()">
              @if (isSaving()) {
                Saving...
              } @else {
                Save task
              }
            </button>
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
  private readonly taskService = inject(TaskService);
  private readonly taskStore = inject(TaskStoreService);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly toastMessage = signal('');
  protected readonly savedTaskId = signal('');
  protected readonly copiedTaskId = signal(false);

  protected readonly taskForm = this.fb.group({
    name: ['', Validators.required],
    taskTitle: ['', Validators.required],
    serviceDescription: ['', Validators.required],
  });

  async saveTask(): Promise<void> {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.toastMessage.set('');
    this.savedTaskId.set('');
    this.copiedTaskId.set(false);

    try {
      const form = this.taskForm.getRawValue();
      const task = await this.taskService.createTask({
        name: form.name,
        taskTitle: form.taskTitle,
        serviceDescription: form.serviceDescription,
      });

      this.taskStore.addTask({
        name: form.name,
        title: form.taskTitle,
        serviceDescription: form.serviceDescription,
      });

      console.log('Created task:', task.TaskId);
      this.savedTaskId.set(task.TaskId);
      this.toastMessage.set(`Hi ${form.name}, your task has been created successfully.`);
    } catch (error) {
      console.error('Task creation failed:', error);
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'We could not save your task right now. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async copyTaskId(): Promise<void> {
    const taskId = this.savedTaskId();

    if (!taskId || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(taskId);
    this.copiedTaskId.set(true);
    setTimeout(() => this.copiedTaskId.set(false), 1500);
  }
}
