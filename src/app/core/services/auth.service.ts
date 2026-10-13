import { computed, inject, Injectable, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';

export interface SignUpWithEmailInput {
  fullName: string;
  email: string;
  password: string;
  returnUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly sessionSignal = signal<Session | null>(null);
  private readonly readySignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly authSubscription = this.supabase.auth.onAuthStateChange((_event, session) => {
    this.applySession(session);
  }).data.subscription;
  private readonly initialization: Promise<void>;

  readonly session = this.sessionSignal.asReadonly();
  readonly user = computed(() => this.sessionSignal()?.user ?? null);
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly loading = computed(() => !this.readySignal());
  readonly ready = this.readySignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {
    this.initialization = this.restoreAuthenticationState();
  }

  async waitForInitialization(): Promise<void> {
    await this.initialization;
  }

  async getCurrentSession(): Promise<Session | null> {
    await this.waitForInitialization();
    return this.sessionSignal();
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getCurrentSession();
    return session?.user ?? null;
  }

  async signInWithGoogle(returnUrl?: string): Promise<void> {
    this.errorSignal.set(null);

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: this.buildCallbackUrl(returnUrl),
      },
    });

    if (error) {
      throw error;
    }

    if (data.url && typeof window !== 'undefined') {
      window.location.assign(data.url);
    }
  }

  async signUpWithEmail(input: SignUpWithEmailInput): Promise<Session | null> {
    this.errorSignal.set(null);

    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          name: input.fullName,
        },
        emailRedirectTo: this.buildCallbackUrl(input.returnUrl),
      },
    });

    if (error) {
      throw error;
    }

    this.applySession(data.session ?? null);
    return data.session;
  }

  async signInWithEmail(email: string, password: string, returnUrl?: string): Promise<Session | null> {
    this.errorSignal.set(null);

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    this.applySession(data.session ?? null);

    if (data.session) {
      const targetUrl = this.normalizeReturnUrl(returnUrl);
      if (targetUrl && typeof window !== 'undefined') {
        window.location.assign(targetUrl);
      }
    }

    return data.session;
  }

  async handleOAuthCallback(callbackUrl: string): Promise<string> {
    const parsedUrl = new URL(callbackUrl);
    const callbackError = parsedUrl.searchParams.get('error_description') ?? parsedUrl.searchParams.get('error');

    if (callbackError) {
      throw new Error(callbackError);
    }

    const code = parsedUrl.searchParams.get('code');
    if (code) {
      const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);
      if (error) {
        throw error;
      }

      this.applySession(data.session ?? null);
    }

    return this.normalizeReturnUrl(parsedUrl.searchParams.get('returnUrl'));
  }

  async signOut(): Promise<void> {
    this.errorSignal.set(null);

    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw error;
    }

    this.applySession(null);
  }

  private async restoreAuthenticationState(): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        this.errorSignal.set(error.message);
        this.applySession(null);
        return;
      }

      this.applySession(data.session ?? null);
    } finally {
      this.readySignal.set(true);
    }
  }

  private applySession(session: Session | null): void {
    this.sessionSignal.set(session);
    this.errorSignal.set(null);
  }

  private buildCallbackUrl(returnUrl?: string): string {
    const callbackUrl = new URL('/auth/callback', this.getAppOrigin());

    const normalizedReturnUrl = this.normalizeReturnUrl(returnUrl);
    if (normalizedReturnUrl) {
      callbackUrl.searchParams.set('returnUrl', normalizedReturnUrl);
    }

    return callbackUrl.toString();
  }

  private normalizeReturnUrl(returnUrl?: string | null): string {
    const fallbackUrl = '/dashboard';

    if (!returnUrl) {
      return fallbackUrl;
    }

    try {
      const decodedUrl = decodeURIComponent(returnUrl);

      if (decodedUrl.startsWith('/')) {
        return decodedUrl;
      }

      const parsedUrl = new URL(decodedUrl);
      const appOrigin = this.getAppOrigin();

      if (parsedUrl.origin === appOrigin) {
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      return fallbackUrl;
    }

    return fallbackUrl;
  }

  private getAppOrigin(): string {
    if (environment.siteUrl) {
      return environment.siteUrl;
    }

    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }

    return 'http://localhost:4200';
  }
}
