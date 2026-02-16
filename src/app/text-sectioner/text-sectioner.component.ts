import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TextNode {
  id: string;
  label?: string;
  text: string;
  children: TextNode[];
  isEditing: boolean;
  cursorPosition: number;
}

@Component({
  selector: 'app-text-sectioner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-sectioner.component.html',
  styleUrl: './text-sectioner.component.css'
})
export class TextSectionerComponent {
  rootNodes: TextNode[] = [];
  nextId: number = 1;
  xmlOutput: string = '';
  initialText: string = '';

  ngOnInit() {
    // Start with one root node
    this.rootNodes = [{
      id: `node-${this.nextId++}`,
      text: '',
      children: [],
      isEditing: false,
      cursorPosition: 0
    }];
  }

  onTextareaKeydown(event: KeyboardEvent, node: TextNode, parent: TextNode | null, siblings: TextNode[]) {
    const textarea = event.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;

    // Enter - Create child subsection
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      this.createChild(node, cursorPos);
      return;
    }

    // Shift+Enter - Merge with parent
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      if (parent) {
        this.mergeWithParent(node, parent, siblings);
      }
      return;
    }

    // Tab - Create sibling section
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.createSibling(node, cursorPos, siblings);
      return;
    }

    // Shift+Tab - Merge with previous sibling
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.mergeWithPreviousSibling(node, siblings);
      return;
    }
  }

  private createChild(node: TextNode, cursorPos: number) {
    if (cursorPos === node.text.length || cursorPos === 0) {
      // No split needed, just add empty child
      node.children.push({
        id: `node-${this.nextId++}`,
        text: '',
        children: [],
        isEditing: false,
        cursorPosition: 0
      });
    } else {
      // Split text: everything from cursor to end becomes new child
      const remainingText = node.text.substring(cursorPos);
      node.text = node.text.substring(0, cursorPos);

      const newChild: TextNode = {
        id: `node-${this.nextId++}`,
        text: remainingText.trim(),
        children: [],
        isEditing: false,
        cursorPosition: 0
      };

      node.children.push(newChild);
    }

    this.generateXML();
  }

  private createSibling(node: TextNode, cursorPos: number, siblings: TextNode[]) {
    const index = siblings.indexOf(node);

    if (cursorPos === node.text.length || cursorPos === 0) {
      // No split needed, just add empty sibling
      siblings.splice(index + 1, 0, {
        id: `node-${this.nextId++}`,
        text: '',
        children: [],
        isEditing: false,
        cursorPosition: 0
      });
    } else {
      // Split text: everything from cursor to end becomes new sibling
      const remainingText = node.text.substring(cursorPos);
      node.text = node.text.substring(0, cursorPos);

      const newSibling: TextNode = {
        id: `node-${this.nextId++}`,
        text: remainingText.trim(),
        children: [],
        isEditing: false,
        cursorPosition: 0
      };

      siblings.splice(index + 1, 0, newSibling);
    }

    this.generateXML();
  }

  private mergeWithParent(node: TextNode, parent: TextNode, siblings: TextNode[]) {
    // Remove node from siblings
    const index = siblings.indexOf(node);
    siblings.splice(index, 1);

    // Append node's text to parent
    parent.text = parent.text + ' ' + node.text;

    // Move node's children to parent
    parent.children.push(...node.children);

    this.generateXML();
  }

  private mergeWithPreviousSibling(node: TextNode, siblings: TextNode[]) {
    const index = siblings.indexOf(node);

    if (index > 0) {
      const previousSibling = siblings[index - 1];

      // Merge text
      previousSibling.text = previousSibling.text + ' ' + node.text;

      // Move children
      previousSibling.children.push(...node.children);

      // Remove current node
      siblings.splice(index, 1);

      this.generateXML();
    }
  }

  onLabelKeydown(event: KeyboardEvent, node: TextNode) {
    if (event.key === 'Enter') {
      event.preventDefault();
      node.isEditing = false;
      this.generateXML();
    }
  }

  onLabelBlur(node: TextNode) {
    node.isEditing = false;
    this.generateXML();
  }

  startEditingLabel(event: Event, node: TextNode) {
    event.stopPropagation();
    node.isEditing = true;
    setTimeout(() => {
      const input = document.querySelector(`input[data-node-id="${node.id}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  deleteNode(node: TextNode, siblings: TextNode[]) {
    const index = siblings.indexOf(node);
    if (index !== -1) {
      siblings.splice(index, 1);
      this.generateXML();
    }
  }

  generateXML() {
    this.xmlOutput = this.buildXML(this.rootNodes, 0);
  }

  private buildXML(nodes: TextNode[], indent: number = 0): string {
    let xml = '';
    const indentStr = '  '.repeat(indent);

    for (const node of nodes) {
      // Skip completely empty nodes
      if (!node.text.trim() && node.children.length === 0) {
        continue;
      }

      const labelAttr = node.label ? ` label="${this.escapeXml(node.label)}"` : '';

      if (node.children.length > 0) {
        xml += indentStr + `<section${labelAttr}>`;

        if (node.text.trim()) {
          xml += this.escapeXml(node.text.trim());
        }

        xml += '\n';
        xml += this.buildXML(node.children, indent + 1);
        xml += indentStr + `</section>\n`;
      } else {
        // Leaf node
        if (node.text.trim()) {
          xml += indentStr + `<section${labelAttr}>`;
          xml += this.escapeXml(node.text.trim());
          xml += `</section>\n`;
        }
      }
    }

    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  copyXML() {
    navigator.clipboard.writeText(this.xmlOutput).then(() => {
      alert('XML copied to clipboard!');
    });
  }

  downloadXML() {
    const blob = new Blob([this.xmlOutput], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hebrew-text-sections.xml';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all sections?')) {
      this.rootNodes = [{
        id: `node-${this.nextId++}`,
        text: '',
        children: [],
        isEditing: false,
        cursorPosition: 0
      }];
      this.xmlOutput = '';
    }
  }
}
