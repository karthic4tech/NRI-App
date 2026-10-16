import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-auth-callback-page',
  imports: [RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-grid" aria-labelledby="callback-title">
        <article class="auth-intro">
          <div class="brand-lockup">
            <img src="/assets/logo/nri-services-logo.png" width="320" height="133" alt="24/7 NRI Services" class="brand-logo" />
          </div>

          <div>
            <p class="eyebrow">Secure callback</p>
            <h1 id="callback-title">Finishing your sign in</h1>
            <p class="auth-lead mt-3">We are verifying your Google or email sign-in and restoring your account.</p>
          </div>
        </article>

        <article class="auth-card card" aria-live="polite">
          @if (errorMessage()) {
            <div class="auth-status auth-status--error" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <div>
                <strong>We couldn't complete sign in</strong>
                <p>{{ errorMessage() }}</p>
              </div>
            </div>
          } @else {
            <div class="auth-status">
              <span class="spinner" aria-hidden="true"></span>
              <div>
                <strong>Completing authentication</strong>
                <p>Please wait while we send you to your destination.</p>
              </div>
            </div>
          }

          <p class="auth-copy">If this takes longer than expected, you can return to the login page and try again.</p>
          <div class="auth-footer">
            <p class="tiny-copy mb-0">Need another route?</p>
            <a class="auth-link" routerLink="/login">Back to sign in</a>
          </div>
        </article>
      </section>
    </main>
  `,
  styleUrl: './auth-page.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackPageComponent implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    try {
      const callbackUrl = typeof window !== 'undefined' ? window.location.href : '';
      const returnUrl = await this.authService.handleOAuthCallback(callbackUrl);

      if (typeof window !== 'undefined') {
        window.location.replace(returnUrl);
        return;
      }
    } catch (error) {
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'We could not finish signing you in.');
    }
  }
}
