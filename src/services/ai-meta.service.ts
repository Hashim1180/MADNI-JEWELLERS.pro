
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Product } from '../types';
import { AuthService } from '../auth/auth.service';
import { ProductService } from './product.service';

export interface UserMeta {
  viewedCategories: Record<string, number>;
  viewedProductIds: number[];
  cartCategoryPreferences: Record<string, number>;
  lastConversationSummary: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiMetaService {
  private authService = inject(AuthService);
  private productService = inject(ProductService);

  // Persistent user meta state
  private userMeta = signal<UserMeta>({
    viewedCategories: {},
    viewedProductIds: [],
    cartCategoryPreferences: {},
    lastConversationSummary: '',
  });

  // Simulated "World State" for AI context (e.g., active promotions, trends)
  private worldState = signal({
    currentPromotion: 'Complimentary polishing with any gold purchase over $5000.',
    trendingCategory: 'Polki Jhumka Earrings',
    season: 'Wedding Season',
  });

  constructor() {
    // Load meta from local storage on init if user is logged in
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        const stored = localStorage.getItem(`madni_meta_${user}`);
        if (stored) {
          try {
            this.userMeta.set(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse user meta', e);
          }
        } else {
            // Reset for new user if no stored data
             this.userMeta.set({
                viewedCategories: {},
                viewedProductIds: [],
                cartCategoryPreferences: {},
                lastConversationSummary: '',
              });
        }
      }
    });

    // Save meta to local storage whenever it changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        localStorage.setItem(`madni_meta_${user}`, JSON.stringify(this.userMeta()));
      }
    });
  }

  // --- Tracking Actions ---

  trackView(product: Product) {
    this.userMeta.update(meta => {
      const newCategories = { ...meta.viewedCategories };
      newCategories[product.category] = (newCategories[product.category] || 0) + 1;
      
      const newIds = [...meta.viewedProductIds];
      if (!newIds.includes(product.id)) {
        newIds.push(product.id);
        if (newIds.length > 10) newIds.shift(); // Keep last 10
      }

      return {
        ...meta,
        viewedCategories: newCategories,
        viewedProductIds: newIds,
      };
    });
  }

  trackCartAction(product: Product) {
    this.userMeta.update(meta => {
      const newPrefs = { ...meta.cartCategoryPreferences };
      newPrefs[product.category] = (newPrefs[product.category] || 0) + 5; // Stronger signal than view
      return { ...meta, cartCategoryPreferences: newPrefs };
    });
  }

  updateConversationSummary(summary: string) {
    this.userMeta.update(meta => ({ ...meta, lastConversationSummary: summary }));
  }

  // --- Context Generation for AI ---

  getUserContextDescription(): string {
    const meta = this.userMeta();
    const user = this.authService.currentUser() || 'Guest';

    // Determine top category
    const allCategories: Record<string, number> = { ...meta.viewedCategories };
    Object.entries(meta.cartCategoryPreferences).forEach(([cat, score]) => {
      // Cast score to number to satisfy TypeScript if inference fails (unknown type error)
      allCategories[cat] = (allCategories[cat] || 0) + (score as number);
    });
    
    // Explicitly type casts to ensure arithmetic operation is valid
    const topCategory = Object.entries(allCategories).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0];

    // Get recently viewed product names
    const recentProducts = meta.viewedProductIds
      .map(id => this.productService.products().find(p => p.id === id)?.name)
      .filter(n => n)
      .slice(-3)
      .join(', ');

    let context = `User Name: ${user}. `;
    if (topCategory) context += `They seem interested in ${topCategory}. `;
    if (recentProducts) context += `Recently viewed: ${recentProducts}. `;
    if (meta.lastConversationSummary) context += `Last chat topic: ${meta.lastConversationSummary}. `;
    
    context += `Current Store Context: Promotion: "${this.worldState().currentPromotion}". Trending: ${this.worldState().trendingCategory}.`;

    return context;
  }

  getWorldContext() {
      return this.worldState();
  }
}
