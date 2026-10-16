import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface ConsultationRequestInput {
  name: string;
  phoneNumber: string;
  city: string;
  country: string;
}

export interface ConsultationRequestRecord extends ConsultationRequestInput {
  id: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultationService {
  private readonly consultationFunctionUrl = new URL('/functions/v1/submit-consultation', environment.supabaseUrl).toString();

  async submitConsultation(input: ConsultationRequestInput): Promise<ConsultationRequestRecord> {
    const normalized = {
      name: input.name.trim(),
      phoneNumber: input.phoneNumber.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
    };

    const response = await fetch(this.consultationFunctionUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        apikey: environment.supabasePublishableKey,
      },
      body: JSON.stringify(normalized),
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error?: unknown }).error ?? 'Unknown error')
          : 'Unknown error';

      throw new Error(message);
    }

    const record = payload as {
      id?: number;
      name: string;
      phone_number: string;
      city: string;
      country: string;
      created_at?: string;
    };

    return {
      id: record.id ?? Date.now(),
      name: record.name,
      phoneNumber: record.phone_number,
      city: record.city,
      country: record.country,
      created_at: record.created_at ?? new Date().toISOString(),
    };
  }
}
