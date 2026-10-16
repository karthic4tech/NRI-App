import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-grid" aria-labelledby="register-title">
        <article class="auth-intro">
          <div class="brand-lockup">
            <img ngSrc="assets/logo/nri-services-logo.png" width="320" height="133" priority alt="24/7 NRI Services" class="brand-logo" />
          </div>

          <div>
            <p class="eyebrow">Register</p>
            <h1 id="register-title">Start with 24/7 NRI Services</h1>
            <p class="auth-lead mt-3">Set up your account to manage responsibilities in India from anywhere in the world.</p>
          </div>

          <ul class="benefits" aria-label="Reasons to create an account">
            <li><i class="bi bi-folder2-open" aria-hidden="true"></i><span>Track service requests, updates, and payment milestones in one place.</span></li>
            <li><i class="bi bi-chat-dots" aria-hidden="true"></i><span>Coordinate legal, property, banking, and family support with confidence.</span></li>
          </ul>
        </article>

        <article class="auth-card card" aria-labelledby="create-account-heading">
          <div class="auth-card-header">
            <p class="eyebrow">Email registration</p>
            <h2 id="create-account-heading" class="h4 fw-bold text-navy">Create your account</h2>
            <p class="auth-copy">You can also use Google to sign in once your account is ready.</p>
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
                <strong>Registration failed</strong>
                <p>{{ errorMessage() }}</p>
              </div>
            </div>
          }

          @if (infoMessage()) {
            <div class="auth-status" aria-live="polite">
              <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
              <div>
                <strong>Account created</strong>
                <p>{{ infoMessage() }}</p>
              </div>
            </div>
          }

          <button
            type="button"
            class="google-button"
            [disabled]="authService.loading() || isSubmitting()"
            [attr.aria-busy]="authService.loading() || isSubmitting()"
            (click)="continueWithGoogle()"
          >
            <svg class="google-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <path fill="#EA4335" d="M24 9.5c3.2 0 6.2 1.1 8.5 3l6.3-6.3C35.1 2.8 30 1 24 1 14.6 1 6.5 6.4 2.6 14.3l7.4 5.8C12.2 13 17.6 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.8c-.3 2-1.7 5-4.9 7.1l7.6 5.9c4.5-4.2 7-10.4 7-16.9z"/>
              <path fill="#FBBC05" d="M10 28.9A14.2 14.2 0 0 1 9.2 24c0-1.7.3-3.3.8-4.8L2.6 13.4A23.8 23.8 0 0 0 0 24c0 3.8.9 7.4 2.6 10.6l7.4-5.7z"/>
              <path fill="#34A853" d="M24 48c6 0 11.1-2 14.8-5.4l-7-5.4c-2 1.3-4.7 2.3-7.8 2.3-6.4 0-11.8-3.6-14-8.8l-7.4 5.7C6.4 41.8 14.6 48 24 48z"/>
            </svg>
            @if (isSubmitting()) {
              <span class="auth-loader"><span class="spinner" aria-hidden="true"></span>Redirecting…</span>
            } @else {
              <span>Continue with Google</span>
            }
          </button>

          <form class="auth-form" [formGroup]="registerForm" (ngSubmit)="createAccount()">
            <div class="field-grid">
              <label class="field">
                <span>Your name</span>
                <input formControlName="fullName" type="text" placeholder="Raj Palanivel" [class.is-invalid]="isControlInvalid('fullName')" />
                @if (isControlInvalid('fullName')) {
                  <p class="field-error">Please enter your name.</p>
                }
              </label>

              <label class="field">
                <span>Email address</span>
                <input formControlName="email" type="email" placeholder="name@example.com" [class.is-invalid]="isControlInvalid('email')" />
                @if (isControlInvalid('email')) {
                  <p class="field-error">Enter a valid email address.</p>
                }
              </label>

              <label class="field">
                <span>Password</span>
                <input formControlName="password" type="password" placeholder="Create a strong password" [class.is-invalid]="isControlInvalid('password')" />
                @if (isControlInvalid('password')) {
                  <p class="field-error">Password must be at least 8 characters long.</p>
                }
              </label>

              <label class="field">
                <span>Confirm password</span>
                <input formControlName="confirmPassword" type="password" placeholder="Re-enter your password" [class.is-invalid]="isControlInvalid('confirmPassword') || registerForm.hasError('passwordMismatch')" />
                @if (registerForm.hasError('passwordMismatch') && registerForm.touched) {
                  <p class="field-error">Passwords do not match.</p>
                } @else if (isControlInvalid('confirmPassword')) {
                  <p class="field-error">Please confirm your password.</p>
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
                <span class="auth-loader"><span class="spinner" aria-hidden="true"></span>Creating account…</span>
              } @else {
                <span>Create account</span>
              }
            </button>
          </form>

          <div class="auth-footer">
            <p class="tiny-copy mb-0">Already have an account?</p>
            <a class="auth-link" routerLink="/login" [queryParams]="loginQueryParams">Sign in instead</a>
          </div>
        </article>
      </section>
    </main>
  `,
  styleUrl: './auth-page.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly infoMessage = signal('');
  protected readonly returnUrl = this.resolveReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
  protected readonly loginQueryParams = this.returnUrl ? { returnUrl: this.returnUrl } : undefined;

  protected readonly registerForm = this.fb.group(
    {
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();

    if (this.authService.isAuthenticated()) {
      await this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    }
  }

  async createAccount(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.infoMessage.set('');

    try {
      const { fullName, email, password } = this.registerForm.getRawValue();
      const session = await this.authService.signUpWithEmail({
        fullName,
        email,
        password,
        returnUrl: this.returnUrl,
      });

      if (session) {
        await this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
        return;
      }

      this.infoMessage.set('Please check your inbox to confirm your email address, then sign in with Google or your password.');
      this.isSubmitting.set(false);
    } catch (error) {
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'Unable to create your account right now.');
      this.isSubmitting.set(false);
    }
  }

  async continueWithGoogle(): Promise<void> {
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.isSubmitting.set(true);

    try {
      await this.authService.signInWithGoogle(this.returnUrl);
    } catch (error) {
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'Unable to start Google sign-in right now.');
      this.isSubmitting.set(false);
    }
  }

  protected isControlInvalid(controlName: 'fullName' | 'email' | 'password' | 'confirmPassword'): boolean {
    const control = this.registerForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private resolveReturnUrl(returnUrl: string | null): string {
    if (returnUrl?.startsWith('/')) {
      return returnUrl;
    }

    return '/dashboard';
  }
}
