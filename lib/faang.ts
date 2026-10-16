import { problems, type Problem } from './problems';
import { metaProblems } from './meta';
import { googleProblems } from './google';

const appleSource = 'https://leetcode.com/discuss/post/1734481/Apple-top-100-questions/';
const amazonSource = 'https://leetcode.com/discuss/post/488887/rqq1489223579764.html';
const amazonExtra = 'https://github.com/imkgarg/Awesome-Software-Engineering-Interview/blob/master/CodingCompanyTopQuestions.md#amazon';
const appleReport = 'https://leetcode.com/discuss/post/1951389/apple-phone-screen-on-site-santa-clara-sde-l3/';
const netflixReport = 'https://www.reddit.com/r/leetcode/comments/1lh77b3/anyone_interview_at_netflix_recently/';

function entry(id: string, title: string, difficulty: Problem['difficulty'], topic: string, note: string, premium = false): Problem {
  return { id, title, difficulty, topic, note, premium, minutes: difficulty === 'Hard' ? 45 : difficulty === 'Easy' ? 20 : 30, platform: 'LeetCode', url: `https://leetcode.com/problems/${id}/`, source: `https://leetcode.com/problems/${id}/`, sourceKind: 'General practice' };
}
const additions = [
  entry('longest-common-prefix', 'Longest Common Prefix', 'Easy', 'Strings', 'Shrink the shared prefix as you compare words.'),
  entry('happy-number', 'Happy Number', 'Easy', 'Hashing', 'Detect a cycle in repeated digit-square sums.'),
  entry('roman-to-integer', 'Roman to Integer', 'Easy', 'Strings', 'Account for smaller symbols before larger symbols.'),
  entry('first-bad-version', 'First Bad Version', 'Easy', 'Binary search', 'Find the first failing position in a monotonic sequence.'),
  entry('design-hashmap', 'Design HashMap', 'Easy', 'Data structure design', 'Handle collisions and updates explicitly.'),
  entry('palindrome-number', 'Palindrome Number', 'Easy', 'Math', 'Compare the leading and trailing digits.'),
  entry('contains-duplicate', 'Contains Duplicate', 'Easy', 'Hashing', 'Remember which values have already appeared.'),
  entry('same-tree', 'Same Tree', 'Easy', 'Trees', 'Compare both structure and values.'),
  entry('symmetric-tree', 'Symmetric Tree', 'Easy', 'Trees', 'Compare mirrored branches recursively.'),
  entry('first-unique-character-in-a-string', 'First Unique Character in a String', 'Easy', 'Hashing', 'Count characters, then preserve original order when choosing.'),
  entry('reorder-data-in-log-files', 'Reorder Data in Log Files', 'Easy', 'Sorting', 'Separate digit logs from lexicographically ordered letter logs.'),
  entry('maximum-units-on-a-truck', 'Maximum Units on a Truck', 'Easy', 'Greedy', 'Load the most valuable boxes first.'),
  entry('add-two-numbers', 'Add Two Numbers', 'Medium', 'Linked lists', 'Carry overflow while walking both lists.'),
  entry('reverse-integer', 'Reverse Integer', 'Medium', 'Math', 'Reverse digits while guarding against overflow.'),
  entry('valid-sudoku', 'Valid Sudoku', 'Medium', 'Hashing', 'Track used values in each row, column, and box.'),
  entry('longest-palindromic-substring', 'Longest Palindromic Substring', 'Medium', 'Strings', 'Expand around odd and even centers.'),
  entry('container-with-most-water', 'Container With Most Water', 'Medium', 'Two pointers', 'Move the shorter boundary to seek a larger area.'),
  entry('rotate-image', 'Rotate Image', 'Medium', 'Matrices', 'Rotate layers or combine transposition with reversal.'),
  entry('spiral-matrix', 'Spiral Matrix', 'Medium', 'Matrices', 'Shrink boundaries after visiting each edge.'),
  entry('spiral-matrix-ii', 'Spiral Matrix II', 'Medium', 'Matrices', 'Fill each shrinking border in sequence.'),
  entry('unique-paths', 'Unique Paths', 'Medium', 'Dynamic programming', 'Build each cell count from the two preceding directions.'),
  entry('word-break', 'Word Break', 'Medium', 'Dynamic programming', 'Remember which prefixes can be segmented.'),
  entry('generate-parentheses', 'Generate Parentheses', 'Medium', 'Backtracking', 'Only extend prefixes that can still become balanced.'),
  entry('find-first-and-last-position-of-element-in-sorted-array', 'Find First and Last Position of Element in Sorted Array', 'Medium', 'Binary search', 'Search independently for the two boundaries.'),
  entry('sort-colors', 'Sort Colors', 'Medium', 'Two pointers', 'Partition values into three regions in one pass.'),
  entry('min-stack', 'Min Stack', 'Medium', 'Stacks', 'Keep enough history to restore the minimum after a pop.'),
  entry('integer-to-roman', 'Integer to Roman', 'Medium', 'Strings', 'Consume values using descending symbols and subtractive pairs.'),
  entry('word-search', 'Word Search', 'Medium', 'Backtracking', 'Explore adjacent cells without reusing one in the same path.'),
  entry('maximum-subarray', 'Maximum Subarray', 'Medium', 'Dynamic programming', 'Choose whether to extend the current sum or restart.'),
  entry('string-to-integer-atoi', 'String to Integer (atoi)', 'Medium', 'Parsing', 'Handle whitespace, signs, termination, and bounds.'),
  entry('permutations', 'Permutations', 'Medium', 'Backtracking', 'Choose each unused value for the next position.'),
  entry('rotate-list', 'Rotate List', 'Medium', 'Linked lists', 'Reduce the rotation modulo length and reconnect the split.'),
  entry('minimum-path-sum', 'Minimum Path Sum', 'Medium', 'Dynamic programming', 'Accumulate the least cost from top or left.'),
  entry('convert-sorted-list-to-binary-search-tree', 'Convert Sorted List to Binary Search Tree', 'Medium', 'Trees', 'Build a balanced tree around successive middle values.'),
  entry('populating-next-right-pointers-in-each-node', 'Populating Next Right Pointers in Each Node', 'Medium', 'Trees', 'Connect neighbors across the same depth.'),
  entry('course-schedule-ii', 'Course Schedule II', 'Medium', 'Graphs', 'Produce a topological order and detect unfinished cycles.'),
  entry('design-add-and-search-words-data-structure', 'Design Add and Search Words Data Structure', 'Medium', 'Tries', 'Branch only when a wildcard requires it.'),
  entry('game-of-life', 'Game of Life', 'Medium', 'Matrices', 'Preserve original neighbors while calculating the next generation.'),
  entry('design-tic-tac-toe', 'Design Tic-Tac-Toe', 'Medium', 'Data structure design', 'Track row, column, and diagonal counts after each move.', true),
  entry('reorganize-string', 'Reorganize String', 'Medium', 'Heaps', 'Place frequent characters while avoiding adjacent duplicates.'),
  entry('all-nodes-distance-k-in-binary-tree', 'All Nodes Distance K in Binary Tree', 'Medium', 'Trees', 'Search outward from the target using parent links.'),
  entry('rotting-oranges', 'Rotting Oranges', 'Medium', 'Graphs', 'Spread from all initial sources in breadth-first layers.'),
  entry('median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'Hard', 'Binary search', 'Find partitions with correctly ordered left and right halves.'),
  entry('regular-expression-matching', 'Regular Expression Matching', 'Hard', 'Dynamic programming', 'Track text and pattern prefixes, including zero repetitions.'),
  entry('serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree', 'Hard', 'Trees', 'Encode missing children so reconstruction is unambiguous.'),
  entry('word-ladder', 'Word Ladder', 'Hard', 'Graphs', 'Find the shortest sequence of one-letter transformations.'),
  entry('word-ladder-ii', 'Word Ladder II', 'Hard', 'Graphs', 'Preserve all shortest-path predecessors before reconstructing paths.'),
  entry('integer-to-english-words', 'Integer to English Words', 'Hard', 'Strings', 'Convert three-digit groups and attach their scales.'),
  entry('trapping-rain-water', 'Trapping Rain Water', 'Hard', 'Two pointers', 'Use the shorter running boundary to determine trapped water.'),
  entry('lfu-cache', 'LFU Cache', 'Hard', 'Data structure design', 'Combine frequency buckets with recency inside each bucket.'),
];

const catalog = new Map([...problems, ...metaProblems, ...googleProblems, ...additions].map(problem => [problem.id, problem]));
function select(ids: string, source?: string): Problem[] {
  return ids.trim().split(/\s+/).map(id => {
    const base = catalog.get(id);
    if (!base) throw new Error(`Unknown practice problem: ${id}`);
    return { ...base, source: source || base.url, sourceKind: source ? 'Community list' : 'General practice', note: `Practice ${base.topic.toLowerCase()}. Explain your approach, complexity, and edge cases.` };
  });
}

export const appleProblems = select(`
two-sum best-time-to-buy-and-sell-stock longest-common-prefix move-zeroes valid-parentheses happy-number roman-to-integer first-bad-version design-hashmap palindrome-number merge-two-sorted-lists valid-palindrome
3sum longest-substring-without-repeating-characters add-two-numbers number-of-islands reverse-integer lru-cache valid-sudoku merge-intervals product-of-array-except-self decode-string longest-palindromic-substring container-with-most-water search-in-rotated-sorted-array combination-sum rotate-image spiral-matrix unique-paths word-break random-pick-with-weight letter-combinations-of-a-phone-number generate-parentheses find-first-and-last-position-of-element-in-sorted-array powx-n sort-colors min-stack house-robber integer-to-roman group-anagrams word-search course-schedule implement-trie-prefix-tree max-consecutive-ones-iii
median-of-two-sorted-arrays word-ladder merge-k-sorted-lists find-median-from-data-stream regular-expression-matching word-search-ii
`, appleSource);
for (const problem of appleProblems) {
  if (['valid-parentheses', 'lru-cache'].includes(problem.id)) {
    problem.source = appleReport;
    problem.sourceKind = 'Candidate report';
  }
}

export const amazonProblems = [
  ...select(`two-sum roman-to-integer valid-parentheses same-tree symmetric-tree best-time-to-buy-and-sell-stock diameter-of-binary-tree
longest-palindromic-substring string-to-integer-atoi integer-to-roman valid-sudoku combination-sum permutations merge-intervals rotate-list minimum-path-sum word-search validate-binary-search-tree binary-tree-level-order-traversal convert-sorted-list-to-binary-search-tree populating-next-right-pointers-in-each-node lru-cache min-stack number-of-islands course-schedule course-schedule-ii design-add-and-search-words-data-structure game-of-life longest-increasing-subsequence design-tic-tac-toe pacific-atlantic-water-flow minesweeper reorganize-string
median-of-two-sorted-arrays merge-k-sorted-lists word-ladder-ii word-ladder word-search-ii integer-to-english-words find-median-from-data-stream`, amazonSource),
  ...select(`first-unique-character-in-a-string reorder-data-in-log-files maximum-units-on-a-truck group-anagrams k-closest-points-to-origin all-nodes-distance-k-in-binary-tree rotting-oranges trapping-rain-water sliding-window-maximum lfu-cache`, amazonExtra),
];

// This is an editorial practice route, not 50 claims of questions asked at Netflix.
export const netflixProblems = select(`
two-sum valid-palindrome move-zeroes merge-sorted-array reverse-linked-list best-time-to-buy-and-sell-stock contains-duplicate logger-rate-limiter
lru-cache time-based-key-value-store snapshot-array stock-price-fluctuation min-stack reorganize-string merge-intervals insert-interval interval-list-intersections product-of-array-except-self subarray-sum-equals-k top-k-frequent-elements kth-largest-element-in-an-array k-closest-points-to-origin number-of-islands course-schedule course-schedule-ii rotting-oranges decode-string group-anagrams longest-substring-without-repeating-characters max-consecutive-ones-iii binary-tree-level-order-traversal lowest-common-ancestor-of-a-binary-tree implement-trie-prefix-tree word-break house-robber coin-change
find-median-from-data-stream merge-k-sorted-lists sliding-window-maximum sliding-window-median minimum-window-substring serialize-and-deserialize-binary-tree lfu-cache word-ladder word-search-ii trapping-rain-water longest-increasing-path-in-a-matrix split-array-largest-sum text-justification regular-expression-matching
`);
const cache = netflixProblems.find(problem => problem.id === 'lru-cache')!;
cache.source = netflixReport;
cache.sourceKind = 'Candidate report';
cache.note = 'Related practice: a June 2025 commenter reports a cache exercise with TTL, LRU eviction, and a concurrency follow-up. This exercise covers the LRU component.';

export const remainingJourneys = {
  apple: {
    title: 'The Apple journey', kicker: '50 QUESTIONS · APPLE PREP', module: 'interview-apple', localKey: 'pairwise-apple-v1', problems: appleProblems,
    description: '50 questions covering arrays, strings, trees, and design. Progress from Easy to Medium to Hard, one focused card at a time.',
    collectionNote: 'Selected from an Apple community compilation last curated January 1, 2022, plus a Santa Clara candidate report. Historical associations are unverified, and the old compilation is not a current frequency ranking. Each exercise links to its source. Sources checked October 16, 2026.',
  },
  amazon: {
    title: 'The Amazon journey', kicker: '50 QUESTIONS · AMAZON PREP', module: 'interview-amazon', localKey: 'pairwise-amazon-v1', problems: amazonProblems,
    description: '50 questions across core patterns, graph searches, and data structure design. Same-difficulty cards keep your practice focused.',
    collectionNote: 'Selected from Alex’s Amazon SDE1 community compilation (posted January 2020, updated August 2023) and imkgarg’s Amazon preparation list. These are historical community sources, not verified current interview questions or frequency predictions. Premium exercises are marked. Sources checked October 16, 2026.',
  },
  netflix: {
    title: 'The Netflix journey', kicker: '50 QUESTIONS · NETFLIX PREP', module: 'interview-netflix', localKey: 'pairwise-netflix-v1', problems: netflixProblems,
    description: 'Practice caching, intervals, streams, and core DSA. One reported cache variation plus 49 general preparation exercises, clearly labeled.',
    collectionNote: 'This is an editorial preparation route, not a Netflix question bank. Only LRU Cache links to a June 2025 candidate comment, which describes a broader TTL/concurrency variation. The other 49 exercises are general DSA practice and do not claim Netflix attribution; their links point to the original problems. Sources checked October 16, 2026.',
  },
} as const;
