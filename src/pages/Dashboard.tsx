import React, { useEffect, useState } from 'react';
import { TdsCard, TdsSpinner, TdsMessage, TdsIcon } from '@scania/tegel-react';
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

const GitHubDashboard = () => {
  interface GitHubUser {
    public_repos: number;
    followers: number;
    following: number;
    login: string;
  }
  
  interface Repository {
    name: string;
    language: string;
  }

  interface MonthlyCommits {
    [key: string]: number;
  }
  
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [totalCommits, setTotalCommits] = useState<number>(0);
  const [monthlyCommits, setMonthlyCommits] = useState<MonthlyCommits>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [languageStats, setLanguageStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('github_token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      };

      try {
        // Fetch user data
        const userResponse = await fetch('https://api.github.com/user', { headers });
        const userData: GitHubUser = await userResponse.json();
        setUserData(userData);

        // Fetch repositories
        const reposResponse = await fetch(`https://api.github.com/users/${userData.login}/repos?per_page=100`, { headers });
        const repos: Repository[] = await reposResponse.json();

        // Calculate language statistics
        const languageCounts: { [key: string]: number } = {};
        let totalLanguages = 0;

        for (const repo of repos) {
          if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
            totalLanguages++;
          }
        }

        // Convert to percentages
        const languagePercentages = Object.entries(languageCounts).reduce((acc, [lang, count]) => {
          acc[lang] = Math.round((count / totalLanguages) * 100);
          return acc;
        }, {} as { [key: string]: number });

        setLanguageStats(languagePercentages);

        // Fetch commits for the last 6 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const commits: MonthlyCommits = {};
        let totalCommits = 0;

        // Initialize commits object with all months
        monthNames.forEach(month => {
          commits[month] = 0;
        });

        for (const repo of repos) {
          const now = new Date();
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

          const commitsResponse = await fetch(
            `https://api.github.com/repos/${userData.login}/${repo.name}/commits?since=${sixMonthsAgo.toISOString()}&until=${now.toISOString()}&per_page=100`,
            { headers }
          );

          if (commitsResponse.ok) {
            const repoCommits = await commitsResponse.json();
            
            if (Array.isArray(repoCommits)) {
              repoCommits.forEach(commit => {
                const date = new Date(commit.commit.author.date);
                const monthName = monthNames[date.getMonth()];
                commits[monthName] = (commits[monthName] || 0) + 1;
                totalCommits += 1;
              });
            }
          }
        }

        setMonthlyCommits(commits);
        setTotalCommits(totalCommits);

      } catch (err) {
        setError('Failed to fetch GitHub data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get last 6 months in order
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

  const last6Months = getLast6Months();

  const commitData = {
    labels: last6Months,
    datasets: [{
      label: 'Commits',
      data: last6Months.map(month => monthlyCommits[month] || 0),
      backgroundColor: last6Months.map((_, index) => 
        index === last6Months.length - 4 ? '#0A1F44' : '#D9E0EA'
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

  if (loading) return <div className="tds-u-p4 tds-u-text-center sm" ><TdsSpinner /></div>;
  if (error) return <TdsMessage variant="error">{error}</TdsMessage>;

  return (
    <div className="tds-grid-container" style={{ flexDirection: 'column' }}>
        <div className="tds-grid-fluid tds-u-pb3 mobile-shink">
            <div className="tds-grid-item">
                <h1 className="tds-u-mb4 tds-headline-01">MY GITHUB SUMMARY</h1>
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
                  {userData?.public_repos || 0}
                </p>
              </div>
            </TdsCard>
          </div>
          
          <div className="tds-grid-item">
            <TdsCard header="Total commits this year" modeVariant='secondary'>
              <div slot="body">
                <p className="tds-headline-01">{totalCommits.toLocaleString()}</p>
              </div>
            </TdsCard>
          </div>
          
          <div className="tds-grid-item">
            <TdsCard header="Followers" modeVariant='secondary'>
              <div slot="body">
                <p className="tds-headline-01">
                  {userData?.followers || 0}
                </p>
              </div>
            </TdsCard>
          </div>
          
          <div className="tds-grid-item">
            <TdsCard header="Following" modeVariant='secondary'>
              <div slot="body">
                <p className="tds-headline-01">
                  {userData?.following || 0}
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
    </div>
  );
};

export default GitHubDashboard;