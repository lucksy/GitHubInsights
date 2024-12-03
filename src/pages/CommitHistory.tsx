import React, { useEffect, useState, FormEvent } from 'react';
import { TdsTextField, TdsSpinner, TdsMessage } from '@scania/tegel-react';
import { useAuth } from '../contexts/AuthContext';
import { githubService } from '../services/github/api';
import type { CommitItem } from '../services/github/types';
import Pagination from '../components/Pagination';
import './CommitHistory.css';

interface GroupedCommits {
  [date: string]: CommitItem[];
}

const ITEMS_PER_PAGE = 30;

const CommitHistory = () => {
  const [commits, setCommits] = useState<GroupedCommits>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCommits = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await githubService.searchUserCommits(
          user.login,
          page,
          ITEMS_PER_PAGE,
          searchTerm
        );

        setTotalCount(response.total_count);

        // Group commits by date
        const grouped = response.items.reduce((groups: GroupedCommits, commit: CommitItem) => {
          const date = new Date(commit.commit.author.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
          });
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(commit);
          return groups;
        }, {});

        setCommits(grouped);
      } catch (err) {
        console.error('Failed to fetch commits:', err);
        setError('Failed to load commit history');
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [user, page, searchTerm]);

  const handleSearchChange = (e: FormEvent<HTMLTdsTextFieldElement>) => {
    const target = e.target as HTMLInputElement;
    setSearchTerm(target.value);
    setPage(1); // Reset to first page when search changes
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} years ago`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <TdsSpinner />
      </div>
    );
  }

  if (error) {
    return <TdsMessage variant="error">{error}</TdsMessage>;
  }

  return (
    <div className="commit-history p-6">
      <h1 className="text-4xl font-bold mb-8">MY COMMITS</h1>
      
      <div className="search-container mb-8">
        <TdsTextField
          type="text"
          placeholder="Search commits..."
          value={searchTerm}
          onInput={handleSearchChange}
        />
      </div>

      <div className="commits-container mb-8">
        {Object.entries(commits).map(([date, dayCommits]) => (
          <div key={date} className="date-group mb-8">
            <h2 className="text-xl font-semibold mb-4">{date}</h2>
            <div className="commit-list space-y-4">
              {dayCommits.map((commit) => (
                <div key={commit.sha} className="commit-item flex items-start p-4 hover:bg-gray-50 rounded-lg">
                  <img
                    src={commit.author?.avatar_url || '/api/placeholder/40/40'}
                    alt="Author avatar"
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="commit-message font-medium">
                        {commit.commit.message}
                      </p>
                      <span className="text-sm text-gray-500">
                        {commit.repository.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {commit.commit.author.name} authored {' '}
                      {formatTimeAgo(commit.commit.author.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(commits).length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No commits found {searchTerm && 'matching your search'}
          </div>
        )}
      </div>

      {totalCount > ITEMS_PER_PAGE && (
        <div className="sticky bottom-0 bg-white border-t">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default CommitHistory;