import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { CartService } from './services/cart.service';
import { IntroAnimationComponent } from './components/intro-animation/intro-animation.component';
import { AuthService } from './auth/auth.service';
import { LoginComponent } from './auth/login/login.component';
import { SystemGuardianComponent } from './components/system-guardian/system-guardian.component';

declare var gsap: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ChatbotComponent, IntroAnimationComponent, LoginComponent, SystemGuardianComponent],
})
export class AppComponent implements AfterViewInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  platformId = inject(PLATFORM_ID);
  
  isAiFeaturesMenuOpen = signal(false);
  isCompanyMenuOpen = signal(false);
  isMobileMenuOpen = signal(false);
  showIntro = signal(true);

  // Custom Cursor References
  @ViewChild('cursor') cursor!: ElementRef;
  @ViewChild('cursorDot') cursorDot!: ElementRef;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initCustomCursor();
    }
  }

  private initCustomCursor() {
    const cursor = this.cursor.nativeElement;
    const cursorDot = this.cursorDot.nativeElement;

    // Move cursor with physics delay
    window.addEventListener('mousemove', (e) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
      gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0, ease: 'none' }); // Instant follow for dot
    });

    // Add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .interactive');
    
    // Use delegation or mutation observer in a real app, but for this scope, binding to body is safer
    document.body.addEventListener('mouseover', (e: any) => {
        if (e.target.closest('a') || e.target.closest('button') || e.target.classList.contains('interactive')) {
            cursor.classList.add('hovered');
        } else {
            cursor.classList.remove('hovered');
        }
    });
  }

  onAnimationFinished() {
    this.showIntro.set(false);
  }

  toggleAiFeaturesMenu(): void {
    this.isAiFeaturesMenuOpen.update(v => !v);
    this.isCompanyMenuOpen.set(false);
  }

  toggleCompanyMenu(): void {
    this.isCompanyMenuOpen.update(v => !v);
    this.isAiFeaturesMenuOpen.set(false);
  }
  
  closeMenus(): void {
    this.isAiFeaturesMenuOpen.set(false);
    this.isCompanyMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  toggleCart(): void {
    this.cartService.isCartOpen.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
}