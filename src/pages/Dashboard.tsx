import { useEffect, useState } from 'react'
import { 
  TdsCard,
  TdsMessage,
  TdsSpinner,
} from '@scania/tegel-react'
import { useNavigate } from 'react-router-dom'

interface UserData {
  name?: string;
  login: string;
  public_repos: number;
  followers: number;
  avatar_url: string;
  html_url: string;
  repos_url: string;
}

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  updated_at: string;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('github_token')
      console.log('Token in Dashboard:', token ? 'exists' : 'not found')
      
      if (!token) {
        navigate('/login')
        return
      }

      try {
        // Fetch user data
        console.log('Fetching user data...')
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token}`
          }
        })

        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`)
        }
        
        const userData = await userResponse.json()
        console.log('User data received:', userData)
        setUserData(userData)

        // Fetch repositories
        console.log('Fetching repositories...')
        const reposResponse = await fetch(userData.repos_url, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token}`
          }
        })

        if (!reposResponse.ok) {
          throw new Error(`HTTP error! status: ${reposResponse.status}`)
        }

        const reposData = await reposResponse.json()
        console.log('Repositories received:', reposData.length)
        setRepos(reposData)

      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        if (err instanceof Error && err.message.includes('401')) {
          localStorage.removeItem('github_token')
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <TdsSpinner></TdsSpinner>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[800px] mx-auto p-4">
        <TdsMessage variant="error">
          Error loading dashboard: {error}
        </TdsMessage>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="max-w-[800px] mx-auto p-4">
        <TdsMessage variant="error">
          No user data available. Please try logging in again.
        </TdsMessage>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto p-4">
      {/* User Profile Card */}
      <TdsCard>
        <div className="flex items-start gap-6 p-4">
          {userData.avatar_url && (
            <img 
              src={userData.avatar_url} 
              alt={userData.name || userData.login}
              className="w-24 h-24 rounded-full"
              style={{ width: '96px', height: '96px' }}
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold">
              {userData.name || userData.login}
            </h1>
            <div className="mt-2 text-gray-600">
              {userData.public_repos} repositories • {userData.followers} followers
            </div>
            <a 
              href={userData.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-600 hover:text-blue-800"
            >
              View GitHub Profile →
            </a>
          </div>
        </div>
      </TdsCard>

      {/* Repositories Table */}
      {repos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Repositories</h2>
          <TdsCard>
            <div className="overflow-x-auto p-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Repository</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Stars</th>
                    <th className="text-left p-2">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {repos.map((repo) => (
                    <tr key={repo.id}>
                      <td className="p-2">
                        <a 
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {repo.name}
                        </a>
                      </td>
                      <td className="p-2">{repo.description || 'No description'}</td>
                      <td className="p-2">{repo.stargazers_count}</td>
                      <td className="p-2">{new Date(repo.updated_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TdsCard>
        </div>
      )}
    </div>
  )
}