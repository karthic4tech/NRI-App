import { NgOptimizedImage } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  image: string;
  imageAlt: string;
  services: readonly string[];
}

interface HowItWorksStep {
  title: string;
  description: string;
  icon: string;
}

const SERVICE_CATEGORIES: readonly ServiceCategory[] = [
  {
    id: 'property-management',
    title: 'Property Management',
    description: 'Manage and maintain your property in India without being physically present.',
    icon: 'house-check-fill',
    accent: 'Tamil Nadu focus',
    image: 'assets/images/property-management.jpg',
    imageAlt: 'Modern Indian home representing property management support in India',
    services: [
      'Property inspection and verification',
      'Rental property management',
      'Tenant coordination and rent follow-up',
      'Property maintenance and repairs',
      'Occupancy checks and handover support',
    ],
  },
  {
    id: 'legal-documentation',
    title: 'Legal & Property Disputes',
    description: 'Keep property papers, family records, and legal coordination organized and compliant.',
    icon: 'file-earmark-text-fill',
    accent: 'Document safe-keeping',
    image: 'assets/images/legal-property.jpg',
    imageAlt: 'Legal professional reviewing property documents and consultation paperwork',
    services: [
      'Title review and document collection',
      'Power of attorney coordination',
      'Affidavit and notarization support',
      'Advocate and registration follow-up',
      'Certified copy retrieval',
    ],
  },
  {
    id: 'finance-compliance',
    title: 'Taxation & Repatriation',
    description: 'Stay on top of banking, tax, and remittance obligations from overseas.',
    icon: 'cash-coin',
    accent: 'Transparent follow-up',
    image: 'assets/images/taxation-repatriation.jpg',
    imageAlt: 'Taxation and repatriation concept with financial documents and transfer coordination',
    services: [
      'Banking assistance and coordination',
      'Utility bill tracking and follow-up',
      'Tax and compliance reminders',
      'NRO / NRE support coordination',
      'Investment paperwork assistance',
    ],
  },
  {
    id: 'banking-investments',
    title: 'Banking & Investments',
    description: 'Support parents and family with reliable help on the ground in India.',
    icon: 'bank2',
    accent: 'Compassionate care',
    image: 'assets/images/banking-investments.jpg',
    imageAlt: 'Banking and investment planning dashboard with charts and financial analysis',
    services: [
      'Parent visit and welfare checks',
      'Hospital accompaniment coordination',
      'School and college admin help',
      'Household support and errands',
      'Event and appointment coordination',
    ],
  },
  {
    id: 'family-support-services',
    title: 'Family Support Services',
    description: 'Fast on-ground support when you need something handled urgently in India.',
    icon: 'people-fill',
    accent: 'Rapid response',
    image: 'assets/images/family-support-services.jpg',
    imageAlt: 'Adult child supporting elderly parents and staying connected across locations',
    services: [
      'Urgent document pickup and delivery',
      'Airport and travel coordination',
      'Short-notice local errands',
      'Emergency home access support',
      'Utility transfer or closure assistance',
    ],
  },
] as const;

const HOW_IT_WORKS: readonly HowItWorksStep[] = [
  {
    title: 'Select a service',
    description: 'Browse the categories and pick the area where you need support.',
    icon: 'grid-1x2-fill',
  },
  {
    title: 'Submit a request',
    description: 'Use the existing request flow to capture the basics and preferred follow-up.',
    icon: 'send-fill',
  },
  {
    title: 'Receive a quotation',
    description: 'Review the estimate and decide how you want to proceed.',
    icon: 'receipt-cutoff',
  },
  {
    title: 'Track completion',
    description: 'Local support handles the on-ground work and keeps you updated.',
    icon: 'check2-circle',
  },
] as const;

@Component({
  selector: 'app-nri-services-page',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <main class="container-fluid px-3 px-md-4 py-4 py-lg-5 page-shell">
      <section class="card border-0 rounded-4 shadow-sm overflow-hidden hero-section mb-3 mb-lg-4">
        <div class="row g-0 align-items-center">
          <div class="col-lg-6 p-4 p-lg-5">
            <p class="eyebrow text-uppercase mb-2">Tamil Nadu-first coordination for NRIs</p>
            <h1 class="display-5 fw-bold text-navy hero-title">India Is Home. We're Here to Take Care of It.</h1>
            <p class="lead text-secondary mt-3 mb-4 hero-lead">
              Manage your property, legal responsibilities, finances, and family needs in India — wherever life takes you.
            </p>

            <div class="d-flex flex-wrap gap-2 gap-md-3 mb-3 hero-actions">
              <a class="btn nri-btn-primary" href="#service-categories">
                <i class="bi bi-grid-1x2-fill me-2" aria-hidden="true"></i>
                Explore Services
              </a>
              <a class="btn nri-btn-secondary" routerLink="/tasks/new">
                <i class="bi bi-send-fill me-2" aria-hidden="true"></i>
                Request a Service
              </a>
            </div>

            <p class="fw-semibold text-primary mb-3">Reliable local support for your responsibilities in India.</p>

            <div class="d-flex flex-wrap gap-2" aria-label="Service highlights">
              @for (point of trustPoints; track point) {
                <span class="badge rounded-pill text-primary-emphasis bg-soft-blue px-3 py-2">{{ point }}</span>
              }
            </div>
          </div>

          <div class="col-lg-6 p-4 p-lg-5">
            <figure class="hero-figure m-0 position-relative">
              @if (!isImageBroken('hero')) {
                <img
                  ngSrc="assets/images/nri-base-2.jpg"
                  width="800"
                  height="533"
                  priority
                  sizes="(max-width: 960px) 100vw, 46vw"
                  alt="An NRI services illustration showing India, property, and business coordination support"
                  class="img-fluid w-100 h-100 object-fit-cover rounded-4 hero-image"
                  (error)="markImageBroken('hero')"
                />
              } @else {
                <div class="image-fallback image-fallback--hero rounded-4" aria-hidden="true">
                  <span>India at a glance</span>
                </div>
              }

              <div class="hero-caption card border-0 rounded-4 shadow-sm" aria-hidden="true">
                <strong class="d-block text-navy mb-1">Trusted local coordination</strong>
                <span class="text-secondary">Property • Legal • Finance • Family</span>
              </div>
            </figure>
          </div>
        </div>
      </section>

      <section class="card border-0 rounded-4 shadow-sm mb-3 mb-lg-4 intro-strip">
        <div class="row g-3 align-items-center p-4 p-lg-4">
          <div class="col-lg-8">
            <p class="eyebrow text-uppercase mb-2">Built for peace of mind</p>
            <h2 class="h3 fw-bold text-navy mb-0">One place for property, legal, financial, and family support</h2>
          </div>
          <div class="col-lg-4">
            <p class="text-secondary mb-0">
              Designed for NRIs living abroad who need dependable local coordination in India, starting with Tamil Nadu.
            </p>
          </div>
        </div>
      </section>

      <section id="service-categories" class="services-section mb-3 mb-lg-4">
        <div class="section-heading mb-3">
          <p class="eyebrow text-uppercase mb-2">Service categories</p>
          <h2 class="h3 fw-bold text-navy mb-2">Choose the area that needs support</h2>
          <p class="text-secondary mb-0">
            Select a category to review example services, then move into the existing request flow when you're ready.
          </p>
        </div>

        <div class="row row-cols-1 row-cols-md-2 row-cols-xxl-5 g-3 g-lg-4">
          @for (category of serviceCategories; track category.id) {
            <div class="col">
              <article class="card border-0 rounded-4 shadow-sm service-card h-100" [class.is-selected]="selectedCategoryId() === category.id">
                <div class="ratio ratio-4x3 rounded-top-4 overflow-hidden">
                  @if (!isImageBroken(category.id)) {
                    <img
                      [ngSrc]="category.image"
                      width="960"
                      height="640"
                      [alt]="category.imageAlt"
                      sizes="(max-width: 1120px) 100vw, 20vw"
                      class="w-100 h-100 object-fit-cover"
                      (error)="markImageBroken(category.id)"
                    />
                  } @else {
                    <div class="image-fallback" aria-hidden="true">
                      <span>{{ category.title }}</span>
                    </div>
                  }
                </div>

                <div class="p-3 p-lg-4 d-grid gap-3">
                  <div class="d-flex align-items-center justify-content-between gap-2">
                    <div class="nri-icon-btn" aria-hidden="true">
                      <i class="bi bi-{{ category.icon }}"></i>
                    </div>
                    <span class="badge rounded-pill text-primary-emphasis bg-soft-blue px-3 py-2">{{ category.accent }}</span>
                  </div>

                  <div>
                    <h3 class="h5 fw-bold text-navy mb-2">{{ category.title }}</h3>
                    <p class="text-secondary mb-0">{{ category.description }}</p>
                  </div>

                  <ul class="list-unstyled d-grid gap-2 mb-0 service-list">
                    @for (service of category.services; track service) {
                      <li class="d-flex align-items-start gap-2">
                        <i class="bi bi-check2-circle text-teal mt-1" aria-hidden="true"></i>
                        <span>{{ service }}</span>
                      </li>
                    }
                  </ul>

                  <button
                    type="button"
                    class="btn nri-btn-icon-secondary w-100"
                    (click)="selectCategory(category.id)"
                    [attr.aria-pressed]="selectedCategoryId() === category.id"
                  >
                    <i class="bi bi-arrow-right-circle me-2" aria-hidden="true"></i>
                    Explore Services
                  </button>
                </div>
              </article>
            </div>
          }
        </div>
      </section>

      <section class="card border-0 rounded-4 shadow-sm p-4 p-lg-4 mb-3 mb-lg-4 selection-panel" aria-live="polite">
        <div class="row g-3 align-items-center">
          <div class="col-lg-4">
            <p class="eyebrow text-uppercase mb-2">Selected category</p>
            <h2 class="h3 fw-bold text-navy mb-2">{{ selectedCategory().title }}</h2>
            <p class="text-secondary mb-0">{{ selectedCategory().description }}</p>
          </div>

          <div class="col-lg-5">
            <div class="d-flex flex-wrap gap-2 selection-services">
              @for (service of selectedCategory().services; track service) {
                <span class="badge rounded-pill text-primary-emphasis bg-soft-blue px-3 py-2">{{ service }}</span>
              }
            </div>
          </div>

          <div class="col-lg-3 text-lg-end d-grid">
            <a class="btn nri-btn-primary w-100" routerLink="/tasks/new">
              <i class="bi bi-chat-dots-fill me-2" aria-hidden="true"></i>
              Request this service
            </a>
          </div>
        </div>
      </section>

      <section class="how-section">
        <div class="section-heading mb-3">
          <p class="eyebrow text-uppercase mb-2">How it works</p>
          <h2 class="h3 fw-bold text-navy mb-0">Simple steps from request to completion</h2>
        </div>

        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3 g-lg-4">
          @for (step of howItWorks; track step.title) {
            <div class="col">
              <article class="card border-0 rounded-4 shadow-sm h-100 p-4 process-card">
                <div class="nri-icon-btn nri-icon-btn-soft mb-3" aria-hidden="true">
                  <i class="bi bi-{{ step.icon }}"></i>
                </div>
                <h3 class="h5 fw-bold text-navy mb-2">{{ step.title }}</h3>
                <p class="text-secondary mb-0">{{ step.description }}</p>
              </article>
            </div>
          }
        </div>
      </section>
    </main>
  `,
  styleUrl: './nri-services-page.component.scss',
})
export class NriServicesPageComponent {
  protected readonly serviceCategories = SERVICE_CATEGORIES;

  protected readonly trustPoints = ['Tamil Nadu-first support', 'Clear updates and coordination', 'One simple request flow'];

  protected readonly howItWorks = HOW_IT_WORKS;

  protected readonly selectedCategoryId = signal(SERVICE_CATEGORIES[0].id);

  protected readonly selectedCategory = computed(() => {
    return this.serviceCategories.find((category) => category.id === this.selectedCategoryId()) ?? this.serviceCategories[0];
  });

  protected readonly brokenImages = signal<Record<string, true>>({});

  protected selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
  }

  protected markImageBroken(imageId: string): void {
    this.brokenImages.update((current) => ({ ...current, [imageId]: true }));
  }

  protected isImageBroken(imageId: string): boolean {
    return this.brokenImages()[imageId] === true;
  }
}
