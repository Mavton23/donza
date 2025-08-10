import { useState } from 'react';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export default function VoteButtons({ 
  initialUpvotes = 0, 
  initialUserVote = null,
  onVote 
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState(initialUserVote);

  const handleVote = (type) => {
    const newVote = userVote === type ? null : type;
    const voteChange = newVote === 'up' ? 1 : -1;
    const previousVoteEffect = userVote === 'up' ? -1 : userVote === 'down' ? 1 : 0;
    
    const newUpvotes = upvotes + voteChange + previousVoteEffect;
    
    setUserVote(newVote);
    setUpvotes(newUpvotes);
    if (onVote) onVote(newVote);
  };

  return (
    <div className="flex flex-col items-center mr-4">
      <Button
        variant="ghost"
        size="sm"
        icon={<FiThumbsUp />}
        className={`p-1 ${userVote === 'up' ? 'text-green-500' : 'text-gray-500'}`}
        onClick={() => handleVote('up')}
      />
      <span className="my-1 font-medium">{upvotes}</span>
      <Button
        variant="ghost"
        size="sm"
        icon={<FiThumbsDown />}
        className={`p-1 ${userVote === 'down' ? 'text-red-500' : 'text-gray-500'}`}
        onClick={() => handleVote('down')}
      />
    </div>
  );
}