import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../types';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink, ScrollAnimateDirective],
  templateUrl: './products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  productService = inject(ProductService);
  cartService = inject(CartService);
  
  products = signal<Product[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products.set(data);
      this.isLoading.set(false);
    });
  }

  addToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(product);
  }
}
