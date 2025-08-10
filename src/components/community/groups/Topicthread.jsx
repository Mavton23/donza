import { useState } from 'react';
import { 
  FiMessageSquare, 
  FiUser, 
  FiClock,
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiArrowLeft
} from 'react-icons/fi';
import Avatar from '@/components/common/Avatar';
import TimeAgo from '@/components/common/TimeAgo';
import VoteButtons from './VoteButtons';
import ReplyForm from './ReplyForm';
import { Button } from '@/components/ui/button';

export default function TopicThread({ 
  topic, 
  onBack,
  isMember,
  currentUser,
  onReplySubmit,
  onReplyDelete,
  onReplyUpdate,
  onMarkSolution
}) {
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const isAuthor = (reply) => reply.author.userId === currentUser?.userId;
  const isTopicAuthor = topic.author.userId === currentUser?.userId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<FiArrowLeft />}
          onClick={onBack}
        >
          Back to discussions
        </Button>
        {isMember && (
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            {showReplyForm ? 'Cancel' : 'Add Reply'}
          </Button>
        )}
      </div>

      {/* Tópico Principal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start">
          <VoteButtons 
            initialUpvotes={topic.upvotes || 0} 
            initialUserVote={topic.userVote}
          />
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold flex items-center gap-2">
                {topic.title}
                {topic.isPinned && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                    Pinned
                  </span>
                )}
              </h1>
              {topic.isClosed && (
                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                  Closed
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <Avatar src={topic.author.avatarUrl} alt={topic.author.username} size="sm" />
              <span>{topic.author.username}</span>
              <FiClock className="ml-2" />
              <TimeAgo date={topic.createdAt} />
            </div>

            <div 
              className="mt-4 prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: topic.content }}
            />
          </div>
        </div>
      </div>

      {/* Formulário de Resposta (condicional) */}
      {showReplyForm && (
        <ReplyForm
          onSubmit={(content) => {
            onReplySubmit(content);
            setShowReplyForm(false);
          }}
        />
      )}

      {/* Lista de Respostas */}
      <div className="space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <FiMessageSquare />
          {topic.replies.length} {topic.replies.length === 1 ? 'Reply' : 'Replies'}
          {topic.solutionId && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded ml-2">
              Solved
            </span>
          )}
        </h2>

        {topic.replies.map(reply => (
          <div 
            key={reply.replyId}
            className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${reply.replyId === topic.solutionId ? 'border-2 border-green-500 dark:border-green-400' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <div className="flex items-start">
              <VoteButtons 
                initialUpvotes={reply.upvotes || 0}
                initialUserVote={reply.userVote}
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar src={reply.author.avatarUrl} alt={reply.author.username} size="sm" />
                    <span className="font-medium">{reply.author.username}</span>
                    {reply.replyId === topic.solutionId && (
                      <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <FiCheck className="mr-1" /> Solution
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiClock className="mr-1" />
                    <TimeAgo date={reply.createdAt} />
                  </div>
                </div>

                {editingReplyId === reply.replyId ? (
                  <ReplyForm
                    initialContent={reply.content}
                    onSubmit={(content) => {
                      onReplyUpdate(reply.replyId, content);
                      setEditingReplyId(null);
                    }}
                    onCancel={() => setEditingReplyId(null)}
                  />
                ) : (
                  <div 
                    className="mt-2 prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: reply.content }}
                  />
                )}

                <div className="flex justify-end gap-2 mt-3">
                  {isTopicAuthor && !topic.solutionId && !topic.isClosed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkSolution(reply.replyId)}
                    >
                      Mark as Solution
                    </Button>
                  )}
                  {isAuthor(reply) && !topic.isClosed && editingReplyId !== reply.replyId && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<FiEdit2 />}
                        onClick={() => setEditingReplyId(reply.replyId)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<FiTrash2 />}
                        onClick={() => onReplyDelete(reply.replyId)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}