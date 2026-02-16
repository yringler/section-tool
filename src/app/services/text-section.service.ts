import { Injectable, signal, computed } from '@angular/core';

export interface TextNode {
  id: string;
  label?: string;
  text: string;
  children: TextNode[];
  isEditing: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TextSectionService {
  private nextId = 1;

  rootNodes = signal<TextNode[]>([{
    id: `node-${this.nextId++}`,
    text: '',
    children: [],
    isEditing: false
  }]);

  xmlOutput = computed(() => this.generateXML(this.rootNodes()));

  private generateXML(nodes: TextNode[], indent: number = 0): string {
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
        xml += this.generateXML(node.children, indent + 1);
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

  createChild(node: TextNode, cursorPos: number) {
    if (cursorPos === node.text.length || cursorPos === 0) {
      // No split needed, just add empty child
      node.children.push({
        id: `node-${this.nextId++}`,
        text: '',
        children: [],
        isEditing: false
      });
    } else {
      // Split text: everything from cursor to end becomes new child
      const remainingText = node.text.substring(cursorPos);
      node.text = node.text.substring(0, cursorPos);

      const newChild: TextNode = {
        id: `node-${this.nextId++}`,
        text: remainingText.trim(),
        children: [],
        isEditing: false
      };

      node.children.push(newChild);
    }

    this.rootNodes.set([...this.rootNodes()]);
  }

  createSibling(node: TextNode, cursorPos: number, siblings: TextNode[]) {
    const index = siblings.indexOf(node);

    if (cursorPos === node.text.length || cursorPos === 0) {
      // No split needed, just add empty sibling
      siblings.splice(index + 1, 0, {
        id: `node-${this.nextId++}`,
        text: '',
        children: [],
        isEditing: false
      });
    } else {
      // Split text: everything from cursor to end becomes new sibling
      const remainingText = node.text.substring(cursorPos);
      node.text = node.text.substring(0, cursorPos);

      const newSibling: TextNode = {
        id: `node-${this.nextId++}`,
        text: remainingText.trim(),
        children: [],
        isEditing: false
      };

      siblings.splice(index + 1, 0, newSibling);
    }

    this.rootNodes.set([...this.rootNodes()]);
  }

  mergeWithParent(node: TextNode, parent: TextNode, siblings: TextNode[]) {
    // Remove node from siblings
    const index = siblings.indexOf(node);
    siblings.splice(index, 1);

    // Append node's text to parent
    parent.text = parent.text + ' ' + node.text;

    // Move node's children to parent
    parent.children.push(...node.children);

    this.rootNodes.set([...this.rootNodes()]);
  }

  mergeWithPreviousSibling(node: TextNode, siblings: TextNode[]) {
    const index = siblings.indexOf(node);

    if (index > 0) {
      const previousSibling = siblings[index - 1];

      // Merge text
      previousSibling.text = previousSibling.text + ' ' + node.text;

      // Move children
      previousSibling.children.push(...node.children);

      // Remove current node
      siblings.splice(index, 1);

      this.rootNodes.set([...this.rootNodes()]);
    }
  }

  deleteNode(node: TextNode, siblings: TextNode[]) {
    const index = siblings.indexOf(node);
    if (index !== -1) {
      siblings.splice(index, 1);
      this.rootNodes.set([...this.rootNodes()]);
    }
  }

  updateNodeText(node: TextNode) {
    this.rootNodes.set([...this.rootNodes()]);
  }

  updateNodeLabel(node: TextNode) {
    this.rootNodes.set([...this.rootNodes()]);
  }

  clearAll() {
    this.rootNodes.set([{
      id: `node-${this.nextId++}`,
      text: '',
      children: [],
      isEditing: false
    }]);
  }
}
