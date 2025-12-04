
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product } from '../../types';
import { CartService } from '../../services/cart.service';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';
import { AiMetaService } from '../../services/ai-meta.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink, ScrollAnimateDirective],
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  route = inject(ActivatedRoute);
  productService = inject(ProductService);
  cartService = inject(CartService);
  aiMetaService = inject(AiMetaService);

  product = signal<Product | undefined>(undefined);
  isLoading = signal(true);

  ngOnInit() {
    this.route.paramMap.pipe(
      // FIX: Explicitly type `params` to resolve `Property 'get' does not exist on type 'unknown'` error.
      switchMap((params: ParamMap) => {
        const id = Number(params.get('id'));
        this.isLoading.set(true);
        return this.productService.getProductById(id);
      })
    ).subscribe(product => {
      this.product.set(product);
      this.isLoading.set(false);
      
      if (product) {
        this.aiMetaService.trackView(product);
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}
