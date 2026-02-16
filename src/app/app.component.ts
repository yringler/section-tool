import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TextSectionerComponent } from './text-sectioner/text-sectioner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TextSectionerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hebrew-section-tool';
}
