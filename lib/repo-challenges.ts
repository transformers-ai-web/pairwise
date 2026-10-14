export type RepoChallenge = {
  id: string;
  type: 'repo_challenge';
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skills: string[];
  repo_url: string;
  base_commit: string;
  duration_minutes: number;
  status: 'draft' | 'published' | 'archived';
};

export const sampleRepoChallenge: RepoChallenge = {
  id: 'fix-duplicate-chunks-in-rag-retrieval',
  type: 'repo_challenge',
  title: 'Fix duplicate chunks in RAG retrieval',
  description: 'The retriever can return duplicate chunks with the same chunk_id.\nUpdate the implementation so duplicates are removed while preserving ranking order.',
  difficulty: 'Medium',
  skills: ['Python', 'RAG', 'Retrieval', 'Debugging'],
  repo_url: 'https://example.com/pairwise/rag-retrieval',
  base_commit: 'placeholder',
  duration_minutes: 45,
  status: 'published',
};
