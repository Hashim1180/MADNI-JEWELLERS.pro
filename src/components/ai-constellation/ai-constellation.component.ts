import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var gsap: any;

@Component({
  selector: 'app-ai-constellation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ai-constellation.component.html',
})
export class AiConstellationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('constellationSvg') svgRef!: ElementRef<SVGElement>;
  private platformId = inject(PLATFORM_ID);
  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
      
      this.resizeObserver = new ResizeObserver(() => {
        gsap.killTweensOf(this.svgRef.nativeElement.querySelectorAll('.star, .line, .orbit-ring'));
        this.initAnimations();
      });
      this.resizeObserver.observe(this.svgRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      gsap.killTweensOf(this.svgRef.nativeElement.querySelectorAll('*'));
  }

  initAnimations(): void {
    const stars = this.svgRef.nativeElement.querySelectorAll('.star');
    const lines = this.svgRef.nativeElement.querySelectorAll('.line');
    const labels = this.svgRef.nativeElement.querySelectorAll('.star-label');
    const orbits = this.svgRef.nativeElement.querySelectorAll('.orbit-ring');
    const orbitsRev = this.svgRef.nativeElement.querySelectorAll('.orbit-ring-rev');

    // Pulsing stars
    gsap.to(stars, {
      scale: 1.2,
      opacity: 0.8,
      duration: 3,
      stagger: 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    
    // Rotating Orbits
    gsap.to(orbits, {
        rotation: 360,
        transformOrigin: "50% 50%",
        duration: 20,
        repeat: -1,
        ease: "none"
    });

    gsap.to(orbitsRev, {
        rotation: -360,
        transformOrigin: "50% 50%",
        duration: 25,
        repeat: -1,
        ease: "none"
    });

    // Animate lines drawing
    gsap.fromTo(lines, 
        { strokeDashoffset: (i: number, el: any) => el.getTotalLength() },
        { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', stagger: 0.1, delay: 0.2 }
    );
    
    // Fade in labels
    gsap.fromTo(labels, { opacity: 0, y: 10 }, { opacity: 0.7, y: 0, duration: 1.5, delay: 1, stagger: 0.1 });
  }

  handleStarHover(event: MouseEvent): void {
      const star = event.currentTarget as SVGElement;
      gsap.to(star, { scale: 1.8, duration: 0.4, ease: 'back.out(1.7)' });
      
      const relatedLabel = this.svgRef.nativeElement.querySelector(`[data-star="${star.id}"]`);
      if (relatedLabel) {
          gsap.to(relatedLabel, { scale: 1.2, opacity: 1, fill: '#00f0ff', duration: 0.3 });
      }
  }

  handleStarLeave(event: MouseEvent): void {
      const star = event.currentTarget as SVGElement;
      gsap.to(star, { scale: 1, duration: 0.4, ease: 'power2.inOut' });

      const relatedLabel = this.svgRef.nativeElement.querySelector(`[data-star="${star.id}"]`);
      if (relatedLabel) {
          gsap.to(relatedLabel, { scale: 1, opacity: 0.7, fill: '#fff', duration: 0.3 });
      }
  }
}