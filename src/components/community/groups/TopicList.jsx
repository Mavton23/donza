import { useState } from 'react';
import { FiMessageSquare, FiPlus, FiArrowLeft } from 'react-icons/fi';
import TopicItem from './TopicItem';
import TopicThread from './TopicThread';
import { Button } from '@/components/ui/button';
import NewTopicModal from './NewTopicModal';
import { useAuth } from '@/contexts/AuthContext';

export default function TopicList({ groupId, isMember }) {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('recent'); // 'recent' ou 'popular'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock data - substituir por chamada API real
  const [topics, setTopics] = useState([
    {
      topicId: '1',
      title: 'Como implementar drag-and-drop?',
      content: '<p>Preciso de ajuda para implementar drag-and-drop na lista de tarefas. Alguém tem um exemplo?</p>',
      author: { 
        userId: 'user1', 
        username: 'dev123', 
        avatarUrl: '' 
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyCount: 2,
      upvotes: 5,
      isPinned: true,
      isClosed: false,
      solutionId: null,
      replies: [
        {
          replyId: 'reply1',
          content: '<p>Você pode usar a biblioteca react-beautiful-dnd. É a melhor para esse caso!</p>',
          author: {
            userId: 'user2',
            username: 'frontendExpert',
            avatarUrl: ''
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          upvotes: 3,
          isSolution: false
        },
        {
          replyId: 'reply2',
          content: '<p>Também recomendo o react-dnd se precisar de mais flexibilidade.</p>',
          author: {
            userId: 'user3',
            username: 'reactDev',
            avatarUrl: ''
          },
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          upvotes: 1,
          isSolution: false
        }
      ]
    }
  ]);

  const sortedTopics = [...topics].sort((a, b) => {
    return sortBy === 'recent' 
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : (b.upvotes + b.replyCount) - (a.upvotes + a.replyCount);
  });

  const handleCreateTopic = (newTopicData) => {
    const newTopic = {
      topicId: Math.random().toString(36).substr(2, 9),
      ...newTopicData,
      author: {
        userId: user.userId,
        username: user.username,
        avatarUrl: user.avatarUrl
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyCount: 0,
      upvotes: 0,
      isPinned: false,
      isClosed: false,
      solutionId: null,
      replies: []
    };
    
    setTopics(prev => [newTopic, ...prev]);
    setIsModalOpen(false);
  };

  const handleReplySubmit = (topicId, content) => {
    setTopics(prev => prev.map(topic => {
      if (topic.topicId === topicId) {
        const newReply = {
          replyId: Math.random().toString(36).substr(2, 9),
          content,
          author: {
            userId: user.userId,
            username: user.username,
            avatarUrl: user.avatarUrl
          },
          createdAt: new Date().toISOString(),
          upvotes: 0,
          isSolution: false
        };
        
        return {
          ...topic,
          replyCount: topic.replyCount + 1,
          replies: [...topic.replies, newReply]
        };
      }
      return topic;
    }));
  };

  const handleMarkSolution = (topicId, replyId) => {
    setTopics(prev => prev.map(topic => 
      topic.topicId === topicId 
        ? { ...topic, solutionId: replyId }
        : topic
    ));
  };

  const handleReplyDelete = (topicId, replyId) => {
    setTopics(prev => prev.map(topic => {
      if (topic.topicId === topicId) {
        return {
          ...topic,
          replyCount: topic.replyCount - 1,
          replies: topic.replies.filter(reply => reply.replyId !== replyId),
          solutionId: topic.solutionId === replyId ? null : topic.solutionId
        };
      }
      return topic;
    }));
  };

  const handleReplyUpdate = (topicId, replyId, newContent) => {
    setTopics(prev => prev.map(topic => {
      if (topic.topicId === topicId) {
        return {
          ...topic,
          replies: topic.replies.map(reply => 
            reply.replyId === replyId
              ? { ...reply, content: newContent }
              : reply
          )
        };
      }
      return topic;
    }));
  };

  if (selectedTopic) {
    const fullTopic = topics.find(t => t.topicId === selectedTopic.topicId) || selectedTopic;
    
    return (
      <TopicThread
        topic={fullTopic}
        onBack={() => setSelectedTopic(null)}
        isMember={isMember}
        currentUser={user}
        onReplySubmit={(content) => handleReplySubmit(fullTopic.topicId, content)}
        onMarkSolution={(replyId) => handleMarkSolution(fullTopic.topicId, replyId)}
        onReplyDelete={(replyId) => handleReplyDelete(fullTopic.topicId, replyId)}
        onReplyUpdate={(replyId, content) => handleReplyUpdate(fullTopic.topicId, replyId, content)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={sortBy === 'recent' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            Recentes
          </Button>
          <Button 
            variant={sortBy === 'popular' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('popular')}
          >
            Populares
          </Button>
        </div>
        
        {isMember && (
          <Button 
            variant="primary" 
            size="sm" 
            icon={<FiPlus />}
            onClick={() => setIsModalOpen(true)}
          >
            Novo Tópico
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {sortedTopics.map(topic => (
          <TopicItem 
            key={topic.topicId} 
            topic={topic}
            onClick={() => setSelectedTopic(topic)}
          />
        ))}
      </div>

      <NewTopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTopic}
      />
    </div>
  );
}