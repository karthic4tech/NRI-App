import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PaymentSummary {
  label: string;
  value: string;
  note: string;
}

interface PaymentItem {
  reference: string;
  task: string;
  amount: string;
  status: string;
  dueDate: string;
}

@Component({
  selector: 'app-payment-status-page',
  imports: [RouterLink],
  template: `
    <main class="screen-shell">
      <header class="screen-header">
        <div>
          <p class="eyebrow">Payment Center</p>
          <h2>Payment Status</h2>
        </div>

        <a class="primary-link" routerLink="/">Back to dashboard</a>
      </header>

      <section class="summary-grid">
        @for (card of summaryCards; track card.label) {
          <article class="card summary-card">
            <p class="eyebrow">{{ card.label }}</p>
            <h3>{{ card.value }}</h3>
            <p class="muted">{{ card.note }}</p>
          </article>
        }
      </section>

      <section class="card panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Mock payment ledger</p>
            <h3>Payments linked to tasks</h3>
          </div>
          <span class="status-pill">Updated just now</span>
        </div>

        <div class="payment-list">
          @for (payment of payments; track payment.reference) {
            <article class="payment-row">
              <div>
                <p class="task-title">{{ payment.reference }}</p>
                <p class="muted">{{ payment.task }}</p>
              </div>

              <div class="payment-meta">
                <strong>{{ payment.amount }}</strong>
                <span class="status-pill">{{ payment.status }}</span>
                <small>{{ payment.dueDate }}</small>
              </div>
            </article>
          }
        </div>
      </section>
    </main>
  `,
  styleUrl: './payment-status-page.component.scss',
})
export class PaymentStatusPageComponent {
  protected readonly summaryCards: PaymentSummary[] = [
    { label: 'Pending release', value: '04', note: 'Awaiting approval before payout' },
    { label: 'Completed paid', value: '12', note: 'Settled successfully' },
    { label: 'Overdue', value: '01', note: 'Needs immediate review' },
    { label: 'Total outstanding', value: '$2,480', note: 'Mock balance across open tasks' },
  ];

  protected readonly payments: PaymentItem[] = [
    { reference: 'PAY-2026-1042', task: 'Passport renewal', amount: '$380', status: 'Pending', dueDate: 'Due today' },
    { reference: 'PAY-2026-1038', task: 'Address proof', amount: '$210', status: 'In review', dueDate: 'Due tomorrow' },
    { reference: 'PAY-2026-1021', task: 'PAN update', amount: '$690', status: 'Completed', dueDate: 'Paid yesterday' },
    { reference: 'PAY-2026-1014', task: 'Utility bill verification', amount: '$1,200', status: 'Overdue', dueDate: 'Overdue by 2 days' },
  ];
}
