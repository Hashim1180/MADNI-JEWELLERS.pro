import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

@Component({
  selector: 'app-particle-background',
  standalone: true,
  template: '<canvas #particleCanvas class="fixed top-0 left-0 w-full h-full -z-10 opacity-40"></canvas>',
})
export class ParticleBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId?: number;
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initCanvas();
      this.createParticles();
      this.animate();
      window.addEventListener('resize', this.resizeCanvas);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeCanvas);
    }
  }

  private initCanvas = (): void => {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context');
      return;
    }
    this.ctx = ctx;
    this.resizeCanvas();
  }

  private resizeCanvas = (): void => {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.createParticles();
  }

  private createParticles(): void {
    this.particles = [];
    const numberOfParticles = Math.floor((this.canvasRef.nativeElement.width * this.canvasRef.nativeElement.height) / 20000);
    const colors = ['#FFFDE4', '#B8860B', '#FFFFFF'];
    
    for (let i = 0; i < numberOfParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvasRef.nativeElement.width,
        y: Math.random() * this.canvasRef.nativeElement.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.particles.forEach(p => this.updateParticle(p));
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private updateParticle(particle: Particle): void {
    const canvas = this.canvasRef.nativeElement;
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x > canvas.width || particle.x < 0) particle.speedX *= -1;
    if (particle.y > canvas.height || particle.y < 0) particle.speedY *= -1;
    
    this.drawParticle(particle);
  }

  private drawParticle(particle: Particle): void {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = particle.color;
    this.ctx.fill();
  }
}
