import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { API_URL } from '../config'

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string; 
}

@Injectable({
    providedIn: "root"
})

export class AuthService {

    private apiUrl = `${API_URL}/auth`; // Replace with your backend API URL

    constructor(private http: HttpClient) {}
    
    login(data: LoginRequest): Observable<LoginResponse> {
        return this.http
            .post<LoginResponse>(`${this.apiUrl}/login`, data)
            .pipe(tap((resp) => localStorage.setItem('token', resp.token)));
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
    logout(): void {
        localStorage.removeItem('token')
    }
}
