import { Component, ChangeDetectionStrategy, signal, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-guardian',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-guardian.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemGuardianComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private intervalId: any;
  
  statuses = [
    'Systems Nominal',
    'AI Core Synced',
    'Particle Flux Stable',
    'Monitoring Quantum Entanglement',
    'Encrypting Data Streams',
    'Optimizing Neural Pathways'
  ];
  
  currentStatus = signal(this.statuses[0]);
  indicatorColor = signal('text-green-500');

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      let index = 0;
      this.intervalId = setInterval(() => {
        index = (index + 1) % this.statuses.length;
        this.currentStatus.set(this.statuses[index]);
        this.indicatorColor.set(Math.random() > 0.1 ? 'text-green-500' : 'text-yellow-400');
      }, 5000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
