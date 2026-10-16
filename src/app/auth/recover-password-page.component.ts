import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-recover-password-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-grid" aria-labelledby="recover-title">
        <article class="auth-intro">
          <div class="brand-lockup">
            <span class="brand-mark" aria-hidden="true">
              <i class="bi bi-house-heart-fill"></i>
            </span>
            <div>
              <p class="eyebrow">24/7 NRI Services</p>
              <h2 class="h5 fw-bold mb-0">Reset your password</h2>
            </div>
          </div>

          <div>
            <p class="eyebrow">Account recovery</p>
            <h1 id="recover-title">Get a password reset link</h1>
            <p class="auth-lead mt-3">We’ll send a secure reset link to your email address so you can choose a new password.</p>
          </div>

          <ul class="benefits" aria-label="Password reset help">
            <li><i class="bi bi-envelope-check" aria-hidden="true"></i><span>Reset links are sent to the email address on your account.</span></li>
            <li><i class="bi bi-shield-lock" aria-hidden="true"></i><span>After confirming the link, you can set a new password safely.</span></li>
          </ul>
        </article>

        <article class="auth-card card" aria-labelledby="recover-heading">
          <div class="auth-card-header">
            <p class="eyebrow">Forgot password</p>
            <h2 id="recover-heading" class="h4 fw-bold text-navy">Send reset email</h2>
            <p class="auth-copy">Use the email tied to your Supabase account.</p>
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
                <strong>We couldn't send the reset email</strong>
                <p>{{ errorMessage() }}</p>
              </div>
            </div>
          }

          @if (infoMessage()) {
            <div class="auth-status" role="status" aria-live="polite">
              <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
              <div>
                <strong>Reset email sent</strong>
                <p>{{ infoMessage() }}</p>
              </div>
            </div>
          }

          <form class="auth-form" [formGroup]="recoverForm" (ngSubmit)="sendResetEmail()">
            <div class="field-grid">
              <label class="field">
                <span>Email address</span>
                <input formControlName="email" type="email" placeholder="name@example.com" [class.is-invalid]="isControlInvalid('email')" />
                @if (isControlInvalid('email')) {
                  <p class="field-error">Enter a valid email address.</p>
                }
              </label>
            </div>

            <button
              type="submit"
              class="auth-primary-button"
              [disabled]="authService.loading() || isSubmitting()"
              [attr.aria-busy]="authService.loading() || isSubmitting()"
            >
              @if (isSubmitting()) {
                <span class="auth-loader"><span class="spinner" aria-hidden="true"></span>Sending…</span>
              } @else {
                <span>Send reset link</span>
              }
            </button>
          </form>

          <div class="auth-footer">
            <p class="tiny-copy mb-0">Remembered your password?</p>
            <a class="auth-link" routerLink="/login">Back to sign in</a>
          </div>
        </article>
      </section>
    </main>
  `,
  styleUrl: './auth-page.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoverPasswordPageComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly infoMessage = signal('');
  protected readonly recoverForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();

    if (this.authService.isAuthenticated()) {
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    }
  }

  async sendResetEmail(): Promise<void> {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.infoMessage.set('');
    this.isSubmitting.set(true);

    try {
      const { email } = this.recoverForm.getRawValue();
      await this.authService.sendPasswordResetEmail(email);
      this.infoMessage.set('Check your inbox for the reset link. If it does not arrive, check your spam folder.');
    } catch (error) {
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'Unable to send a reset email right now.');
      this.isSubmitting.set(false);
    }
  }

  protected isControlInvalid(controlName: 'email'): boolean {
    const control = this.recoverForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}
