import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-xml-output',
  standalone: true,
  templateUrl: './xml-output.component.html',
  styleUrl: './xml-output.component.css',
})
export class XmlOutputComponent {
  xmlContent = input.required<string>();

  copyRequest = output<void>();
  downloadRequest = output<void>();
  clearRequest = output<void>();

  onCopy(): void {
    this.copyRequest.emit();
  }

  onDownload(): void {
    this.downloadRequest.emit();
  }

  onClear(): void {
    this.clearRequest.emit();
  }
}
