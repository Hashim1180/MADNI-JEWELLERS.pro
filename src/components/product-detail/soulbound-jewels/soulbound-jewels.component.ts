import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';

@Component({
  selector: 'app-soulbound-jewels',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollAnimateDirective],
  templateUrl: './soulbound-jewels.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoulboundJewelsComponent {
  geminiService = inject(GeminiService);

  prompt = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);
  result = signal<{ story: string; imageBase64: string } | null>(null);

  async generateJewel(): Promise<void> {
    if (!this.prompt().trim()) {
      this.error.set('Please enter a memory, feeling, or idea.');
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    this.result.set(null);

    try {
      const jewel = await this.geminiService.generateSoulboundJewel(this.prompt());
      this.result.set(jewel);
    } catch (e) {
      console.error(e);
      this.error.set('An error occurred while crafting your jewel. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  startOver(): void {
    this.prompt.set('');
    this.result.set(null);
    this.error.set(null);
  }
}
