# Hebrew Text Sectioning Tool

An Angular-based tool for dividing Hebrew text into nested XML sections with an intuitive visual interface.

## Features

- **Hebrew Text Support**: Full RTL (right-to-left) text support with Hebrew fonts
- **Visual Selection**: Select any portion of your text to create sections
- **Nested Sections**: Support for multiple section types with unlimited nesting:
  - Chapter (`<chapter>`)
  - Section (`<section>`)
  - Subsection (`<subsection>`)
  - Paragraph (`<paragraph>`)
- **Optional Labels**: Add custom labels to sections (e.g., "פרק א", "חלק ראשון")
- **Real-time XML Preview**: See your XML structure update as you work
- **Section Tree View**: Visual overview of your document structure
- **Export Options**: Copy to clipboard or download as XML file

## Getting Started

### Prerequisites

- Node.js (v20.x or v22.x recommended)
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
npm start
```

The application will open at `http://localhost:4200/`

## How to Use

1. **Paste Your Hebrew Text**:
   - Paste your Hebrew text in the left text area

2. **Select Text**:
   - Click and drag to select any portion of text you want to turn into a section

3. **Create Section**:
   - Choose section type (Chapter, Section, Subsection, or Paragraph)
   - Optionally add a label in Hebrew
   - Click "Add Section"

4. **Build Nested Structure**:
   - Select text within an existing section to create nested subsections
   - The tool automatically determines the hierarchy based on your selections

5. **Review & Export**:
   - View the section tree to see your document structure
   - Check the XML output on the right
   - Copy to clipboard or download as XML file

## Example Usage

For text like:
```
פרק ראשון: בראשית
בתחילה ברא אלוהים...
פרק שני: נח
ויהי נח איש צדיק...
```

You can create:
```xml
<chapter label="פרק ראשון: בראשית">
  <section>בתחילה ברא אלוהים...</section>
</chapter>
<chapter label="פרק שני: נח">
  <section>ויהי נח איש צדיק...</section>
</chapter>
```

## Section Management

- **Remove Sections**: Click the × button next to any section in the tree
- **Clear All**: Use the "Clear All" button to start over
- **Nested Sections**: Sections are automatically nested based on their text position

## Tips

- Select from largest to smallest sections for easiest workflow
- Labels are optional but help identify sections
- The XML output updates automatically as you add/remove sections
- All Hebrew text maintains RTL formatting

## Development

Built with:
- Angular 17
- TypeScript
- Standalone Components
- FormsModule for two-way binding

## License

ISC
