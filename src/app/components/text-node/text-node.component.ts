import { Component, input, Output, EventEmitter } from '@angular/core';
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

  @Output() keydown = new EventEmitter<{
    event: KeyboardEvent;
    node: TextNode;
    parent: TextNode | null;
    siblings: TextNode[];
  }>();

  @Output() textChange = new EventEmitter<TextNode>();
  @Output() labelChange = new EventEmitter<TextNode>();
  @Output() deleteNode = new EventEmitter<{ node: TextNode; siblings: TextNode[] }>();
  @Output() startEditLabel = new EventEmitter<TextNode>();
  @Output() finishEditLabel = new EventEmitter<TextNode>();

  onTextareaKeydown(event: KeyboardEvent) {
    this.keydown.emit({
      event,
      node: this.node(),
      parent: this.parent(),
      siblings: this.siblings()
    });
  }

  onTextInputChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.node().text = target.value;
    this.textChange.emit(this.node());
  }

  onLabelInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.node().label = target.value;
    this.labelChange.emit(this.node());
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
