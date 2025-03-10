import { inject, Injectable } from '@angular/core';
import { SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { SupabasesService } from './supabases.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthSupabaseService {

  private supabase_client = inject(SupabasesService).supabase

  session() {
    this.supabase_client.auth.getSession()
  }

  async signUp(email: string, password: string) {
    let { data, error } = await this.supabase_client.auth.signUp({
      email: email,
      password: password
    })

    if (error) {
      throw new Error(error.message)
    }

    console.log('Registro exitoso:', data);
    return data
  }


  logIn(email: string, password: string) {
    return this.supabase_client.auth.signInWithPassword({ email, password })
  }


  async signOut(): Promise<{ error: any | null }> {
    const { error } = await this.supabase_client.auth.signOut();

    if (error) {
      //console.error('Error al cerrar sesión:', error.message);
      return { error };
    }

    //console.log('Sesión cerrada correctamente.');
    return { error: null };
  }

  /* Manejo del token */

  isLoggeIn() {
    const token = this.getToken()
    if (!token) return false

    return !this.isTokenExpired()
  }

  private isTokenExpired() {
    const token = this.getToken()
    if (!token) return true

    const decode = jwtDecode(token)
    const isTokenExpired = Date.now() >= decode['exp']! * 1000
    if (isTokenExpired) this.logout()

    return isTokenExpired
  }

  getUserDetail() {
    const token = this.getToken()
    if (!token) return null

    const decodeToken: any = jwtDecode(token)
    const userDetail = {
      id: decodeToken.sub,
      email: decodeToken.email,
      //fullname: decodeToken.Field01,
      rol: decodeToken.role
    }
    return userDetail
  }

  logout() {
    localStorage.removeItem('token')
  }

  private getToken() {
    return localStorage.getItem('token')
  }
}
