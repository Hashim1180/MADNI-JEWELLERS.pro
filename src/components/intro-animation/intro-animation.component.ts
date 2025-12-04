import { Component, ChangeDetectionStrategy, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type AnimationStage = 'drawing' | 'dissolving' | 'revealing' | 'finished';

@Component({
  selector: 'app-intro-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-animation.component.html',
  styleUrls: ['./intro-animation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroAnimationComponent implements OnInit {
  @Output() animationFinished = new EventEmitter<void>();

  animationStage = signal<AnimationStage>('drawing');

  ngOnInit() {
    // Sequence the animation stages
    setTimeout(() => this.animationStage.set('dissolving'), 2500); // After SVG draws
    setTimeout(() => this.animationStage.set('revealing'), 3500); // After particles explode
    setTimeout(() => this.animationStage.set('finished'), 5000); // After logo fades in
    setTimeout(() => this.animationFinished.emit(), 5500); // A little buffer before emitting
  }
}
