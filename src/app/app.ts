import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <header class="master-nav" aria-label="Primary">
        <a class="brand" routerLink="/" aria-label="NRI Customer Dashboard home">
          <span class="brand-mark" aria-hidden="true">N</span>
          <span class="brand-text">NRI Services App</span>
        </a>

        <nav class="master-nav-links">
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/tasks" routerLinkActive="is-active">Tasks</a>
          <a routerLink="/payment-status" routerLinkActive="is-active">Payment Status</a>
        </nav>
      </header>

      <router-outlet></router-outlet>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App {
}
