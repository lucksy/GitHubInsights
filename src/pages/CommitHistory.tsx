import React, { useEffect, useState, FormEvent, useCallback, useRef } from 'react';
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
  const [debouncedFilters, setDebouncedFilters] = useState<FilterParams>(filters);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const searchTimeout = useRef<number>();

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
    const fetchInitialCommits = async () => {
      if (!user) return;

      try {
        setInitialLoading(true);
        const response = await githubService.searchUserCommits(
          user.login,
          1,
          ITEMS_PER_PAGE,
          '',
          null,
          null
        );

        setTotalCount(response.total_count);
        setCommits(groupCommitsByDate(response.items));
      } catch (err) {
        console.error('Failed to fetch commits:', err);
        setError('Failed to load commit history');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialCommits();
  }, [user, groupCommitsByDate]);

  // Debounce filters changes
  useEffect(() => {
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = window.setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, SEARCH_DELAY);

    return () => {
      if (searchTimeout.current) {
        window.clearTimeout(searchTimeout.current);
      }
    };
  }, [filters]);

  // Fetch filtered commits
  useEffect(() => {
    const fetchCommits = async () => {
      if (!user) return;

      try {
        setListLoading(true);
        const response = await githubService.searchUserCommits(
          user.login,
          page,
          ITEMS_PER_PAGE,
          debouncedFilters.searchTerm,
          debouncedFilters.startDate ? new Date(debouncedFilters.startDate) : null,
          debouncedFilters.endDate ? new Date(debouncedFilters.endDate) : null
        );

        setTotalCount(response.total_count);
        setCommits(groupCommitsByDate(response.items));
      } catch (err) {
        console.error('Failed to fetch commits:', err);
        setError('Failed to load commit history');
      } finally {
        setListLoading(false);
      }
    };

    if (!initialLoading) {
      fetchCommits();
    }
  }, [user, page, debouncedFilters, groupCommitsByDate, initialLoading]);

  const handleSearchChange = (e: FormEvent<HTMLTdsTextFieldElement>) => {
    const target = e.target as HTMLInputElement;
    setFilters(prev => ({ ...prev, searchTerm: target.value }));
  };

  const handleDateChange = (type: 'start' | 'end') => (e: CustomEvent) => {
    const value = e.detail;
    setFilters(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value
    }));
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

  return (
    <div className="commit-history">
        <h1 className="text-4xl font-bold mb-8">MY COMMITS</h1>
      <div className="filters-container">
        <div className="search-container">
          <TdsTextField
            type="text"
            placeholder="Search"
            value={filters.searchTerm}
            onInput={handleSearchChange}
          />
        </div>
        
        <div className="date-filters">
          <TdsDatetime
            label="From"
            value={filters.startDate || ''}
            onTdsChange={handleDateChange('start')}
            max={filters.endDate || undefined}
          />
          <TdsDatetime
            label="To"
            value={filters.endDate || ''}
            onTdsChange={handleDateChange('end')}
            min={filters.startDate || undefined}
          />
        </div>
      </div>
  
      <div className="commits-container">
        {listLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <TdsSpinner />
          </div>
        )}
  
        {Object.entries(commits).map(([date, dayCommits]) => (
          <div key={date} className="date-group">
            <h2>{date}</h2>
            <div className="commit-list">
              {dayCommits.map((commit) => (
                <div key={commit.sha} className="commit-item">
                  <img
                    src={commit.author?.avatar_url || '/api/placeholder/32/32'}
                    alt={`${commit.commit.author.name}'s avatar`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="commit-message">{commit.commit.message}</p>
                    <p className="text-gray-500">
                      {commit.commit.author.name} authored {formatTimeAgo(commit.commit.author.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
  
        {Object.keys(commits).length === 0 && !listLoading && (
          <div className="text-center">
            No commits found {filters.searchTerm && 'matching your search'}
          </div>
        )}
      </div>
  
      {totalCount > ITEMS_PER_PAGE && (
        <div className="sticky">
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