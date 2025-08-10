export default function Avatar({ user, size = 'md', className = '' }) {
    const sizes = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };
  
    return (
      <img
        src={user?.avatarUrl || '/images/placeholder.png'}
        alt={user?.username}
        className={`rounded-full ${sizes[size]} ${className}`}
      />
    );
  }