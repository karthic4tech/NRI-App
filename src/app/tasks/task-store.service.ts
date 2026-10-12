import { Injectable, computed, signal } from '@angular/core';

export interface TaskRecord {
  id: string;
  name: string;
  title: string;
  serviceDescription: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  name: string;
  title: string;
  serviceDescription: string;
}

const initialTasks: TaskRecord[] = [
  { id: '1042', name: 'Rahul', title: 'Passport renewal', serviceDescription: 'Awaiting evidence review', updatedAt: '10 min ago' },
  { id: '1038', name: 'Priya', title: 'Address proof', serviceDescription: 'Awaiting quotation approval', updatedAt: '1 hour ago' },
  { id: '1021', name: 'Arun', title: 'PAN update', serviceDescription: 'In progress', updatedAt: 'Today' },
];

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly tasksSignal = signal(initialTasks);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly totalTasks = computed(() => this.tasksSignal().length);

  addTask(input: CreateTaskInput): TaskRecord {
    const task: TaskRecord = {
      id: String(this.nextTaskId()),
      name: input.name,
      title: input.title,
      serviceDescription: input.serviceDescription,
      updatedAt: 'Just now',
    };

    this.tasksSignal.update((tasks) => [task, ...tasks]);
    return task;
  }

  private nextTaskId(): number {
    return Math.max(...this.tasksSignal().map((task) => Number(task.id) || 0), 0) + 1;
  }
}
