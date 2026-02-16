import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TextSectionService } from './text-section.service';
import { TextNode } from '../models/text-node.model';

describe('TextSectionService', () => {
  let service: TextSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TextSectionService],
    });
    service = TestBed.inject(TextSectionService);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with one empty root node', () => {
      const roots = service.rootNodes();
      expect(roots).toHaveLength(1);
      expect(roots[0].text).toBe('');
      expect(roots[0].label).toBe('');
      expect(roots[0].children).toEqual([]);
    });
  });

  describe('createNode', () => {
    it('should create a node with text', () => {
      const node = service.createNode('test text');
      expect(node.text).toBe('test text');
      expect(node.label).toBe('');
      expect(node.children).toEqual([]);
      expect(node.id).toBeTruthy();
    });

    it('should create a node with text and label', () => {
      const node = service.createNode('test text', 'test label');
      expect(node.text).toBe('test text');
      expect(node.label).toBe('test label');
      expect(node.children).toEqual([]);
    });

    it('should generate unique IDs for each node', () => {
      const node1 = service.createNode('text1');
      const node2 = service.createNode('text2');
      expect(node1.id).not.toBe(node2.id);
    });
  });

  describe('updateNodeText', () => {
    it('should update text of root node', () => {
      const nodeId = service.rootNodes()[0].id;
      service.updateNodeText(nodeId, 'updated text');
      expect(service.rootNodes()[0].text).toBe('updated text');
    });

    it('should update text of nested node', () => {
      const root = service.rootNodes()[0];
      const child = service.createNode('child text');
      root.children.push(child);
      service.rootNodes.set([root]);

      service.updateNodeText(child.id, 'new child text');
      expect(service.rootNodes()[0].children[0].text).toBe('new child text');
    });

    it('should do nothing if node ID not found', () => {
      const initialRoots = service.rootNodes();
      service.updateNodeText('non-existent-id', 'text');
      expect(service.rootNodes()).toEqual(initialRoots);
    });
  });

  describe('updateNodeLabel', () => {
    it('should update label of root node', () => {
      const nodeId = service.rootNodes()[0].id;
      service.updateNodeLabel(nodeId, 'new label');
      expect(service.rootNodes()[0].label).toBe('new label');
    });

    it('should update label of nested node', () => {
      const root = service.rootNodes()[0];
      const child = service.createNode('child text');
      root.children.push(child);
      service.rootNodes.set([root]);

      service.updateNodeLabel(child.id, 'child label');
      expect(service.rootNodes()[0].children[0].label).toBe('child label');
    });
  });

  describe('splitToChild', () => {
    it('should split text at cursor position into child', () => {
      const nodeId = service.rootNodes()[0].id;
      service.updateNodeText(nodeId, 'Hello World');

      const newId = service.splitToChild(nodeId, 5);

      const root = service.rootNodes()[0];
      expect(root.text).toBe('Hello');
      expect(root.children).toHaveLength(1);
      expect(root.children[0].text).toBe(' World');
      expect(root.children[0].id).toBe(newId);
    });

    it('should split at beginning (empty parent text)', () => {
      const nodeId = service.rootNodes()[0].id;
      service.updateNodeText(nodeId, 'Hello World');

      service.splitToChild(nodeId, 0);

      const root = service.rootNodes()[0];
      expect(root.text).toBe('');
      expect(root.children[0].text).toBe('Hello World');
    });

    it('should split at end (empty child text)', () => {
      const nodeId = service.rootNodes()[0].id;
      service.updateNodeText(nodeId, 'Hello World');

      service.splitToChild(nodeId, 11);

      const root = service.rootNodes()[0];
      expect(root.text).toBe('Hello World');
      expect(root.children[0].text).toBe('');
    });

    it('should return the new child ID', () => {
      const nodeId = service.rootNodes()[0].id;
      service.updateNodeText(nodeId, 'Hello World');

      const newId = service.splitToChild(nodeId, 5);

      expect(newId).toBeTruthy();
      expect(service.rootNodes()[0].children[0].id).toBe(newId);
    });
  });

  describe('splitToSibling', () => {
    it('should split root node into sibling', () => {
      const nodeId = service.rootNodes()[0].id;
      service.updateNodeText(nodeId, 'Hello World');

      const newId = service.splitToSibling(nodeId, 5);

      const roots = service.rootNodes();
      expect(roots).toHaveLength(2);
      expect(roots[0].text).toBe('Hello');
      expect(roots[1].text).toBe(' World');
      expect(roots[1].id).toBe(newId);
    });

    it('should split child node into sibling', () => {
      const root = service.rootNodes()[0];
      const child1 = service.createNode('First child');
      root.children.push(child1);
      service.rootNodes.set([root]);

      const newId = service.splitToSibling(child1.id, 5);

      const updatedRoot = service.rootNodes()[0];
      expect(updatedRoot.children).toHaveLength(2);
      expect(updatedRoot.children[0].text).toBe('First');
      expect(updatedRoot.children[1].text).toBe(' child');
      expect(updatedRoot.children[1].id).toBe(newId);
    });

    it('should return null if node not found', () => {
      const newId = service.splitToSibling('non-existent-id', 5);
      expect(newId).toBeNull();
    });

    it('should insert sibling at correct position', () => {
      service.clearAll();
      const root1 = service.createNode('First');
      const root2 = service.createNode('Second');
      const root3 = service.createNode('Third');
      service.rootNodes.set([root1, root2, root3]);

      service.splitToSibling(root2.id, 3);

      const roots = service.rootNodes();
      expect(roots).toHaveLength(4);
      expect(roots[0].text).toBe('First');
      expect(roots[1].text).toBe('Sec');
      expect(roots[2].text).toBe('ond');
      expect(roots[3].text).toBe('Third');
    });
  });

  describe('mergeWithParent', () => {
    it('should merge child text into parent', () => {
      const root = service.rootNodes()[0];
      service.updateNodeText(root.id, 'Parent text');
      const child = service.createNode('Child text');
      root.children.push(child);
      service.rootNodes.set([root]);

      const parentId = service.mergeWithParent(child.id);

      const updatedRoot = service.rootNodes()[0];
      expect(updatedRoot.text).toBe('Parent textChild text');
      expect(updatedRoot.children).toHaveLength(0);
      expect(parentId).toBe(root.id);
    });

    it('should move child\'s children to parent', () => {
      const root = service.rootNodes()[0];
      service.updateNodeText(root.id, 'Root');
      const child = service.createNode('Child');
      const grandchild = service.createNode('Grandchild');
      child.children.push(grandchild);
      root.children.push(child);
      service.rootNodes.set([root]);

      service.mergeWithParent(child.id);

      const updatedRoot = service.rootNodes()[0];
      expect(updatedRoot.text).toBe('RootChild');
      expect(updatedRoot.children).toHaveLength(1);
      expect(updatedRoot.children[0].text).toBe('Grandchild');
    });

    it('should return null if node has no parent', () => {
      const rootId = service.rootNodes()[0].id;
      const result = service.mergeWithParent(rootId);
      expect(result).toBeNull();
    });

    it('should return null if node not found', () => {
      const result = service.mergeWithParent('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('mergeWithPreviousSibling', () => {
    it('should merge root nodes', () => {
      const root1 = service.createNode('First');
      const root2 = service.createNode('Second');
      service.rootNodes.set([root1, root2]);

      const prevId = service.mergeWithPreviousSibling(root2.id);

      const roots = service.rootNodes();
      expect(roots).toHaveLength(1);
      expect(roots[0].text).toBe('FirstSecond');
      expect(prevId).toBe(root1.id);
    });

    it('should merge child nodes', () => {
      const root = service.rootNodes()[0];
      const child1 = service.createNode('Child 1');
      const child2 = service.createNode('Child 2');
      root.children.push(child1, child2);
      service.rootNodes.set([root]);

      const prevId = service.mergeWithPreviousSibling(child2.id);

      const updatedRoot = service.rootNodes()[0];
      expect(updatedRoot.children).toHaveLength(1);
      expect(updatedRoot.children[0].text).toBe('Child 1Child 2');
      expect(prevId).toBe(child1.id);
    });

    it('should move children to previous sibling', () => {
      const root = service.rootNodes()[0];
      const child1 = service.createNode('Child 1');
      const child2 = service.createNode('Child 2');
      const grandchild = service.createNode('Grandchild');
      child2.children.push(grandchild);
      root.children.push(child1, child2);
      service.rootNodes.set([root]);

      service.mergeWithPreviousSibling(child2.id);

      const updatedRoot = service.rootNodes()[0];
      expect(updatedRoot.children).toHaveLength(1);
      expect(updatedRoot.children[0].children).toHaveLength(1);
      expect(updatedRoot.children[0].children[0].text).toBe('Grandchild');
    });

    it('should return null if node is first sibling', () => {
      const root1 = service.createNode('First');
      const root2 = service.createNode('Second');
      service.rootNodes.set([root1, root2]);

      const result = service.mergeWithPreviousSibling(root1.id);
      expect(result).toBeNull();
    });

    it('should return null if node not found', () => {
      const result = service.mergeWithPreviousSibling('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('deleteNode', () => {
    it('should delete root node', () => {
      const root1 = service.createNode('First');
      const root2 = service.createNode('Second');
      service.rootNodes.set([root1, root2]);

      service.deleteNode(root1.id);

      const roots = service.rootNodes();
      expect(roots).toHaveLength(1);
      expect(roots[0].text).toBe('Second');
    });

    it('should delete child node', () => {
      const root = service.rootNodes()[0];
      const child1 = service.createNode('Child 1');
      const child2 = service.createNode('Child 2');
      root.children.push(child1, child2);
      service.rootNodes.set([root]);

      service.deleteNode(child1.id);

      const updatedRoot = service.rootNodes()[0];
      expect(updatedRoot.children).toHaveLength(1);
      expect(updatedRoot.children[0].text).toBe('Child 2');
    });

    it('should ensure at least one root node exists', () => {
      const root = service.rootNodes()[0];
      service.deleteNode(root.id);

      const roots = service.rootNodes();
      expect(roots).toHaveLength(1);
      expect(roots[0].text).toBe('');
    });

    it('should do nothing if node not found', () => {
      const initialRoots = [...service.rootNodes()];
      service.deleteNode('non-existent-id');
      expect(service.rootNodes()).toHaveLength(initialRoots.length);
    });
  });

  describe('clearAll', () => {
    it('should reset to single empty root node', () => {
      const root1 = service.createNode('First');
      const root2 = service.createNode('Second');
      service.rootNodes.set([root1, root2]);

      service.clearAll();

      const roots = service.rootNodes();
      expect(roots).toHaveLength(1);
      expect(roots[0].text).toBe('');
      expect(roots[0].label).toBe('');
      expect(roots[0].children).toEqual([]);
    });
  });

  describe('xmlOutput', () => {
    it('should generate XML for single node', () => {
      service.clearAll();
      const root = service.createNode('Hello World');
      service.rootNodes.set([root]);

      const xml = service.xmlOutput();
      expect(xml).toBe('<section>Hello World</section>');
    });

    it('should generate XML with label attribute', () => {
      service.clearAll();
      const root = service.createNode('Content', 'Chapter 1');
      service.rootNodes.set([root]);

      const xml = service.xmlOutput();
      expect(xml).toBe('<section label="Chapter 1">Content</section>');
    });

    it('should generate nested XML', () => {
      service.clearAll();
      const root = service.createNode('Parent text', 'Parent');
      const child = service.createNode('Child text', 'Child');
      root.children.push(child);
      service.rootNodes.set([root]);

      const xml = service.xmlOutput();
      expect(xml).toContain('<section label="Parent">');
      expect(xml).toContain('Parent text');
      expect(xml).toContain('<section label="Child">Child text</section>');
      expect(xml).toContain('</section>');
    });

    it('should escape XML special characters', () => {
      service.clearAll();
      const root = service.createNode('Text with <tag> & "quotes"');
      service.rootNodes.set([root]);

      const xml = service.xmlOutput();
      expect(xml).toBe('<section>Text with &lt;tag&gt; &amp; &quot;quotes&quot;</section>');
    });

    it('should handle multiple root nodes', () => {
      service.clearAll();
      const root1 = service.createNode('First');
      const root2 = service.createNode('Second');
      service.rootNodes.set([root1, root2]);

      const xml = service.xmlOutput();
      expect(xml).toContain('<section>First</section>');
      expect(xml).toContain('<section>Second</section>');
    });

    it('should skip empty nodes without children', () => {
      service.clearAll();
      const root1 = service.createNode('Content');
      const root2 = service.createNode('');
      service.rootNodes.set([root1, root2]);

      const xml = service.xmlOutput();
      expect(xml).toBe('<section>Content</section>');
    });

    it('should trim whitespace in text nodes', () => {
      service.clearAll();
      const root = service.createNode('  Text with spaces  ');
      service.rootNodes.set([root]);

      const xml = service.xmlOutput();
      expect(xml).toBe('<section>Text with spaces</section>');
    });

    it('should handle complex nested structure', () => {
      service.clearAll();
      const root = service.createNode('Root text', 'Root');
      const child1 = service.createNode('Child 1', 'C1');
      const child2 = service.createNode('Child 2', 'C2');
      const grandchild = service.createNode('Grandchild');
      child1.children.push(grandchild);
      root.children.push(child1, child2);
      service.rootNodes.set([root]);

      const xml = service.xmlOutput();
      expect(xml).toContain('<section label="Root">');
      expect(xml).toContain('<section label="C1">');
      expect(xml).toContain('<section>Grandchild</section>');
      expect(xml).toContain('<section label="C2">Child 2</section>');
    });

    it('should properly indent nested sections', () => {
      service.clearAll();
      const root = service.createNode('Root', 'R');
      const child = service.createNode('Child');
      root.children.push(child);
      service.rootNodes.set([root]);

      const xml = service.xmlOutput();
      const lines = xml.split('\n');
      expect(lines[0]).toBe('<section label="R">');
      expect(lines[1]).toBe('  Root');
      expect(lines[2]).toBe('  <section>Child</section></section>');
      expect(lines.length).toBe(3);
    });
  });

  describe('computed xmlOutput reactivity', () => {
    it('should update XML when nodes change', () => {
      service.clearAll();
      const root = service.createNode('Initial');
      service.rootNodes.set([root]);

      const xml1 = service.xmlOutput();
      expect(xml1).toBe('<section>Initial</section>');

      service.updateNodeText(root.id, 'Updated');
      const xml2 = service.xmlOutput();
      expect(xml2).toBe('<section>Updated</section>');
    });
  });
});
