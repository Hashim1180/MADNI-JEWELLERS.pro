import { Directive, ElementRef, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements AfterViewInit {
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.el.nativeElement.classList.add('visible');
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      }, { threshold: 0.1 });
      
      this.observer.observe(this.el.nativeElement);
    }
  }
}
