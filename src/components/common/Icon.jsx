import PropTypes from 'prop-types';
import * as LucideIcons from 'lucide-react';

const iconAliases = {
  'upload-cloud': 'UploadCloud',
  'trash-2': 'Trash2',
  'message-square': 'MessageSquare',
  'message-square-text':'MessageSquareText',
  'chevron-down': 'ChevronDown',
  'log-out': 'LogOut',
  'user': 'User',
  'user-plus': 'UserPlus',
  'user-minus': 'UserMinus',
  'users': 'Users',
  'edit': 'Edit',
  'edit-2': 'Edit2',
  'edit-3': 'Edit3',
  'check': 'Check',
  'x': 'X',
  'plus': 'Plus',
  'minus': 'Minus',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'chevron-up': 'ChevronUp',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'home': 'Home',
  'settings': 'Settings',
  'search': 'Search',
  'bell': 'Bell',
  'calendar': 'Calendar',
  'clock': 'Clock',
  'file': 'File',
  'file-text': 'FileText',
  'image': 'Image',
  'link': 'Link',
  'bookmark': 'Bookmark',
  'heart': 'Heart',
  'star': 'Star',
  'camera': 'Camera',
  'mail': 'Mail',
  'phone': 'Phone',
  'menu': 'Menu',
  'more-horizontal': 'MoreHorizontal',
  'more-vertical': 'MoreVertical',
  'copy': 'Copy',
  'download': 'Download',
  'upload': 'Upload',
  'eye': 'Eye',
  'eye-off': 'EyeOff',
  'lock': 'Lock',
  'unlock': 'Unlock',
  'refresh-cw': 'RefreshCw',
  'refresh-ccw': 'RefreshCcw',
  'repeat': 'Repeat',
  'play': 'Play',
  'pause': 'Pause',
  'stop': 'Stop',
  'alert-triangle': 'AlertTriangle',
  'alert-octagon': 'AlertOctagon',
  'check-circle': 'CheckCircle',
  'x-circle': 'XCircle',
  'info': 'Info',
  'help-circle': 'HelpCircle',
  'tag': 'Tag',
  'shopping-cart': 'ShoppingCart',
  'credit-card': 'CreditCard',
  'globe': 'Globe',
  'map': 'Map',
  'map-pin': 'MapPin',
  'location': 'MapPin',
  'wifi': 'Wifi',
  'folder': 'Folder',
  'shield': 'Shield',
  'database': 'Database',
  'code': 'Code',
  'terminal': 'Terminal',
  'bar-chart': 'BarChart',
  'pie-chart': 'PieChart',
  'trending-up': 'TrendingUp',
  'trending-down': 'TrendingDown'
};

const toPascalCase = (str) => {
  if (typeof str !== 'string') {
    console.warn('Icon name must be a string');
    return '';
  }
  
  return str.replace(/(^\w|-\w)/g, (match) => 
    match.replace(/-/, '').toUpperCase()
  );
};

export default function Icon({ 
  name, 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  if (!name) {
    console.warn('Icon component requires a name prop');
    return null;
  }

  const iconName = iconAliases[name] || toPascalCase(name) || name;
  const IconComponent = LucideIcons[iconName];

  if (!IconComponent) {
    console.warn(`Icon "${name}" (resolved as "${iconName}") not found in Lucide icons`);
    return null;
  }

  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${className}`} 
      {...props}
    />
  );
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string
};