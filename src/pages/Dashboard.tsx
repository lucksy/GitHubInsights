import React, { useEffect, useState } from 'react';
import { TdsCard, TdsSpinner, TdsMessage } from '@scania/tegel-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const GitHubDashboard = () => {
  interface GitHubUser {
    public_repos: number;
    followers: number;
    following: number;
  }
  
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('github_token');
      try {
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        const userData = await userResponse.json();
        setUserData(userData);
      } catch (err) {
        setError('Failed to fetch GitHub data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const commitData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Commits',
      data: [25, 22, 30, 18, 20, 24],
      borderColor: '#0A1F44',
      backgroundColor: '#0A1F44',
      tension: 0.4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const languageData = {
    labels: ['JavaScript', 'HTML'],
    datasets: [{
      data: [65, 35],
      backgroundColor: ['#1f77b4', '#aec7e8'],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: '70%',
  };

  if (loading) return <div className="tds-u-p4 tds-u-text-center"><TdsSpinner /></div>;
  if (error) return <TdsMessage variant="error">{error}</TdsMessage>;

  return (
    <div className="tds-grid-container" style={{ flexDirection: 'column' }}>
        <h1 className="tds-u-mb4 tds-headline-01">MY GITHUB SUMMARY</h1>
        
        {/* Stats Grid */}
        <div className="tds-grid-fluid tds-u-pb3">
          <div className="tds-grid-item tds-u-flex tds-u-flex-dir-col" style={{ gridColumn: 'span 3' }}>
            <TdsCard header="Number of projects">
              <div slot="body">
                <p className="tds-headline-02">
                  {userData?.public_repos || 0}
                </p>
              </div>
            </TdsCard>
          </div>
          
          <div className="tds-grid-item" style={{ gridColumn: 'span 3' }}>
            <TdsCard header="Total commits this year">
              <div slot="body">
                <p className="tds-headline-02">21,212</p>
              </div>
            </TdsCard>
          </div>
          
          <div className="tds-grid-item" style={{ gridColumn: 'span 3' }}>
            <TdsCard header="Followers">
              <div slot="body">
                <p className="tds-headline-02">
                  {userData?.followers || 0}
                </p>
              </div>
            </TdsCard>
          </div>
          
          <div className="tds-grid-item" style={{ gridColumn: 'span 3' }}>
            <TdsCard header="Following">
              <div slot="body">
                <p className="tds-headline-02">
                  {userData?.following || 0}
                </p>
              </div>
            </TdsCard>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="tds-grid-fluid tds-u-pb3">
          <div className="tds-grid-item" style={{ gridColumn: 'span 9' }}>
            <TdsCard header="Commit count">
              <div slot="body" style={{ height: '300px' }}>
                <Line data={commitData} options={lineOptions} />
              </div>
            </TdsCard>
          </div>

          <div className="tds-grid-item" style={{ gridColumn: 'span 3' }}>
            <TdsCard header="Programming languages">
              <div slot="body" style={{ height: '300px' }}>
                <Doughnut data={languageData} options={doughnutOptions} />
                <div className="tds-u-flex tds-u-justify-content-center tds-u-gap2 tds-u-mt2">
                  {languageData.labels.map((label, index) => (
                    <div key={index} className="tds-u-flex tds-u-items-center tds-u-gap1">
                      <div 
                        className="tds-u-w1 tds-u-h1 tds-u-rounded-full" 
                        style={{ backgroundColor: languageData.datasets[0].backgroundColor[index] }}
                      />
                      <span>{languageData.datasets[0].data[index]}% {label}</span>
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