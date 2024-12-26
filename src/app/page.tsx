'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { UserCard } from '@/components/ui/UserCard';
import { UnfollowButton } from '@/components/ui/UnfollowButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useInstagramAnalytics } from '@/hooks/useInstagramAnalytics';
import { useStore } from '@/store/useStore';
import { UserNode } from '@/types/auth';

export default function Home() {
  const {
    following,
    followers,
    scanProgress,
    isPaused,
    isScanning,
    selectedUsers,
    selectAllUsers,
    clearSelection,
    whitelistedUsers,
  } = useStore();

  const {
    startAnalysis,
    pauseAnalysis,
    resumeAnalysis,
    getNonFollowers,
    getMutualFollowers,
  } = useInstagramAnalytics();

  const [activeTab, setActiveTab] = useState<'non-followers' | 'mutual' | 'all' | 'whitelist'>('non-followers');
  const [searchQuery, setSearchQuery] = useState('');

  const filterUsers = (users: UserNode[]) => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user: UserNode) =>
        user.username.toLowerCase().includes(query) ||
        user.full_name.toLowerCase().includes(query)
    );
  };

  const getActiveUsers = () => {
    let users: UserNode[] = [];
    switch (activeTab) {
      case 'non-followers':
        users = getNonFollowers().filter(user => !whitelistedUsers.has(user.id));
        break;
      case 'mutual':
        users = getMutualFollowers();
        break;
      case 'all':
        users = following;
        break;
      case 'whitelist':
        users = following.filter(user => whitelistedUsers.has(user.id));
        break;
      default:
        users = [];
    }
    return filterUsers(users);
  };

  const activeUsers = getActiveUsers();
  const nonWhitelistedUsers = activeUsers.filter(user => !whitelistedUsers.has(user.id));
  const allSelected = nonWhitelistedUsers.length > 0 && 
    nonWhitelistedUsers.every(user => selectedUsers.has(user.id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllUsers(nonWhitelistedUsers.map(user => user.id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Instagram Analytics
          </h1>

          <ProgressBar
            progress={scanProgress}
            isScanning={isScanning}
            isPaused={isPaused}
            onPause={pauseAnalysis}
            onResume={resumeAnalysis}
          />

          {!isScanning && scanProgress === 0 && (
            <button
              onClick={startAnalysis}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Analysis
            </button>
          )}
        </div>

        {following.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('non-followers')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'non-followers'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Not Following Back ({getNonFollowers().filter(user => !whitelistedUsers.has(user.id)).length})
                  </button>
                  <button
                    onClick={() => setActiveTab('mutual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'mutual'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Mutual ({getMutualFollowers().length})
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Following ({following.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('whitelist')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'whitelist'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Whitelisted ({whitelistedUsers.size})
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  {activeTab === 'non-followers' && (
                    <>
                      <button
                        onClick={handleSelectAll}
                        className={`
                          px-4 py-2 rounded-md text-sm font-medium transition-all
                          ${allSelected
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }
                        `}
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                      <UnfollowButton />
                    </>
                  )}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                {activeUsers.length} users found
                {activeTab === 'non-followers' && selectedUsers.size > 0 && (
                  <span className="ml-2">
                    ({selectedUsers.size} selected)
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {activeUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    showWhitelistButton={true}
                    showSelectCheckbox={activeTab === 'non-followers' && !whitelistedUsers.has(user.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 