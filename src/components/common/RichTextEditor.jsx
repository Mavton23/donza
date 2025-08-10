import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from './LoadingSpinner';
import Icon from './Icon';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write something...',
  maxLength = 5000,
  className = '',
  disabled = false
}) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'course_content');

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const imageUrl = response.data.secure_url;
      
      if (editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (err) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Image upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current.click();
  };

  if (!editor) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`border rounded-lg dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Menu de ferramentas */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Botões de formatação */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
          }`}
          title="Bold"
        >
          <Icon name="bold" size="sm" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
          }`}
          title="Italic"
        >
          <Icon name="italic" size="sm" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
          }`}
          title="Underline"
        >
          <Icon name="underline" size="sm" />
        </button>

        {/* Dropdown de cabeçalhos */}
        <select
          value={editor.getAttributes('heading').level || 'paragraph'}
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          className="p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        {/* Botão de link */}
        <button
          type="button"
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('URL', previousUrl);

            if (url === null) return;
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }

            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
          }`}
          title="Link"
        >
          <Icon name="link" size="sm" />
        </button>

        {/* Botão de imagem */}
        <div className="relative">
          <button
            type="button"
            onClick={triggerImageUpload}
            disabled={isUploading}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Insert image"
          >
            {isUploading ? (
              <LoadingSpinner size="xs" />
            ) : (
              <Icon name="image" size="sm" />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleImageUpload(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Alinhamento de texto */}
        <div className="flex border-l border-gray-300 dark:border-gray-600 ml-2 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
            }`}
            title="Align left"
          >
            <Icon name="align-left" size="sm" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
            }`}
            title="Align center"
          >
            <Icon name="align-center" size="sm" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
            }`}
            title="Align right"
          >
            <Icon name="align-right" size="sm" />
          </button>
        </div>

        {/* Listas */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
          }`}
          title="Bullet list"
        >
          <Icon name="list" size="sm" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
          }`}
          title="Numbered list"
        >
          <Icon name="list-ordered" size="sm" />
        </button>

        {/* Limpar formatação */}
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ml-auto"
          title="Clear formatting"
        >
          <Icon name="remove-formatting" size="sm" />
        </button>
      </div>

      {/* Área de edição */}
      <div className="p-4 bg-white dark:bg-gray-900 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>

      {/* Contador de caracteres e erro de upload */}
      <div className="flex justify-between items-center p-2 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div>
          {editor.storage.characterCount.characters()}/{maxLength} characters
        </div>
        {uploadError && (
          <div className="text-red-500 dark:text-red-400">
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool
};