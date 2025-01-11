class RichTextEditor {
    constructor(editorId, previewId) {
        this.editor = document.getElementById(editorId);
        this.preview = document.getElementById(previewId);
        if (!this.editor) return;

        // Make sure editor is editable
        this.editor.setAttribute('contenteditable', 'true');
        this.editor.classList.add('rich-editor');
        
        // Create and setup toolbar
        this.setupToolbar();
        this.setupEventListeners();
    }

    setupToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        
        const tools = [
            { icon: '𝗕', command: 'bold', title: 'Bold' },
            { icon: '𝘐', command: 'italic', title: 'Italic' },
            { icon: '𝕌', command: 'underline', title: 'Underline' },
            { icon: '𝗛', command: 'formatBlock', value: 'h1', title: 'Heading 1' },
            { icon: '•', command: 'insertUnorderedList', title: 'Bullet List' },
            { icon: '1.', command: 'insertOrderedList', title: 'Numbered List' },
            { icon: '⌫', command: 'removeFormat', title: 'Clear Format' }
        ];

        tools.forEach(tool => {
            const button = document.createElement('button');
            button.type = 'button'; // Prevent form submission
            button.className = 'editor-tool';
            button.textContent = tool.icon;
            button.title = tool.title;
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.editor.focus();
                document.execCommand(tool.command, false, tool.value || null);
                this.updatePreview();
            });
            
            toolbar.appendChild(button);
        });

        // Add color picker
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.title = 'Text Color';
        colorPicker.className = 'editor-color';
        colorPicker.value = '#000000';
        colorPicker.addEventListener('input', (e) => {
            this.editor.focus();
            document.execCommand('foreColor', false, e.target.value);
            this.updatePreview();
        });
        toolbar.appendChild(colorPicker);

        // Insert toolbar before the editor
        this.editor.parentNode.insertBefore(toolbar, this.editor);
    }

    setupEventListeners() {
        this.editor.addEventListener('input', () => this.updatePreview());
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                document.execCommand('insertLineBreak');
            }
        });
    }

    updatePreview() {
        if (this.preview) {
            this.preview.innerHTML = this.editor.innerHTML;
        }
    }

    getContent() {
        return this.editor.innerHTML;
    }

    setContent(html) {
        this.editor.innerHTML = html;
        this.updatePreview();
    }

    clear() {
        this.editor.innerHTML = '';
        this.updatePreview();
    }
}
