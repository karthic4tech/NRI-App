import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';

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
  private readonly supabase = inject(SupabaseService).client;
  private readonly tableName = 'consultation_requests';

  async submitConsultation(input: ConsultationRequestInput): Promise<ConsultationRequestRecord> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        name: input.name,
        phone_number: input.phoneNumber,
        city: input.city,
        country: input.country,
      })
      .select('id,name,phone_number,city,country,created_at')
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      phoneNumber: data.phone_number,
      city: data.city,
      country: data.country,
      created_at: data.created_at,
    };
  }
}
