import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ConsultationService } from '../core/services/consultation.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-consultation-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="consultation-shell">
      <section class="consultation-grid" aria-labelledby="consultation-title">
        <article class="consultation-intro">
          <p class="eyebrow">24/7 NRI Services</p>
          <h1 id="consultation-title">Request free Consultation</h1>
          <p class="consultation-lead">
            Tell us a few basics and our team will reach out with the next steps.
          </p>

          <div class="consultation-highlights" aria-label="Consultation benefits">
            <div class="consultation-highlight">
              <i class="bi bi-calendar2-check" aria-hidden="true"></i>
              <div>
                <strong>Quick response</strong>
                <p>We review new requests as soon as possible.</p>
              </div>
            </div>
            <div class="consultation-highlight">
              <i class="bi bi-shield-check" aria-hidden="true"></i>
              <div>
                <strong>Secure handling</strong>
                <p>Your request is stored in Supabase for follow-up.</p>
              </div>
            </div>
          </div>
        </article>

        <article class="consultation-card card" aria-labelledby="request-form-title">
          <div class="consultation-card-header">
            <p class="eyebrow">Free consultation form</p>
            <h2 id="request-form-title" class="h4 fw-bold text-navy">Enter your details</h2>
            <p class="muted">We’ll use these details to contact you and understand your location.</p>
          </div>

          @if (successMessage()) {
            <div class="status status--success" role="status" aria-live="polite">
              <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
              <div>
                <strong>Request submitted</strong>
                <p>{{ successMessage() }}</p>
              </div>
            </div>
          }

          @if (errorMessage()) {
            <div class="status status--error" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <div>
                <strong>We couldn’t submit your request</strong>
                <p>{{ errorMessage() }}</p>
              </div>
            </div>
          }

          <form class="consultation-form" [formGroup]="consultationForm" (ngSubmit)="submitRequest()">
            <label class="field">
              <span>Your name</span>
              <input formControlName="name" type="text" placeholder="Raj Palanivel" [class.is-invalid]="isInvalid('name')" />
              @if (isInvalid('name')) {
                <p class="field-error">Please enter your name.</p>
              }
            </label>

            <label class="field">
              <span>Phone number</span>
              <input formControlName="phoneNumber" type="tel" placeholder="+91 98765 43210" [class.is-invalid]="isInvalid('phoneNumber')" />
              @if (isInvalid('phoneNumber')) {
                <p class="field-error">Please enter a valid phone number.</p>
              }
            </label>

            <label class="field">
              <span>City</span>
              <input formControlName="city" type="text" placeholder="Chennai" [class.is-invalid]="isInvalid('city')" />
              @if (isInvalid('city')) {
                <p class="field-error">Please enter your city.</p>
              }
            </label>

            <label class="field">
              <span>Country</span>
              <input formControlName="country" type="text" placeholder="India" [class.is-invalid]="isInvalid('country')" />
              @if (isInvalid('country')) {
                <p class="field-error">Please enter your country.</p>
              }
            </label>

            <button type="submit" class="consultation-submit" [disabled]="submitting()" [attr.aria-busy]="submitting()">
              @if (submitting()) {
                <span class="spinner" aria-hidden="true"></span>
                Submitting...
              } @else {
                Submit Request
              }
            </button>
          </form>

          <div class="consultation-footer">
            <a routerLink="/" class="link-button">Back to services</a>
            <a routerLink="/contact" class="link-button">Contact us</a>
          </div>
        </article>
      </section>
    </main>
  `,
  styleUrl: './consultation-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultationPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly consultationService = inject(ConsultationService);
  private readonly authService = inject(AuthService);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly consultationForm = this.fb.group({
    name: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.minLength(8)]],
    city: ['', Validators.required],
    country: ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    await this.authService.waitForInitialization();
  }

  async submitRequest(): Promise<void> {
    if (this.consultationForm.invalid) {
      this.consultationForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const value = this.consultationForm.getRawValue();
      const record = await this.consultationService.submitConsultation({
        name: value.name,
        phoneNumber: value.phoneNumber,
        city: value.city,
        country: value.country,
      });

      this.successMessage.set(`Thanks ${record.name || value.name}! We received your request and will contact you soon.`);
      this.consultationForm.reset();
    } catch (error) {
      this.errorMessage.set(error instanceof Error && error.message ? error.message : 'Please try again in a moment.');
    } finally {
      this.submitting.set(false);
    }
  }

  protected isInvalid(controlName: 'name' | 'phoneNumber' | 'city' | 'country'): boolean {
    const control = this.consultationForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}
