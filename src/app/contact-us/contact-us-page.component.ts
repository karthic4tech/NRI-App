import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-us-page',
  imports: [RouterLink],
  template: `
    <main class="container-fluid px-3 px-md-4 py-4 py-lg-5 contact-shell">
      <section class="card border-0 rounded-4 shadow-sm overflow-hidden contact-hero mb-3 mb-lg-4">
        <div class="row g-0 align-items-stretch">
          <div class="col-lg-7 p-4 p-lg-5">
            <p class="eyebrow text-uppercase mb-2">Get in touch</p>
            <h1 class="display-5 fw-bold text-navy mb-3">Contact Us</h1>
            <p class="lead text-secondary mb-4">
              Reach out to our NRI support team for property, legal, finance, and family coordination requests in India.
            </p>

            <div class="d-flex flex-wrap gap-2 gap-md-3">
              <a class="btn nri-btn-primary" routerLink="/tasks/new">
                <i class="bi bi-chat-dots-fill me-2" aria-hidden="true"></i>
                Request a Service
              </a>
              <a class="btn nri-btn-secondary" routerLink="/services">
                <i class="bi bi-grid-1x2-fill me-2" aria-hidden="true"></i>
                Explore Services
              </a>
            </div>
          </div>

          <div class="col-lg-5 p-4 p-lg-5 contact-card-wrap">
            <article class="card border-0 rounded-4 shadow-sm contact-card h-100">
              <div class="p-4 p-lg-4 d-grid gap-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="nri-icon-btn nri-icon-btn-soft" aria-hidden="true">
                    <i class="bi bi-geo-alt-fill"></i>
                  </div>
                  <div>
                    <p class="eyebrow mb-1">Contact person</p>
                    <h2 class="h5 fw-bold text-navy mb-0">Raj Palanivel</h2>
                  </div>
                </div>

                <div class="contact-item">
                  <i class="bi bi-house-door-fill text-teal" aria-hidden="true"></i>
                  <div>
                    <span class="contact-label">Address</span>
                    <p class="mb-0 text-secondary">24/7 NRI Services Hub, 12 Anna Salai, Chennai, Tamil Nadu 600002, India</p>
                  </div>
                </div>

                <div class="contact-item">
                  <i class="bi bi-telephone-fill text-teal" aria-hidden="true"></i>
                  <div>
                    <span class="contact-label">Telephone</span>
                    <p class="mb-0 text-secondary">+91 98765 43210</p>
                  </div>
                </div>

                <div class="contact-item">
                  <i class="bi bi-envelope-fill text-teal" aria-hidden="true"></i>
                  <div>
                    <span class="contact-label">Email</span>
                    <p class="mb-0 text-secondary">support@nriservices.example</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="card border-0 rounded-4 shadow-sm p-4 p-lg-4 contact-details">
        <div class="row g-3 g-lg-4">
          <div class="col-md-4">
            <div class="contact-mini-card h-100">
              <i class="bi bi-clock-history text-teal"></i>
              <h3 class="h6 fw-bold text-navy mt-3">Support hours</h3>
              <p class="text-secondary mb-0">Monday to Saturday, 9:00 AM to 7:00 PM IST</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="contact-mini-card h-100">
              <i class="bi bi-send-check-fill text-teal"></i>
              <h3 class="h6 fw-bold text-navy mt-3">Response time</h3>
              <p class="text-secondary mb-0">We aim to respond to new service requests within one business day.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="contact-mini-card h-100">
              <i class="bi bi-geo-alt text-teal"></i>
              <h3 class="h6 fw-bold text-navy mt-3">Coverage</h3>
              <p class="text-secondary mb-0">Currently focused on Tamil Nadu with support coordination across India.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrl: './contact-us-page.component.scss',
})
export class ContactUsPageComponent {}
