import Image from 'next/image';
import { UserNode } from '@/types/auth';
import { useStore } from '@/store/useStore';

interface UserCardProps {
  user: UserNode;
  showWhitelistButton?: boolean;
  showSelectCheckbox?: boolean;
}

export const UserCard = ({ 
  user, 
  showWhitelistButton = true,
  showSelectCheckbox = false 
}: UserCardProps) => {
  const { 
    whitelistedUsers, 
    selectedUsers,
    addToWhitelist, 
    removeFromWhitelist,
    toggleUserSelection 
  } = useStore();
  
  const isWhitelisted = whitelistedUsers.has(user.id);
  const isSelected = selectedUsers.has(user.id);

  const handleWhitelistToggle = () => {
    if (isWhitelisted) {
      removeFromWhitelist(user.id);
    } else {
      addToWhitelist(user.id);
    }
  };

  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleUserSelection(user.id);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center space-x-4">
        {showSelectCheckbox && !isWhitelisted && (
          <div 
            onClick={handleSelectionToggle}
            className={`
              w-5 h-5 rounded border cursor-pointer transition-colors flex items-center justify-center
              ${isSelected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-300 hover:border-blue-500'
              }
            `}
          >
            {isSelected && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </div>
        )}

        <div className="relative h-12 w-12 rounded-full overflow-hidden">
          <Image
            src={user.profile_pic_url}
            alt={user.username}
            fill
            className="object-cover"
          />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <div>
              <h3 className="font-medium text-gray-900">@{user.username}</h3>
              <p className="text-sm text-gray-600">{user.full_name}</p>
            </div>
            {user.is_verified && (
              <span className="text-blue-500 flex-shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </span>
            )}
          </div>
          
          <div className="flex space-x-2 mt-1">
            {user.is_private && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                Private
              </span>
            )}
            {user.follows_viewer && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                Follows You
              </span>
            )}
            {isWhitelisted && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded flex items-center space-x-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" />
                  <line x1="16" y1="8" x2="2" y2="22" />
                  <line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
                <span>Protected</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {showWhitelistButton && (
        <div className="flex items-center">
          <button
            onClick={handleWhitelistToggle}
            className={`
              group relative px-4 py-2 rounded-md text-sm font-medium transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${
                isWhitelisted
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
            title={isWhitelisted ? 'Remove from protected users' : 'Add to protected users'}
          >
            <span className="flex items-center space-x-2">
              <svg 
                className={`w-4 h-4 transition-transform ${isWhitelisted ? 'text-green-500' : 'text-gray-400'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" />
                <line x1="16" y1="8" x2="2" y2="22" />
                <line x1="17.5" y1="15" x2="9" y2="15" />
              </svg>
              <span>{isWhitelisted ? 'Protected' : 'Protect'}</span>
            </span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-500 transform origin-left scale-x-0 transition-transform group-hover:scale-x-100" />
          </button>
        </div>
      )}
    </div>
  );
}; 