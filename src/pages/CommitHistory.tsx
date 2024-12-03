import { useEffect, useState, FormEvent, useCallback, useRef } from 'react';
import { TdsTextField, TdsSpinner, TdsMessage, TdsDatetime } from '@scania/tegel-react';
import { useAuth } from '../contexts/AuthContext';
import { githubService } from '../services/github/api';
import type { CommitItem } from '../services/github/types';
import Pagination from '../components/Pagination';
import './CommitHistory.css';

interface GroupedCommits {
  [date: string]: CommitItem[];
}

interface FilterParams {
  searchTerm: string;
  startDate: string | null;
  endDate: string | null;
}

const ITEMS_PER_PAGE = 30;
const SEARCH_DELAY = 500;
const CACHE_KEY = 'github_commits_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const CommitHistory = () => {
  const [commits, setCommits] = useState<GroupedCommits>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterParams>({
    searchTerm: '',
    startDate: null,
    endDate: null,
  });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const searchTimeout = useRef<number>();

  const loadFromCache = useCallback(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  }, []);

  const saveToCache = useCallback((data: { commits: GroupedCommits; totalCount: number }) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }, []);

  const groupCommitsByDate = useCallback((items: CommitItem[]): GroupedCommits => {
    return items.reduce((groups: GroupedCommits, commit: CommitItem) => {
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
  }, []);

  useEffect(() => {
    const fetchCommits = async () => {
        if (!user) return;

        try {
            // Show loading state for all searches
            setListLoading(true);

            // Only try cache for initial, unfiltered load
            if (page === 1 && !filters.searchTerm && !filters.startDate && !filters.endDate) {
                const cachedData = loadFromCache();
                if (cachedData) {
                    setCommits(cachedData.commits);
                    setTotalCount(cachedData.totalCount);
                    setInitialLoading(false);
                    setListLoading(false);
                    return;
                }
            }

            const response = await githubService.searchUserCommits(
                user.login,
                page,
                ITEMS_PER_PAGE,
                filters.searchTerm,
                filters.startDate ? new Date(filters.startDate) : null,
                filters.endDate ? new Date(filters.endDate) : null
            );

            const groupedCommits = groupCommitsByDate(response.items);
            setCommits(groupedCommits);
            setTotalCount(response.total_count);

            // Only cache unfiltered results
            if (!filters.searchTerm && !filters.startDate && !filters.endDate) {
                saveToCache({
                    commits: groupedCommits,
                    totalCount: response.total_count
                });
            }
        } catch (err) {
            console.error('Failed to fetch commits:', err);
            setError('Failed to load commit history');
        } finally {
            setInitialLoading(false);
            setListLoading(false);
        }
    };

    fetchCommits();
}, [user, page, filters, groupCommitsByDate, loadFromCache, saveToCache]);

  const handleSearchChange = (e: FormEvent<HTMLTdsTextFieldElement>) => {
    const target = e.target as HTMLInputElement;
    
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = window.setTimeout(() => {
      setFilters(prev => ({ ...prev, searchTerm: target.value }));
      setPage(1);
    }, SEARCH_DELAY);
  };

  const handleDateChange = (type: 'start' | 'end') => (e: CustomEvent) => {
    const value = e.detail;
    setFilters(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value
    }));
    setPage(1);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo`;
    return `${Math.floor(diffInSeconds / 31536000)}y`;
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <TdsSpinner />
      </div>
    );
  }

  if (error) {
    return <TdsMessage variant="error">{error}</TdsMessage>;
  }

  const handleCommitClick = (htmlUrl: string) => {
    window.open(htmlUrl, '_blank', 'noopener noreferrer');
  };

  return (
    <div className="commit-history">
      <div className="header p-4">
        <h1 className="text-2xl font-bold mb-4">Commits</h1>
        
        <div className="filters flex flex-col md:flex-row gap-4">
        <div className="text-filters flex gap-4">
          <TdsTextField
            type="text"
            placeholder="Search commits..."
            value={filters.searchTerm}
            onInput={handleSearchChange}
          />
          </div>
          
          <div className="date-filters flex gap-4">
            <TdsDatetime
              label="From"
              value={filters.startDate || ''}
              onTdsChange={handleDateChange('start')}
              max={filters.endDate || undefined}
              disabled={listLoading}
            />
            <TdsDatetime
              label="To"
              value={filters.endDate || ''}
              onTdsChange={handleDateChange('end')}
              min={filters.startDate || undefined}
              disabled={listLoading}
            />
          </div>
        </div>
      </div>

      <div className="commits-list-wrap p-4 relative">
        {listLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <TdsSpinner />
          </div>
        )}

        {Object.entries(commits).map(([date, dayCommits]) => (
          <div key={date} className="date-group mb-6">
            <h2 className="text-lg font-semibold mb-2">{date}</h2>
            <div className="commit-list space-y-2">
              {dayCommits.map((commit) => (
                <div
                key={commit.sha}
                className="commit-item"
                onClick={() => handleCommitClick(commit.html_url)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCommitClick(commit.html_url);
                  }
                }}
              >
                  <div className="commit-avatar">
                    <img
                      src={commit.author?.avatar_url || '/api/placeholder/32/32'}
                      alt="Author avatar"
                    />
                  </div>
                  <div className="commit-content">
                    <div className="commit-message">
                      {commit.commit.message}
                    </div>
                    <div className="commit-meta">
                      <span>{commit.commit.author.name}</span>
                      <span>authored {formatTimeAgo(commit.commit.author.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(commits).length === 0 && !listLoading && (
          <div className="empty-state">
            <p>No commits found</p>
            {filters.searchTerm && <p>Try adjusting your search terms</p>}
          </div>
        )}
      </div>

      {totalCount > ITEMS_PER_PAGE && (
        <div className="pagination-container">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
            onPageChange={setPage}
            disabled={listLoading}
          />
        </div>
      )}
    </div>
  );
};

export default CommitHistory;