import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AiConstellationComponent } from '../ai-constellation/ai-constellation.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AiConstellationComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}