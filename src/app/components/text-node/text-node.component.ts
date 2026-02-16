import { Component, input, output } from '@angular/core';
import { TextNode } from '../../models/text-node.model';

export interface NodeKeydownEvent {
  nodeId: string;
  event: KeyboardEvent;
  cursorPos: number;
}

export interface NodeTextChangeEvent {
  nodeId: string;
  text: string;
}

export interface NodeLabelChangeEvent {
  nodeId: string;
  label: string;
}

export interface NodeDeleteEvent {
  nodeId: string;
}

@Component({
  selector: 'app-text-node',
  standalone: true,
  imports: [],
  templateUrl: './text-node.component.html',
  styleUrl: './text-node.component.css',
})
export class TextNodeComponent {
  node = input.required<TextNode>();
  level = input<number>(1);

  nodeKeydown = output<NodeKeydownEvent>();
  textChange = output<NodeTextChangeEvent>();
  labelChange = output<NodeLabelChangeEvent>();
  deleteNode = output<NodeDeleteEvent>();

  onKeydown(event: KeyboardEvent, textarea: HTMLTextAreaElement): void {
    if (
      event.key === 'Enter' ||
      event.key === 'Tab'
    ) {
      event.preventDefault();
      this.nodeKeydown.emit({
        nodeId: this.node().id,
        event,
        cursorPos: textarea.selectionStart,
      });
    }
  }

  onTextInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.textChange.emit({ nodeId: this.node().id, text: value });
  }

  onLabelInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.labelChange.emit({ nodeId: this.node().id, label: value });
  }

  onDelete(): void {
    this.deleteNode.emit({ nodeId: this.node().id });
  }

  // Re-emit child events so they bubble up to the container
  onChildKeydown(event: NodeKeydownEvent): void {
    this.nodeKeydown.emit(event);
  }

  onChildTextChange(event: NodeTextChangeEvent): void {
    this.textChange.emit(event);
  }

  onChildLabelChange(event: NodeLabelChangeEvent): void {
    this.labelChange.emit(event);
  }

  onChildDelete(event: NodeDeleteEvent): void {
    this.deleteNode.emit(event);
  }
}
