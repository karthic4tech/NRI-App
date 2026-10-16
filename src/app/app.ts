import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      @if (showChrome()) {
        <header class="master-nav" aria-label="Primary">
          <a class="brand" routerLink="/" aria-label="24/7 NRI Services home">
            <img
              ngSrc="assets/logo/nri-services-logo.png"
              width="340"
              height="141"
              priority
              alt="24/7 NRI Services"
              class="brand-logo"
            />
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

            @if (authService.user(); as user) {
              @if (authService.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="is-active">
                  <i class="bi bi-shield-lock me-2" aria-hidden="true"></i>Admin
                </a>
              }
              <span class="master-nav-user" [title]="user.email ?? 'Signed in user'">
                <i class="bi bi-person-circle me-2" aria-hidden="true"></i>
                {{ displayName(user) }}
              </span>
              <button type="button" class="master-nav-button" (click)="signOut()">Sign out</button>
            } @else {
              <a routerLink="/login" routerLinkActive="is-active">
                <i class="bi bi-person-check me-2" aria-hidden="true"></i>Login
              </a>
              <a routerLink="/register" routerLinkActive="is-active">
                <i class="bi bi-person-plus me-2" aria-hidden="true"></i>Register
              </a>
            }
          </nav>

          <a class="master-nav-cta" routerLink="/consultation">
            <i class="bi bi-chat-dots-fill me-2" aria-hidden="true"></i>
            Request free Consultation
          </a>
        </header>
      }

      <router-outlet></router-outlet>
    </div>
  `,
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly showChrome = signal(!this.isAuthRoute(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.showChrome.set(!this.isAuthRoute(event.urlAfterRedirects));
      });
  }

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

  private isAuthRoute(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/register') || url.startsWith('/auth/callback');
  }
}
