
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