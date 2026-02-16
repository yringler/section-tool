import { Component, inject } from '@angular/core';
import { TextSectionService } from '../services/text-section.service';
import { TextNodeComponent, NodeKeydownEvent, NodeTextChangeEvent, NodeLabelChangeEvent, NodeDeleteEvent } from '../components/text-node/text-node.component';
import { XmlOutputComponent } from '../components/xml-output/xml-output.component';

@Component({
  selector: 'app-text-sectioner',
  standalone: true,
  imports: [TextNodeComponent, XmlOutputComponent],
  templateUrl: './text-sectioner.component.html',
  styleUrl: './text-sectioner.component.css',
})
export class TextSectionerComponent {
  private service = inject(TextSectionService);

  rootNodes = this.service.rootNodes;
  xmlOutput = this.service.xmlOutput;

  onNodeKeydown(event: NodeKeydownEvent): void {
    const { nodeId, contentIndex, event: keyEvent, cursorPos } = event;
    let focusId: string | null = null;

    if (keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
      focusId = this.service.splitToChild(nodeId, contentIndex, cursorPos);
    } else if (keyEvent.key === 'Tab' && !keyEvent.shiftKey) {
      focusId = this.service.splitToSibling(nodeId, contentIndex, cursorPos);
    } else if (keyEvent.key === 'Enter' && keyEvent.shiftKey) {
      focusId = this.service.mergeWithParent(nodeId);
    } else if (keyEvent.key === 'Tab' && keyEvent.shiftKey) {
      focusId = this.service.mergeWithPreviousSibling(nodeId);
    }

    if (focusId) {
      // Focus the target textarea after Angular renders
      requestAnimationFrame(() => {
        const el = document.querySelector(`wa-textarea[data-node-id="${focusId}"]`) as any;
        // Web Awesome components have a focus() method
        el?.focus();
      });
    }
  }

  onTextChange(event: NodeTextChangeEvent): void {
    this.service.updateNodeText(event.nodeId, event.contentIndex, event.text);
  }

  onLabelChange(event: NodeLabelChangeEvent): void {
    this.service.updateNodeLabel(event.nodeId, event.label);
  }

  onDeleteNode(event: NodeDeleteEvent): void {
    this.service.deleteNode(event.nodeId);
  }

  onCopy(): void {
    navigator.clipboard.writeText(this.xmlOutput());
  }

  onDownload(): void {
    const blob = new Blob([this.xmlOutput()], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sections.xml';
    a.click();
    URL.revokeObjectURL(url);
  }

  onClear(): void {
    this.service.clearAll();
  }
}
