import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextNodeComponent } from '../components/text-node/text-node.component';
import { XmlOutputComponent } from '../components/xml-output/xml-output.component';
import { TextSectionService, TextNode } from '../services/text-section.service';

@Component({
  selector: 'app-text-sectioner',
  standalone: true,
  imports: [CommonModule, TextNodeComponent, XmlOutputComponent],
  templateUrl: './text-sectioner.component.html',
  styleUrl: './text-sectioner.component.css'
})
export class TextSectionerComponent {
  private textService = inject(TextSectionService);

  rootNodes = this.textService.rootNodes;
  xmlOutput = this.textService.xmlOutput;

  onTextareaKeydown(payload: {
    event: KeyboardEvent;
    node: TextNode;
    parent: TextNode | null;
    siblings: TextNode[];
  }) {
    // payload IS the object we emitted
    const { event, node, parent, siblings } = payload;
    const textarea = event.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;

    // Enter - Create child subsection
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      this.textService.createChild(node, cursorPos);
      return;
    }

    // Shift+Enter - Merge with parent
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      if (parent) {
        this.textService.mergeWithParent(node, parent, siblings);
      }
      return;
    }

    // Tab - Create sibling section
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.textService.createSibling(node, cursorPos, siblings);
      return;
    }

    // Shift+Tab - Merge with previous sibling
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.textService.mergeWithPreviousSibling(node, siblings);
      return;
    }
  }

  onTextChange(node: TextNode) {
    this.textService.updateNodeText(node);
  }

  onLabelChange(node: TextNode) {
    this.textService.updateNodeLabel(node);
  }

  onDeleteNode(payload: { node: TextNode; siblings: TextNode[] }) {
    this.textService.deleteNode(payload.node, payload.siblings);
  }

  onStartEditLabel(node: TextNode) {
    node.isEditing = true;
    setTimeout(() => {
      const input = document.querySelector(`input[data-node-id="${node.id}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  onFinishEditLabel(node: TextNode) {
    node.isEditing = false;
    this.textService.updateNodeLabel(node);
  }

  copyXML() {
    const xml = this.xmlOutput();
    if (xml) {
      navigator.clipboard.writeText(xml).then(() => {
        alert('XML copied to clipboard!');
      });
    }
  }

  downloadXML() {
    const xml = this.xmlOutput();
    if (xml) {
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hebrew-text-sections.xml';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all sections?')) {
      this.textService.clearAll();
    }
  }
}
