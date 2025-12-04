
import { Injectable, signal, computed, inject } from '@angular/core';
import { Product, CartItem } from '../types';
import { AiMetaService } from './ai-meta.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private aiMetaService = inject(AiMetaService);

  isCartOpen = signal(false);
  cart = signal<CartItem[]>([]);

  cartCount = computed(() => this.cart().reduce((acc, item) => acc + item.quantity, 0));
  cartTotal = computed(() => this.cart().reduce((acc, item) => acc + item.product.price * item.quantity, 0));

  addToCart(product: Product): void {
    const existingItem = this.cart().find(item => item.product.id === product.id);
    if (existingItem) {
      this.cart.update(cart =>
        cart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      this.cart.update(cart => [...cart, { product, quantity: 1 }]);
    }
    this.isCartOpen.set(true);
    
    // Track for AI Meta
    this.aiMetaService.trackCartAction(product);
  }

  removeFromCart(productId: number): void {
    this.cart.update(cart => cart.filter(item => item.product.id !== productId));
  }

  clearCart(): void {
    this.cart.set([]);
  }
}
