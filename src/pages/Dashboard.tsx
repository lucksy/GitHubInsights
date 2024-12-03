import React, { useEffect, useState, useCallback } from 'react';
import { TdsCard, TdsSpinner, TdsMessage, TdsIcon } from '@scania/tegel-react';
import { useAuth } from '../contexts/AuthContext';
import { githubService } from '../services/github/api';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    TooltipItem
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

const GitHubDashboard = () => {
  const { user, token } = useAuth();
  const [totalCommits, setTotalCommits] = useState<number>(0);
  const [monthlyCommits, setMonthlyCommits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [languageStats, setLanguageStats] = useState<Record<string, number>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    if (!token || !user) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      githubService.setToken(token);

      // Fetch repositories and process data
      const repos = await githubService.getUserRepositories(user.login);

      // Calculate language statistics
      const langStats = await githubService.calculateLanguageStats(repos);
      setLanguageStats(langStats);

      // Get commit statistics
      const commitStats = await githubService.getCommitStats(user.login, repos);
      setTotalCommits(commitStats.totalCommits);
      setMonthlyCommits(commitStats.monthlyCommits);
      
      setLastRefresh(new Date());
      setError('');
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to fetch GitHub data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, user]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up auto-refresh interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, REFRESH_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  const getLast6Months = () => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonth = now.getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      months.push(monthNames[monthIndex]);
    }
    return months;
  };

  const getTimeUntilNextRefresh = () => {
    const nextRefresh = new Date(lastRefresh.getTime() + REFRESH_INTERVAL);
    const difference = nextRefresh.getTime() - new Date().getTime();
    const minutes = Math.floor(difference / 60000);
    return `${minutes} minutes`;
  };

  const last6Months = getLast6Months();

  const commitData = {
    labels: last6Months,
    datasets: [{
      label: 'Commits',
      data: last6Months.map(month => monthlyCommits[month] || 0),
      backgroundColor: last6Months.map((_, index) => 
        index === last6Months.length - 2 ? '#0A1F44' : '#D9E0EA'
      ),
      borderRadius: 0,
      barThickness: 20,
    }],
  };

  const barOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            return `${context.formattedValue} commits`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        },
        border: {
          display: false
        }
      }
    },
  };

  // Sort languages by percentage and take top ones
  const topLanguages: Record<string, number> = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  const languageData = {
    labels: Object.keys(topLanguages),
    datasets: [{
      data: Object.values(topLanguages),
      backgroundColor: [
        '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c'
      ],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: '75%',
  };

  if (loading) return <div className="tds-u-p4 tds-u-text-center sm"><TdsSpinner /></div>;
  if (error) return <TdsMessage variant="error">{error}</TdsMessage>;

  return (
    <div className="tds-grid-container" style={{ flexDirection: 'column' }}>
      <div className="tds-grid-fluid tds-u-pb3 mobile-shink">
        <div className="tds-grid-item">
          <div className="flex justify-between items-center">
            <h1 className="tds-u-mb4 tds-headline-01">MY GITHUB SUMMARY</h1>
          </div>
        </div>
      </div>
      
      <div className="tds-grid-fluid tds-u-pb3 mobile-shink">
        <div className="tds-grid-item">
          <h2 className="tds-u-mb4 tds-headline-03">Summary</h2>
        </div>
      </div>

      <div className="tds-grid-fluid tds-u-pb3 mobile-shink">
        <div className="tds-grid-item">
          <TdsCard header="Number of projects" modeVariant='secondary'>
            <div slot="body">
              <p className="tds-headline-01">
                {user?.public_repos || 0}
              </p>
            </div>
          </TdsCard>
        </div>
        
        <div className="tds-grid-item">
          <TdsCard header="Total commits this year" modeVariant='secondary' onClick={() => navigate('/commits')}>
            <div slot="body">
              <p className="tds-headline-01">{totalCommits.toLocaleString()}</p>
            </div>
          </TdsCard>
        </div>
        
        <div className="tds-grid-item">
          <TdsCard header="Followers" modeVariant='secondary'>
            <div slot="body">
              <p className="tds-headline-01">
                {user?.followers || 0}
              </p>
            </div>
          </TdsCard>
        </div>
        
        <div className="tds-grid-item">
          <TdsCard header="Following" modeVariant='secondary'>
            <div slot="body">
              <p className="tds-headline-01">
                {user?.following || 0}
              </p>
            </div>
          </TdsCard>
        </div>
      </div>

      <div className="tds-grid-fluid tds-u-pb3">
        <div className="tds-grid-item" style={{ gridColumn: 'span 9' }}>
          <h2 className="tds-u-mb4 tds-headline-03">Commit count <TdsIcon name="redirect" /></h2>
          <TdsCard header="Months" modeVariant='secondary'>
            <div slot="body" style={{ height: '300px', padding: '20px' }}>
              <Bar data={commitData} options={barOptions} />
            </div>
          </TdsCard>
        </div>

        <div className="tds-grid-item" style={{ gridColumn: 'span 3' }}>
          <h2 className="tds-u-mb4 tds-headline-03">Programming Languages <TdsIcon name="redirect" /></h2>
          <TdsCard header="Composition" modeVariant='secondary'>
            <div slot="body" style={{ height: '300px', padding: '20px' }}>
              <Doughnut data={languageData} options={doughnutOptions} />
              <div className="tds-u-flex tds-u-justify-content-center tds-u-gap2 tds-u-mt4">
                {Object.entries(topLanguages).map(([language, percentage], index) => (
                  <div key={index} className="tds-u-flex tds-u-items-center tds-u-gap1 tds-u-mb4">
                    <div 
                      className="tds-u-w1 tds-u-h1 tds-u-rounded-full" 
                      style={{ 
                        backgroundColor: (languageData.datasets[0].backgroundColor as string[])[index] 
                      }}
                    />
                    <span>{percentage.toString()}% {language}</span>
                  </div>
                ))}
              </div>
            </div>
          </TdsCard>
        </div>
      </div>

      <div className="tds-grid-fluid tds-u-p3 tds-u-mb1 tds-u-ml1">
        <div className="tds-grid-item w-full flex justify-center items-center gap-2" style={{ gridColumn: 'span 12' }}>
          <TdsIcon name="clock" className="text-gray-500" />
          <span className="text-sm text-gray-500 tds-u-m1">
            Last updated: {lastRefresh.toLocaleString()} • Next refresh in: {getTimeUntilNextRefresh()}
          </span>
          <button
                onClick={fetchDashboardData}
                disabled={isRefreshing}
                className="flex items-center gap-1 p-2 rounded hover:bg-gray-100"
              >
                <TdsIcon name="refresh" />
                {isRefreshing ? 'Refreshing...' : 'Refresh now'}
              </button>
        </div>
      </div>

    </div>
  );
};

export default GitHubDashboard;