
import { Injectable, inject, signal } from '@angular/core';
import { Product } from '../types';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private products$!: Observable<Product[]>;
  
  // Expose as signal for synchronous access by other services (like AiMetaService)
  products = signal<Product[]>([]);

  constructor() {
    this.products$ = this.http.get<Product[]>('src/assets/products.json').pipe(
      shareReplay(1),
      tap(data => this.products.set(data)), // Sync signal with data
      catchError(error => {
        console.error('Failed to load products:', error);
        return of([]);
      })
    );
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.products$.pipe(
      map(products => products.find(p => p.id === id))
    );
  }
}
