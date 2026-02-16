import { Component } from '@angular/core';
import { TextSectionerComponent } from './text-sectioner/text-sectioner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TextSectionerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hebrew-section-tool';
}
