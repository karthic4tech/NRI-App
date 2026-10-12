import { Injectable, computed, signal } from '@angular/core';

export interface TaskRecord {
  id: string;
  title: string;
  service: string;
  status: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  service: string;
  status: string;
}

const initialTasks: TaskRecord[] = [
  { id: '1042', title: 'Passport renewal', service: 'Awaiting evidence review', status: 'Needs attention', updatedAt: '10 min ago' },
  { id: '1038', title: 'Address proof', service: 'Awaiting quotation approval', status: 'Action required', updatedAt: '1 hour ago' },
  { id: '1021', title: 'PAN update', service: 'In progress', status: 'Partner assigned', updatedAt: 'Today' },
];

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly tasksSignal = signal(initialTasks);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly totalTasks = computed(() => this.tasksSignal().length);

  addTask(input: CreateTaskInput): TaskRecord {
    const task: TaskRecord = {
      id: String(this.nextTaskId()),
      title: input.title,
      service: input.service,
      status: input.status,
      updatedAt: 'Just now',
    };

    this.tasksSignal.update((tasks) => [task, ...tasks]);
    return task;
  }

  private nextTaskId(): number {
    return Math.max(...this.tasksSignal().map((task) => Number(task.id) || 0), 0) + 1;
  }
}
