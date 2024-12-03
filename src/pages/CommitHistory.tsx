import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { 
  TdsCard,
  TdsMessage,
  TdsTableHeader,
  TdsTableBody,
  TdsTable,
} from '@scania/tegel-react'

export default function CommitHistory() {
  interface Commit {
    sha: string;
    commit: {
      author: {
        name: string;
        date: string;
      };
      message: string;
    };
  }

  const [commits, setCommits] = useState<Commit[]>([])
  const [error, setError] = useState('')
  const { repo } = useParams()

  useEffect(() => {
    const fetchCommits = async () => {
      const token = localStorage.getItem('github_token')
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/commits`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        setCommits(data)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch commit history')
      }
    }

    if (repo) {
      fetchCommits()
    }
  }, [repo])

  return (
    <div className="p-6">
      <TdsCard>
        <h1 className="text-2xl font-bold mb-4">Commit History for {repo}</h1>
        {error ? (
          <TdsMessage variant="error">{error}</TdsMessage>
        ) : (
          <TdsTable>
            <TdsTableHeader>
              <TdsTable>
                <TdsTableHeader>Author</TdsTableHeader>
                <TdsTableHeader>Message</TdsTableHeader>
                <TdsTableHeader>Date</TdsTableHeader>
              </TdsTable>
            </TdsTableHeader>
            <TdsTableBody>
              {commits.map((commit: Commit) => (
                <TdsTable key={commit.sha}>
                  <TdsTable>{commit.commit.author.name}</TdsTable>
                  <TdsTable>{commit.commit.message}</TdsTable>
                  <TdsTable>
                    {new Date(commit.commit.author.date).toLocaleDateString()}
                  </TdsTable>
                </TdsTable>
              ))}
            </TdsTableBody>
          </TdsTable>
        )}
      </TdsCard>
    </div>
  )
}