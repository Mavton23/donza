import { Button } from '../../components/ui/button';

export default function ConversationStarter({
  message,
  onMessageChange,
  onSubmit,
  loading
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Initial Message (Optional)
        </label>
        <textarea
          id="message"
          rows={3}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
          placeholder="Write your first message..."
          maxLength={2000}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          Start Conversation
        </Button>
      </div>
    </div>
  );
}