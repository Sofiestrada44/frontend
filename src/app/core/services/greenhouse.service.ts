import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from '../config';
import { AuthService } from './auth.service';

export interface Ultima {
  sistema: string;
  temperatura: number;
  humedad_ambiente: number;
  humedad_suelo: number;
  led_verde_pwm: number;
  led_rojo: number;
  led_blanco: number;
  ventilador: number;
}
export interface MinMax { max: number | null; min: number | null; }
export interface Estadisticas {
  total: number;
  temperatura: MinMax;
  humedad_ambiente: MinMax;
  humedad_suelo: MinMax;
}
export interface PuntoSerie {
  ts: string;
  temperatura: number;
  humedad_ambiente: number;
  humedad_suelo: number;
}

@Injectable({ providedIn: 'root' })
export class GreenhouseService {
  private apiUrl = `${API_URL}/api`;

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  // Todas las rutas /api llevan el header Authorization: Bearer <token>
  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  // Si el backend responde 401 (token vencido o inválido) volvemos al login
  private protegido<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      catchError((err) => {
        if (err.status === 401 || err.status === 422) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }

  ultima(): Observable<Ultima> {
    return this.protegido(this.http.get<Ultima>(`${this.apiUrl}/ultima`, { headers: this.headers() }));
  }

  estadisticas(): Observable<Estadisticas> {
    return this.protegido(this.http.get<Estadisticas>(`${this.apiUrl}/estadisticas`, { headers: this.headers() }));
  }

  serie(minutos = 5): Observable<PuntoSerie[]> {
    return this.protegido(
      this.http.get<PuntoSerie[]>(`${this.apiUrl}/serie?minutos=${minutos}`, { headers: this.headers() })
    );
  }
}