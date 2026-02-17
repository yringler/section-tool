import { Injectable } from '@angular/core';
import { TextNode } from '../models/text-node.model';

@Injectable({ providedIn: 'root' })
export class XmlParserService {
  /**
   * Parse XML string and convert to TextNode structure
   * @param xmlString The XML content to parse
   * @returns Array of root TextNode objects
   */
  parseXml(xmlString: string): TextNode[] {
    const trimmed = xmlString.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'application/xml');

      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
      }

      // Get all top-level section elements
      const rootSections = Array.from(doc.documentElement.children).filter(
        (el) => el.tagName.toLowerCase() === 'section'
      );

      if (rootSections.length === 0) {
        // If the root is a section itself, use it
        if (doc.documentElement.tagName.toLowerCase() === 'section') {
          return [this.parseSection(doc.documentElement as Element)];
        }
        throw new Error('No section elements found in XML');
      }

      return rootSections.map((el) => this.parseSection(el as Element));
    } catch (error) {
      console.error('XML parsing error:', error);
      throw error;
    }
  }

  private parseSection(element: Element): TextNode {
    const node: TextNode = {
      id: crypto.randomUUID(),
      label: element.getAttribute('label') || '',
      children: [],
    };

    // Process all child nodes (text and elements)
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        // Text node
        const text = this.unescapeXml(child.textContent || '').trim();
        if (text) {
          node.children.push(text);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = child as Element;
        if (childElement.tagName.toLowerCase() === 'section') {
          // Recursively parse child section
          node.children.push(this.parseSection(childElement));
        }
      }
    }

    // Ensure at least one child (empty string) for proper rendering
    if (node.children.length === 0) {
      node.children.push('');
    }

    return node;
  }

  private unescapeXml(text: string): string {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
}
