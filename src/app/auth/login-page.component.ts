import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-grid" aria-labelledby="login-title">
        <article class="auth-intro">
          <div class="brand-lockup">
            <span class="brand-mark" aria-hidden="true">
              <i class="bi bi-house-heart-fill"></i>
            </span>
            <div>
              <p class="eyebrow">24/7 NRI Services</p>
              <h2 class="h5 fw-bold mb-0">Secure access for your India responsibilities</h2>
            </div>
          </div>

          <div>
            <p class="eyebrow">Sign in</p>
            <h1 id="login-title">Welcome to 24/7 NRI Services</h1>
            <p class="auth-lead mt-3">Manage your responsibilities in India, wherever you are.</p>
          </div>

          <ul class="benefits" aria-label="Benefits of signing in">
            <li><i class="bi bi-shield-check" aria-hidden="true"></i><span>Keep your tasks, updates, and payment status in one secure place.</span></li>
            <li><i class="bi bi-globe2" aria-hidden="true"></i><span>Access the service portal from anywhere in the world.</span></li>
            <li><i class="bi bi-people" aria-hidden="true"></i><span>Coordinate property, family, and legal support with confidence.</span></li>
          </ul>
        </article>

        <article class="auth-card card" aria-labelledby="continue-with-google">
          <div class="auth-card-header">
            <p class="eyebrow">Quick sign-in</p>
            <h2 id="continue-with-google" class="h4 fw-bold text-navy">Continue with Google</h2>
            <p class="auth-copy">Use your Google account to securely access 24/7 NRI Services.</p>
          </div>

          @if (authService.loading()) {
            <div class="auth-status" aria-live="polite">
              <span class="spinner" aria-hidden="true"></span>
              <div>
                <strong>Restoring your session</strong>
                <p>Checking whether you're already signed in...</p>
              </div>
            </div>
          }

          @if (errorMessage()) {
            <div class="auth-status auth-status--error" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <div>
                <strong>We couldn't sign you in</strong>
                <p>{{ errorMessage() }}</p>
              </div>
            </div>
          }

          <button
            type="button"
            class="google-button"
            [disabled]="authService.loading() || isSigningIn()"
            [attr.aria-busy]="authService.loading() || isSigningIn()"
            (click)="continueWithGoogle()"
          >
            <svg class="google-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <path fill="#EA4335" d="M24 9.5c3.2 0 6.2 1.1 8.5 3l6.3-6.3C35.1 2.8 30 1 24 1 14.6 1 6.5 6.4 2.6 14.3l7.4 5.8C12.2 13 17.6 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.8c-.3 2-1.7 5-4.9 7.1l7.6 5.9c4.5-4.2 7-10.4 7-16.9z"/>
              <path fill="#FBBC05" d="M10 28.9A14.2 14.2 0 0 1 9.2 24c0-1.7.3-3.3.8-4.8L2.6 13.4A23.8 23.8 0 0 0 0 24c0 3.8.9 7.4 2.6 10.6l7.4-5.7z"/>
              <path fill="#34A853" d="M24 48c6 0 11.1-2 14.8-5.4l-7-5.4c-2 1.3-4.7 2.3-7.8 2.3-6.4 0-11.8-3.6-14-8.8l-7.4 5.7C6.4 41.8 14.6 48 24 48z"/>
            </svg>
            @if (isSigningIn()) {
              <span class="auth-loader"><span class="spinner" aria-hidden="true"></span>Redirecting…</span>
            } @else {
              <span>Continue with Google</span>
            }
          </button>

          <div class="auth-footer">
            <p class="tiny-copy mb-0">New to 24/7 NRI Services?</p>
            <a class="auth-link" routerLink="/register" [queryParams]="registerQueryParams">Create an account</a>
          </div>
        </article>
      </section>
    </main>
  `,
  styleUrl: './auth-page.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isSigningIn = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly returnUrl = this.resolveReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
  protected readonly registerQueryParams = this.returnUrl ? { returnUrl: this.returnUrl } : undefined;

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();

    if (this.authService.isAuthenticated()) {
      await this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    }
  }

  async continueWithGoogle(): Promise<void> {
    this.errorMessage.set('');
    this.isSigningIn.set(true);

    try {
      await this.authService.signInWithGoogle(this.returnUrl);
    } catch (error) {
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'Unable to start Google sign-in right now.');
      this.isSigningIn.set(false);
    }
  }

  private resolveReturnUrl(returnUrl: string | null): string {
    if (returnUrl?.startsWith('/')) {
      return returnUrl;
    }

    return '/dashboard';
  }
}
