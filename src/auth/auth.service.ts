import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<string | null>(null);
  showLoginModal = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('madniUser');
        if (storedUser) {
            this.currentUser.set(storedUser);
        }
    }
    
    effect(() => {
      if (typeof window !== 'undefined') {
        const user = this.currentUser();
        if (user) {
          localStorage.setItem('madniUser', user);
        } else {
          localStorage.removeItem('madniUser');
        }
      }
    });
  }

  login(name: string): void {
    if (name.trim()) {
      this.currentUser.set(name.trim());
      this.showLoginModal.set(false);
    }
  }

  logout(): void {
    this.currentUser.set(null);
  }
}