import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: User;
  msg: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    let storedUser = null;
    if (this.isBrowser) {
      const userString = localStorage.getItem('currentUser');
      storedUser = userString ? JSON.parse(userString) : null;
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            this.setUser(response.user);
          }
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            this.setUser(response.user);
            // Trigger reload of cart and favorites
            if (this.isBrowser) {
              window.dispatchEvent(new Event('user-logged-in'));
            }
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(name: string, email: string, profileImage?: string): Observable<{ user: User; msg: string }> {
    const body: any = { name, email };
    if (profileImage) {
      body.profileImage = profileImage;
    }
    
    return this.http.put<{ user: User; msg: string }>(
      `${this.apiUrl}/profile`,
      body,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        this.setUser(response.user);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ msg: string }> {
    return this.http.put<{ msg: string }>(
      `${this.apiUrl}/change-password`,
      { currentPassword, newPassword },
      { headers: this.getAuthHeaders() }
    );
  }

  private getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
  }

  private setUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
