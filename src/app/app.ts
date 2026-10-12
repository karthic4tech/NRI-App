import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <header class="master-nav" aria-label="Primary">
        <a class="brand" routerLink="/" aria-label="NRI Services home">
          <span class="brand-mark" aria-hidden="true">
            <i class="bi bi-house-heart-fill"></i>
          </span>
          <span class="brand-text">NRI Services</span>
        </a>

        <nav class="master-nav-links">
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">
            <i class="bi bi-grid-1x2-fill me-2" aria-hidden="true"></i>Services
          </a>
          <a routerLink="/tasks" routerLinkActive="is-active">
            <i class="bi bi-list-check me-2" aria-hidden="true"></i>Tasks
          </a>
          <a routerLink="/contact" routerLinkActive="is-active">
            <i class="bi bi-envelope-paper-heart me-2" aria-hidden="true"></i>Contact
          </a>
        </nav>

        <a class="master-nav-cta" routerLink="/tasks/new">
          <i class="bi bi-chat-dots-fill me-2" aria-hidden="true"></i>Request a Service
        </a>
      </header>

      <router-outlet></router-outlet>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App {
}
