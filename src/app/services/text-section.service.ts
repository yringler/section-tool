import { Injectable, signal, computed } from '@angular/core';
import { TextNode } from '../models/text-node.model';

@Injectable({ providedIn: 'root' })
export class TextSectionService {
  readonly rootNodes = signal<TextNode[]>([this.createNode('')]);

  readonly xmlOutput = computed(() => this.nodesToXml(this.rootNodes(), 0));

  createNode(text: string, label = ''): TextNode {
    return {
      id: crypto.randomUUID(),
      text,
      label,
      children: [],
    };
  }

  updateNodeText(nodeId: string, text: string): void {
    this.mutateNode(nodeId, (node) => (node.text = text));
  }

  updateNodeLabel(nodeId: string, label: string): void {
    this.mutateNode(nodeId, (node) => (node.label = label));
  }

  /** Split text from cursor to end into a new child of this node */
  splitToChild(nodeId: string, cursorPos: number): string | null {
    let newId: string | null = null;
    this.mutateNode(nodeId, (node) => {
      const remaining = node.text.substring(cursorPos);
      node.text = node.text.substring(0, cursorPos);
      const child = this.createNode(remaining);
      newId = child.id;
      node.children.push(child);
    });
    return newId;
  }

  /** Split text from cursor to end into a new sibling after this node */
  splitToSibling(nodeId: string, cursorPos: number): string | null {
    let newId: string | null = null;
    const roots = this.rootNodes();
    const parent = this.findParent(nodeId, roots);

    const siblings = parent ? parent.children : roots;
    const index = siblings.findIndex((n) => n.id === nodeId);
    if (index === -1) return null;

    const node = siblings[index];
    const remaining = node.text.substring(cursorPos);
    node.text = node.text.substring(0, cursorPos);
    const sibling = this.createNode(remaining);
    newId = sibling.id;
    siblings.splice(index + 1, 0, sibling);

    this.rootNodes.set([...roots]);
    return newId;
  }

  /** Merge this node's text back into its parent */
  mergeWithParent(nodeId: string): string | null {
    const roots = this.rootNodes();
    const parent = this.findParent(nodeId, roots);
    if (!parent) return null;

    const index = parent.children.findIndex((n) => n.id === nodeId);
    if (index === -1) return null;

    const node = parent.children[index];
    parent.text += node.text;
    // Move the node's children into the parent at the same position
    parent.children.splice(index, 1, ...node.children);

    this.rootNodes.set([...roots]);
    return parent.id;
  }

  /** Merge this node's text into the previous sibling */
  mergeWithPreviousSibling(nodeId: string): string | null {
    const roots = this.rootNodes();
    const parent = this.findParent(nodeId, roots);
    const siblings = parent ? parent.children : roots;
    const index = siblings.findIndex((n) => n.id === nodeId);
    if (index <= 0) return null;

    const prev = siblings[index - 1];
    const node = siblings[index];
    prev.text += node.text;
    // Move children into previous sibling
    prev.children.push(...node.children);
    siblings.splice(index, 1);

    this.rootNodes.set([...roots]);
    return prev.id;
  }

  deleteNode(nodeId: string): void {
    const roots = this.rootNodes();
    const parent = this.findParent(nodeId, roots);
    const siblings = parent ? parent.children : roots;
    const index = siblings.findIndex((n) => n.id === nodeId);
    if (index !== -1) {
      siblings.splice(index, 1);
    }
    // Ensure at least one root node
    if (roots.length === 0) {
      roots.push(this.createNode(''));
    }
    this.rootNodes.set([...roots]);
  }

  clearAll(): void {
    this.rootNodes.set([this.createNode('')]);
  }

  private mutateNode(
    nodeId: string,
    mutator: (node: TextNode) => void
  ): void {
    const roots = this.rootNodes();
    const node = this.findNode(nodeId, roots);
    if (node) {
      mutator(node);
      this.rootNodes.set([...roots]);
    }
  }

  private findNode(id: string, nodes: TextNode[]): TextNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = this.findNode(id, node.children);
      if (found) return found;
    }
    return null;
  }

  private findParent(id: string, nodes: TextNode[], parent: TextNode | null = null): TextNode | null {
    for (const node of nodes) {
      if (node.id === id) return parent;
      const found = this.findParent(id, node.children, node);
      if (found) return found;
    }
    return null;
  }

  private nodesToXml(nodes: TextNode[], indent: number): string {
    const pad = '  '.repeat(indent);
    return nodes
      .map((node) => {
        const labelAttr = node.label ? ` label="${this.escapeXml(node.label)}"` : '';
        const hasChildren = node.children.length > 0;
        const hasText = node.text.trim().length > 0;

        if (!hasText && !hasChildren) return '';

        if (hasChildren) {
          const childXml = this.nodesToXml(node.children, indent + 1);
          const textPart = hasText ? `${pad}  ${this.escapeXml(node.text.trim())}\n` : '';
          return `${pad}<section${labelAttr}>\n${textPart}${childXml}${pad}</section>`;
        }

        return `${pad}<section${labelAttr}>${this.escapeXml(node.text.trim())}</section>`;
      })
      .filter((s) => s.length > 0)
      .join('\n');
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
