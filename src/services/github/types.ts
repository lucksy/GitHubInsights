export interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
    company: string | null;
    email: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}

export interface Repository {
    name: string;
    language: string;
    description: string | null;
    stargazers_count: number;
    fork: boolean;
}

export interface Commit {
    sha: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
}