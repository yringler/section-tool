export interface TextNode {
  id: string;
  label: string;
  children: (TextNode | string)[];  // Mixed content: text strings and child nodes
  text?: string;  // Deprecated: kept for backward compatibility
}
