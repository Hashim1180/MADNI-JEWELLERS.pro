import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { DesignOptions } from '../../types';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';

@Component({
  selector: 'app-design-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ScrollAnimateDirective],
  templateUrl: './design-studio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignStudioComponent {
  fb = inject(FormBuilder);
  geminiService = inject(GeminiService);

  designForm = this.fb.group({
    metal: ['22k Gold', Validators.required],
    stone: ['Ruby', Validators.required],
    style: ['Classic Solitaire', Validators.required],
    engraving: [''],
  });

  isLoading = signal(false);
  feedback = signal<string | null>(null);
  error = signal<string | null>(null);

  metals = ['22k Gold', 'Platinum', 'White Gold', 'Rose Gold'];
  stones = ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl'];
  styles = ['Classic Solitaire', 'Vintage Filigree', 'Modern Halo', 'Minimalist Band'];

  async getFeedback(): Promise<void> {
    if (this.designForm.invalid) {
      this.error.set('Please make a selection for each category.');
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    this.feedback.set(null);

    try {
      const options = this.designForm.value as DesignOptions;
      const result = await this.geminiService.getDesignFeedback(options);
      this.feedback.set(result);
    } catch (e) {
      console.error(e);
      this.error.set('An error occurred while getting feedback. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
