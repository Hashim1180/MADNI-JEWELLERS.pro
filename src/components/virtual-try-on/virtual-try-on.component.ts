
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { Product } from '../../types';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';

@Component({
  selector: 'app-virtual-try-on',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ScrollAnimateDirective],
  templateUrl: './virtual-try-on.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualTryOnComponent {
  handImage = signal<string | null>(null);
  selectedCategory = signal<string>('Rings');
  selectedJewelry = signal<Product | null>(null);
  isLoading = signal(false);
  aiDescription = signal<string | null>(null);
  error = signal<string | null>(null);

  jewelryItems: Product[] = [
    { id: 101, name: 'Emerald Legacy Ring', description: 'A stunning ring with a large emerald.', price: 7500, imageUrl: 'https://picsum.photos/seed/ring1/200/200', category: 'Rings', stock: 5 },
    { id: 102, name: 'Sapphire Solitaire', description: 'Classic and elegant sapphire solitaire.', price: 6800, imageUrl: 'https://picsum.photos/seed/ring2/200/200', category: 'Rings', stock: 8 },
    { id: 103, name: 'Ruby Eternity Band', description: 'An eternity band full of vibrant rubies.', price: 5500, imageUrl: 'https://picsum.photos/seed/ring3/200/200', category: 'Rings', stock: 12 },
    { id: 201, name: 'Polki Jhumka', description: 'Traditional gold earrings.', price: 4200, imageUrl: 'https://picsum.photos/seed/earring1/200/200', category: 'Earrings', stock: 10 },
    { id: 202, name: 'Diamond Studs', description: 'Timeless diamond studs.', price: 3000, imageUrl: 'https://picsum.photos/seed/earring2/200/200', category: 'Earrings', stock: 15 },
    { id: 301, name: 'Gold Choker', description: 'Intricate gold choker.', price: 8900, imageUrl: 'https://picsum.photos/seed/neck1/200/200', category: 'Necklaces', stock: 4 },
    { id: 302, name: 'Pearl Strand', description: 'Classic pearl necklace.', price: 2500, imageUrl: 'https://picsum.photos/seed/neck2/200/200', category: 'Necklaces', stock: 7 },
  ];

  constructor(private geminiService: GeminiService) {}

  selectCategory(category: string) {
      this.selectedCategory.set(category);
      this.selectedJewelry.set(null); // Reset selection
      this.aiDescription.set(null);
  }

  get filteredItems() {
      return this.jewelryItems.filter(item => item.category === this.selectedCategory());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          this.error.set('Image size should be less than 2MB.');
          return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.handImage.set(e.target?.result as string);
        this.aiDescription.set(null);
        this.error.set(null);
      };
      reader.readAsDataURL(file);
    }
  }

  selectJewelry(item: Product): void {
    this.selectedJewelry.set(item);
    this.aiDescription.set(null);
  }

  async generateDescription(): Promise<void> {
    if (!this.handImage() || !this.selectedJewelry()) {
      this.error.set('Please upload an image and select a jewelry piece.');
      return;
    }
    this.error.set(null);
    this.isLoading.set(true);
    this.aiDescription.set(null);

    try {
      const handImgB64 = this.handImage()!.split(',')[1];
      
      const response = await fetch(this.selectedJewelry()!.imageUrl);
      const blob = await response.blob();
      const jewelryImgB64 = await this.blobToBase64(blob);

      // Pass category to service
      const description = await this.geminiService.generateVirtualTryOnDescription(
          handImgB64, 
          jewelryImgB64, 
          this.selectedJewelry()?.category || 'Jewelry'
      );
      this.aiDescription.set(description);
    } catch (e) {
      console.error(e);
      this.error.set('Failed to generate description. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  }

  reset(): void {
    this.handImage.set(null);
    this.selectedJewelry.set(null);
    this.aiDescription.set(null);
    this.error.set(null);
    this.isLoading.set(false);
  }
}
