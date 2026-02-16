import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-xml-output',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xml-output.component.html',
  styleUrl: './xml-output.component.css'
})
export class XmlOutputComponent {
  xmlContent = input.required<string>();

  copyClicked = output<void>();
  downloadClicked = output<void>();
  clearAllClicked = output<void>();
}
