import { FiMoreVertical, FiTrash2, FiEyeOff, FiAlertTriangle, FiUserX } from 'react-icons/fi';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function ContentModerationActions({ 
  content, 
  onDelete,
  onHide,
  onReport,
  onBanUser,
  isModerator = false 
}) {
  const handleAction = (action) => {
    switch(action) {
      case 'DELETE':
        onDelete(content.contentId);
        break;
      case 'HIDE':
        onHide(content.contentId);
        break;
      case 'REPORT_USER':
        onReport(content.author.userId);
        break;
      case 'BAN':
        onBanUser(content.author.userId);
        break;
      default:
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <FiMoreVertical className="mr-2" />
          Moderate
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleAction('DELETE')}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <FiTrash2 className="mr-2" />
          Delete Content
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleAction('HIDE')}>
          <FiEyeOff className="mr-2" />
          Hide Content
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleAction('REPORT_USER')}>
          <FiAlertTriangle className="mr-2" />
          Report User
        </DropdownMenuItem>
        
        {isModerator && (
          <DropdownMenuItem 
            onClick={() => handleAction('BAN')}
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <FiUserX className="mr-2" />
            Ban User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}