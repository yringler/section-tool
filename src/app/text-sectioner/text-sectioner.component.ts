import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Section {
  label?: string;
  startIndex: number;
  endIndex: number;
  children: Section[];
  id: string;
  depth: number;
}

@Component({
  selector: 'app-text-sectioner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-sectioner.component.html',
  styleUrl: './text-sectioner.component.css'
})
export class TextSectionerComponent {
  hebrewText: string = '';
  sections: Section[] = [];
  selectedText: string = '';
  selectionStart: number = -1;
  selectionEnd: number = -1;
  sectionLabel: string = '';
  nextId: number = 1;
  xmlOutput: string = '';
  nestingMode: 'sibling' | 'child' = 'sibling';

  onTextSelect(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      this.selectedText = this.hebrewText.substring(start, end);
      this.selectionStart = start;
      this.selectionEnd = end;
    }
  }

  addSection() {
    if (this.selectionStart === -1 || this.selectionEnd === -1) {
      alert('Please select text first');
      return;
    }

    const newSection: Section = {
      label: this.sectionLabel || undefined,
      startIndex: this.selectionStart,
      endIndex: this.selectionEnd,
      children: [],
      id: `s${this.nextId++}`,
      depth: 0
    };

    this.insertSection(newSection);
    this.generateXML();

    // Reset selection
    this.selectedText = '';
    this.selectionStart = -1;
    this.selectionEnd = -1;
    this.sectionLabel = '';
  }

  private insertSection(newSection: Section) {
    // Try to insert into existing tree
    const inserted = this.tryInsertIntoTree(this.sections, newSection, 0);

    if (!inserted) {
      // Add to root level
      this.sections.push(newSection);
      this.sections.sort((a, b) => a.startIndex - b.startIndex);
    }
  }

  private tryInsertIntoTree(sections: Section[], newSection: Section, currentDepth: number): boolean {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Check if new section is completely within this section
      if (newSection.startIndex >= section.startIndex &&
          newSection.endIndex <= section.endIndex &&
          !(newSection.startIndex === section.startIndex && newSection.endIndex === section.endIndex)) {

        // Try to insert into children first
        newSection.depth = currentDepth + 1;
        if (!this.tryInsertIntoTree(section.children, newSection, currentDepth + 1)) {
          // If not inserted into any child, add as direct child
          section.children.push(newSection);
          section.children.sort((a, b) => a.startIndex - b.startIndex);
        }
        return true;
      }
    }

    newSection.depth = currentDepth;
    return false;
  }

  removeSection(section: Section) {
    this.removeSectionFromTree(this.sections, section);
    this.generateXML();
  }

  private removeSectionFromTree(sections: Section[], toRemove: Section): boolean {
    const index = sections.findIndex(s => s.id === toRemove.id);
    if (index !== -1) {
      sections.splice(index, 1);
      return true;
    }

    for (const section of sections) {
      if (this.removeSectionFromTree(section.children, toRemove)) {
        return true;
      }
    }
    return false;
  }

  moveUp(section: Section) {
    // Find parent and move section up one level
    const result = this.findSectionParent(this.sections, section, null);
    if (result && result.parent) {
      // Remove from current parent
      result.parent.children = result.parent.children.filter(s => s.id !== section.id);

      // Find grandparent
      const grandparentResult = this.findSectionParent(this.sections, result.parent, null);

      if (grandparentResult && grandparentResult.parent) {
        // Add to grandparent
        grandparentResult.parent.children.push(section);
        grandparentResult.parent.children.sort((a, b) => a.startIndex - b.startIndex);
      } else {
        // Add to root
        this.sections.push(section);
        this.sections.sort((a, b) => a.startIndex - b.startIndex);
      }

      this.updateDepths();
      this.generateXML();
    }
  }

  moveDown(section: Section) {
    // Find the previous sibling and make this section its child
    const result = this.findSectionParent(this.sections, section, null);
    const siblings = result?.parent ? result.parent.children : this.sections;

    const index = siblings.findIndex(s => s.id === section.id);
    if (index > 0) {
      const previousSibling = siblings[index - 1];

      // Check if section is within bounds of previous sibling
      if (section.startIndex >= previousSibling.startIndex &&
          section.endIndex <= previousSibling.endIndex) {
        // Remove from current level
        siblings.splice(index, 1);

        // Add to previous sibling's children
        previousSibling.children.push(section);
        previousSibling.children.sort((a, b) => a.startIndex - b.startIndex);

        this.updateDepths();
        this.generateXML();
      } else {
        alert('Cannot nest: section is outside the bounds of the previous section');
      }
    }
  }

  private findSectionParent(sections: Section[], target: Section, parent: Section | null): { section: Section, parent: Section | null } | null {
    for (const section of sections) {
      if (section.id === target.id) {
        return { section, parent };
      }

      const result = this.findSectionParent(section.children, target, section);
      if (result) {
        return result;
      }
    }
    return null;
  }

  private updateDepths() {
    const update = (sections: Section[], depth: number) => {
      for (const section of sections) {
        section.depth = depth;
        update(section.children, depth + 1);
      }
    };
    update(this.sections, 0);
  }

  generateXML() {
    this.xmlOutput = this.buildXML(this.sections, 0);
  }

  private buildXML(sections: Section[], baseIndex: number, indent: number = 0): string {
    let xml = '';
    const indentStr = '  '.repeat(indent);

    let currentIndex = baseIndex;

    for (const section of sections) {
      // Add text before section
      if (section.startIndex > currentIndex) {
        const textBefore = this.hebrewText.substring(currentIndex, section.startIndex);
        if (textBefore.trim()) {
          xml += indentStr + this.escapeXml(textBefore.trim()) + '\n';
        }
      }

      // Open section tag
      const labelAttr = section.label ? ` label="${this.escapeXml(section.label)}"` : '';
      xml += indentStr + `<section${labelAttr}>`;

      if (section.children.length > 0) {
        xml += '\n';
        // Add children recursively
        xml += this.buildXML(section.children, section.startIndex, indent + 1);

        // Add remaining text in this section after children
        const lastChild = section.children[section.children.length - 1];
        if (lastChild.endIndex < section.endIndex) {
          const textAfter = this.hebrewText.substring(lastChild.endIndex, section.endIndex);
          if (textAfter.trim()) {
            xml += '  '.repeat(indent + 1) + this.escapeXml(textAfter.trim()) + '\n';
          }
        }
        xml += indentStr;
      } else {
        // No children, just add the text
        const text = this.hebrewText.substring(section.startIndex, section.endIndex);
        xml += this.escapeXml(text.trim());
      }

      xml += `</section>\n`;

      currentIndex = section.endIndex;
    }

    // Add any remaining text
    if (currentIndex < this.hebrewText.length && sections.length > 0) {
      const parent = sections[0];
      if (parent && currentIndex < this.hebrewText.length) {
        const remainingText = this.hebrewText.substring(currentIndex);
        if (remainingText.trim()) {
          xml += indentStr + this.escapeXml(remainingText.trim()) + '\n';
        }
      }
    } else if (sections.length === 0 && this.hebrewText.trim()) {
      xml += indentStr + this.escapeXml(this.hebrewText.trim()) + '\n';
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

  clearAll() {
    if (confirm('Are you sure you want to clear all sections?')) {
      this.sections = [];
      this.xmlOutput = '';
      this.nextId = 1;
    }
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
}
