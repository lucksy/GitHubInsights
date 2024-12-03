import {
    GitHubUser,
    Repository,
    Commit,
    SearchCommitsResponse,
} from './types';

class GitHubService {
    private static instance: GitHubService;
    private baseUrl = 'https://api.github.com';
    private token: string | null = null;

    private constructor() { }

    public static getInstance(): GitHubService {
        if (!GitHubService.instance) {
            GitHubService.instance = new GitHubService();
        }
        return GitHubService.instance;
    }

    setToken(token: string) {
        this.token = token;
    }

    private getHeaders(additionalHeaders: HeadersInit = {}): HeadersInit {
        if (!this.token) {
            throw new Error('No authentication token set');
        }

        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            ...additionalHeaders
        };
    }

    private async fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(url, {
            ...options,
            headers: this.getHeaders(options.headers)
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return response.json();
    }

    async validateToken(token: string): Promise<GitHubUser> {
        this.token = token;
        return this.getCurrentUser();
    }

    async getCurrentUser(): Promise<GitHubUser> {
        return this.fetchJson<GitHubUser>(`${this.baseUrl}/user`);
    }

    async getUserRepositories(username: string): Promise<Repository[]> {
        return this.fetchJson<Repository[]>(
            `${this.baseUrl}/users/${username}/repos?per_page=100`
        );
    }

    async searchUserCommits(
        username: string,
        page: number = 1,
        perPage: number = 30,
        searchTerm: string = '',
        startDate: Date | null = null,
        endDate: Date | null = null
    ): Promise<SearchCommitsResponse> {
        // Base query always includes the author
        let query = `author:${username}`;

        // Add search term if provided, without restricting to commit message
        if (searchTerm.trim()) {
            // Wrap the search term in quotes if it contains spaces
            const formattedSearchTerm = searchTerm.includes(' ')
                ? `"${searchTerm.trim()}"`
                : searchTerm.trim();
            query += ` ${formattedSearchTerm}`;
        }

        // Add date filters if provided
        if (startDate) {
            query += ` committer-date:>=${startDate.toISOString().split('T')[0]}`;
        }
        if (endDate) {
            query += ` committer-date:<=${endDate.toISOString().split('T')[0]}`;
        }

        const url = `${this.baseUrl}/search/commits?q=${encodeURIComponent(query)}&sort=author-date&order=desc&page=${page}&per_page=${perPage}`;

        return this.fetchJson<SearchCommitsResponse>(url, {
            headers: {
                'Accept': 'application/vnd.github.cloak-preview'
            }
        });
    }

    async getRepositoryCommits(
        owner: string,
        repo: string,
        since?: Date,
        until?: Date
    ): Promise<Commit[]> {
        let url = `${this.baseUrl}/repos/${owner}/${repo}/commits?per_page=100`;

        if (since) {
            url += `&since=${since.toISOString()}`;
        }
        if (until) {
            url += `&until=${until.toISOString()}`;
        }

        return this.fetchJson<Commit[]>(url);
    }

    async calculateLanguageStats(repos: Repository[]): Promise<Record<string, number>> {
        const languageCounts: { [key: string]: number } = {};
        let totalLanguages = 0;

        for (const repo of repos) {
            if (repo.language) {
                languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
                totalLanguages++;
            }
        }

        return Object.entries(languageCounts).reduce((acc, [lang, count]) => {
            acc[lang] = Math.round((count / totalLanguages) * 100);
            return acc;
        }, {} as Record<string, number>);
    }

    async getCommitStats(username: string, repos: Repository[]): Promise<{
        totalCommits: number;
        monthlyCommits: Record<string, number>;
    }> {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const commits: Record<string, number> = {};
        let totalCommits = 0;

        // Initialize months
        monthNames.forEach(month => {
            commits[month] = 0;
        });

        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        for (const repo of repos) {
            try {
                const repoCommits = await this.getRepositoryCommits(
                    username,
                    repo.name,
                    sixMonthsAgo,
                    now
                );

                repoCommits.forEach(commit => {
                    const date = new Date(commit.commit.author.date);
                    const monthName = monthNames[date.getMonth()];
                    commits[monthName] = (commits[monthName] || 0) + 1;
                    totalCommits += 1;
                });
            } catch (error) {
                console.error(`Failed to fetch commits for ${repo.name}:`, error);
            }
        }

        return {
            totalCommits,
            monthlyCommits: commits
        };
    }

    async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
        return this.fetchJson<Record<string, number>>(
            `${this.baseUrl}/repos/${owner}/${repo}/languages`
        );
    }
}

export const githubService = GitHubService.getInstance();