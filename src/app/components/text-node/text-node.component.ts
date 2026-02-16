import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextNode } from '../../services/text-section.service';

@Component({
  selector: 'app-text-node',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-node.component.html',
  styleUrl: './text-node.component.css'
})
export class TextNodeComponent {
  node = input.required<TextNode>();
  parent = input<TextNode | null>(null);
  siblings = input.required<TextNode[]>();
  level = input.required<number>();

  keydown = output<{
    event: KeyboardEvent;
    node: TextNode;
    parent: TextNode | null;
    siblings: TextNode[];
  }>();

  textChange = output<TextNode>();
  labelChange = output<TextNode>();
  deleteNode = output<{ node: TextNode; siblings: TextNode[] }>();
  startEditLabel = output<TextNode>();
  finishEditLabel = output<TextNode>();

  onTextareaKeydown(event: KeyboardEvent) {
    this.keydown.emit({
      event,
      node: this.node(),
      parent: this.parent(),
      siblings: this.siblings()
    });
  }

  onTextInput() {
    this.textChange.emit(this.node());
  }

  onStartEditingLabel(event: Event) {
    event.stopPropagation();
    this.startEditLabel.emit(this.node());
  }

  onLabelKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.finishEditLabel.emit(this.node());
    }
  }

  onLabelBlur() {
    this.finishEditLabel.emit(this.node());
  }

  onDeleteNode() {
    this.deleteNode.emit({ node: this.node(), siblings: this.siblings() });
  }
}
