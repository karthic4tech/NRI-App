import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword || password === confirmPassword) {
    return null;
  }

  return { passwordMismatch: true };
}

@Component({
  selector: 'app-update-password-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-grid" aria-labelledby="update-password-title">
        <article class="auth-intro">
          <div class="brand-lockup">
            <span class="brand-mark" aria-hidden="true">
              <i class="bi bi-house-heart-fill"></i>
            </span>
            <div>
              <p class="eyebrow">24/7 NRI Services</p>
              <h2 class="h5 fw-bold mb-0">Create a new password</h2>
            </div>
          </div>

          <div>
            <p class="eyebrow">Password reset</p>
            <h1 id="update-password-title">Choose a new secure password</h1>
            <p class="auth-lead mt-3">After opening the reset link, set a new password to regain access to your account.</p>
          </div>

          <ul class="benefits" aria-label="Password reset steps">
            <li><i class="bi bi-key" aria-hidden="true"></i><span>Use a strong password you haven’t used before.</span></li>
            <li><i class="bi bi-arrow-repeat" aria-hidden="true"></i><span>You’ll return to the dashboard after updating it.</span></li>
          </ul>
        </article>

        <article class="auth-card card" aria-labelledby="update-password-heading">
          <div class="auth-card-header">
            <p class="eyebrow">Set password</p>
            <h2 id="update-password-heading" class="h4 fw-bold text-navy">Update your password</h2>
            <p class="auth-copy">Enter a new password for your account.</p>
          </div>

          @if (authService.loading()) {
            <div class="auth-status" aria-live="polite">
              <span class="spinner" aria-hidden="true"></span>
              <div>
                <strong>Preparing your session</strong>
                <p>Checking whether the reset link is ready to use...</p>
              </div>
            </div>
          }

          @if (errorMessage()) {
            <div class="auth-status auth-status--error" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <div>
                <strong>We couldn't update your password</strong>
                <p>{{ errorMessage() }}</p>
              </div>
            </div>
          }

          @if (infoMessage()) {
            <div class="auth-status" role="status" aria-live="polite">
              <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
              <div>
                <strong>Password updated</strong>
                <p>{{ infoMessage() }}</p>
              </div>
            </div>
          }

          <form class="auth-form" [formGroup]="passwordForm" (ngSubmit)="updatePassword()">
            <div class="field-grid">
              <label class="field">
                <span>New password</span>
                <input formControlName="password" type="password" placeholder="Create a new password" [class.is-invalid]="isControlInvalid('password')" />
                @if (isControlInvalid('password')) {
                  <p class="field-error">Password must be at least 8 characters long.</p>
                }
              </label>

              <label class="field">
                <span>Confirm new password</span>
                <input formControlName="confirmPassword" type="password" placeholder="Re-enter the password" [class.is-invalid]="isControlInvalid('confirmPassword') || passwordForm.hasError('passwordMismatch')" />
                @if (passwordForm.hasError('passwordMismatch') && passwordForm.touched) {
                  <p class="field-error">Passwords do not match.</p>
                } @else if (isControlInvalid('confirmPassword')) {
                  <p class="field-error">Please confirm your new password.</p>
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
                <span class="auth-loader"><span class="spinner" aria-hidden="true"></span>Updating…</span>
              } @else {
                <span>Save new password</span>
              }
            </button>
          </form>

          <div class="auth-footer">
            <p class="tiny-copy mb-0">Need to sign in again?</p>
            <a class="auth-link" routerLink="/login">Back to sign in</a>
          </div>
        </article>
      </section>
    </main>
  `,
  styleUrl: './auth-page.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePasswordPageComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly infoMessage = signal('');
  protected readonly passwordForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();

    if (!this.authService.isAuthenticated()) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  async updatePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.infoMessage.set('');
    this.isSubmitting.set(true);

    try {
      const { password } = this.passwordForm.getRawValue();
      await this.authService.updatePassword(password);
      this.infoMessage.set('Your password has been updated. Redirecting you to the dashboard...');
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (error) {
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'Unable to update your password right now.');
      this.isSubmitting.set(false);
    }
  }

  protected isControlInvalid(controlName: 'password' | 'confirmPassword'): boolean {
    const control = this.passwordForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}
