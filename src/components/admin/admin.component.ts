import { Component, ChangeDetectionStrategy, signal, inject, effect, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';
import { OrderService } from '../../services/order.service';

type AdminTab = 'dashboard' | 'orders' | 'intelligence';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ScrollAnimateDirective],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  geminiService = inject(GeminiService);
  orderService = inject(OrderService);

  activeTab = signal<AdminTab>('dashboard');
  insights = signal<string | null>(null);
  isLoadingInsights = signal(false);

  // Simulated data
  private totalRevenue = 125430;
  private pendingOrders = 12;
  private lowStockItems = 3;

  // Signals for display animation
  displayRevenue = signal(0);
  displayPendingOrders = signal(0);
  displayLowStockItems = signal(0);

  orders = computed(() => this.orderService.allOrders());

  constructor() {
    effect(() => {
        if (this.activeTab() === 'dashboard') {
            this.animateDashboardNumbers();
        }
    });
  }

  private animateDashboardNumbers(): void {
    this.animateCount(this.totalRevenue, this.displayRevenue);
    this.animateCount(this.pendingOrders, this.displayPendingOrders);
    this.animateCount(this.lowStockItems, this.displayLowStockItems);
  }

  private animateCount(target: number, displaySignal: WritableSignal<number>): void {
    displaySignal.set(0);
    const duration = 1500; // ms
    const stepTime = 20; // ms
    if (target === 0) {
        displaySignal.set(0);
        return;
    }
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            displaySignal.set(target);
            clearInterval(timer);
        } else {
            displaySignal.set(Math.ceil(current));
        }
    }, stepTime);
  }

  selectTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  generateInsights(): void {
      this.isLoadingInsights.set(true);
      this.insights.set(null);
      this.geminiService.getBusinessInsights().then(result => {
          this.insights.set(result);
          this.isLoadingInsights.set(false);
      }).catch(err => {
          this.insights.set('An error occurred while generating insights.');
          this.isLoadingInsights.set(false);
      });
  }
}