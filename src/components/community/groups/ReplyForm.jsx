import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/common/RichTextEditor';

export default function ReplyForm({ 
  onSubmit,
  initialContent = '',
  onCancel,
  isSubmitting = false
}) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      if (!initialContent) setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border rounded-lg p-4">
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Write your reply..."
        className="min-h-[120px]"
      />
      <div className="flex justify-end gap-2 mt-3">
        {onCancel && (
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          variant="primary" 
          icon={<FiSend />}
          disabled={!content.trim() || isSubmitting}
        >
          {initialContent ? 'Update' : 'Post'} Reply
        </Button>
      </div>
    </form>
  );
}