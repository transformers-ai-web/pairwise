import { type Problem, problems } from './problems';
import { metaProblems } from './meta';
import { googleProblems } from './google';
import { appleProblems, amazonProblems, netflixProblems } from './faang';

export const legacyCompanyBanks = { meta: metaProblems, google: googleProblems, apple: appleProblems, amazon: amazonProblems, netflix: netflixProblems };
export type Company = keyof typeof legacyCompanyBanks;
export type Evidence = { company: Company; title: string; context: string; date: string; match: 'Named problem' | 'Reported variation' | 'Reported task'; summary: string; checkedOn: string };
const catalog = [...problems, ...Object.values(legacyCompanyBanks).flat()];
type Report = { company: Company; title: string; context: string; date: string; url: string };
const report = (company: Company, title: string, context: string, date: string, path: string): Report => ({ company, title, context, date, url: `https://leetcode.com/discuss/post/${path}/` });
const meta = report('meta', 'Meta | E5 | Reject', 'E5 · Phone screen and onsite', 'Posted March 26, 2024; interview date unspecified', '4925891/Meta-or-E5-or-Reject');
const metaLoop = report('meta', 'Meta Phone Screen and Full Loop', 'E6 · Phone screen', 'Interview date unspecified', '5795292/Meta-Phone-Screen-and-Full-Loop');
const google = report('google', 'Google SWE New Grad Jan 2019', 'SWE New Grad · Phone interviews', 'January 2019 interview', '250566/google-swe-new-grad-jan-2019');
const googleL4 = report('google', 'Google | SDE-2 L4 | Interview Experience', 'SDE-2 / L4 · Third onsite round', 'Phone screen January 2025; onsite date unspecified', '6341225/Google-or-SDE-2-L4-or-Interview-Experience');
const apple = report('apple', 'Apple Phone Screen / On-site Santa Clara SDE L3', 'SDE L3 · Santa Clara', 'Interview date unspecified', '1951389/apple-phone-screen-on-site-santa-clara-sde-l3');
const amazon = report('amazon', 'Amazon SDE-1 Chennai Interview Experience', 'SDE-1 · Chennai', 'Interview date unspecified', '6567842/amazon-sde-1-chennai-inteview-experience-enhf');
const amazonL5 = report('amazon', 'Amazon SDE-2 (L5) Interview Experience', 'SDE-2 / L5 · Bangalore', 'August–September; year unspecified in report', '1478482/amazon-sde-2l5-interview-experience');
function entry(id: string, source: Report, summary: string, definition?: { title: string; difficulty: Problem['difficulty']; topic: string; premium?: boolean }, variation = false): Problem {
  const base = definition ? { id, ...definition, minutes: definition.difficulty === 'Hard' ? 40 : 25, url: `https://leetcode.com/problems/${id}/`, platform: 'LeetCode' as const } : catalog.find(p => p.id === id);
  if (!base) throw new Error(`Missing reported problem: ${id}`);
  return { ...base, note: 'Practice the pattern, then explain your approach and tradeoffs.', source: source.url, sourceKind: 'Candidate report', evidence: { company: source.company, title: source.title, context: source.context, date: source.date, match: variation ? 'Reported variation' : 'Named problem', summary, checkedOn: '2026-10-16' } };
}
export const reportedProblems: Record<Company, Problem[]> = {
  meta: [
    ...['dot-product-of-two-sparse-vectors', 'lowest-common-ancestor-of-a-binary-tree'].map(id => entry(id, meta, 'The candidate links this problem in the phone-screen section.')),
    ...['diameter-of-binary-tree', 'valid-palindrome-ii', 'diagonal-traverse', 'next-permutation', 'robot-room-cleaner'].map(id => entry(id, meta, 'The candidate links this problem in the onsite coding rounds.')),
    entry('minimum-remove-to-make-valid-parentheses', metaLoop, 'The candidate names this problem in the phone screen.'),
  ],
  google: [
    entry('rotated-digits', google, 'The candidate links Rotated Digits as the first phone-interview question.', { title: 'Rotated Digits', difficulty: 'Medium', topic: 'Dynamic programming' }),
    entry('snapshot-array', google, 'The candidate links Snapshot Array for the second phone interview and describes storage-efficiency follow-ups.'),
    entry('finding-mk-average', googleL4, 'The candidate explicitly links Finding MK Average in the third onsite round.', { title: 'Finding MK Average', difficulty: 'Hard', topic: 'Data structure design' }),
  ],
  apple: [
    entry('valid-parentheses', apple, 'The candidate links Valid Parentheses in the phone screen.'),
    entry('spiral-matrix-ii', apple, 'The candidate links Spiral Matrix II in an onsite coding round.', { title: 'Spiral Matrix II', difficulty: 'Medium', topic: 'Matrices' }),
    entry('lru-cache', apple, 'The candidate links LRU Cache in an onsite coding round.'),
    entry('serialize-and-deserialize-binary-tree', apple, 'The candidate links Serialize and Deserialize Binary Tree in an onsite coding round.'),
  ],
  amazon: [
    entry('insert-delete-getrandom-o1', amazon, 'The candidate identifies this as an exact first-round question.', { title: 'Insert Delete GetRandom O(1)', difficulty: 'Medium', topic: 'Data structure design' }),
    entry('top-k-frequent-words', amazon, 'The candidate identifies this as an exact first-round question.', { title: 'Top K Frequent Words', difficulty: 'Medium', topic: 'Heaps' }),
    entry('koko-eating-bananas', amazon, 'The candidate names this problem in the Bar Raiser round.', { title: 'Koko Eating Bananas', difficulty: 'Medium', topic: 'Binary search' }),
    entry('sentence-similarity-ii', amazonL5, 'The candidate links this problem in the phone-screen section.', { title: 'Sentence Similarity II', difficulty: 'Medium', topic: 'Union find', premium: true }),
    entry('maximum-product-subarray', amazonL5, 'The candidate links this problem in the phone-screen section.', { title: 'Maximum Product Subarray', difficulty: 'Medium', topic: 'Dynamic programming' }),
    entry('surrounded-regions', amazonL5, 'The candidate links this problem in the onsite DSA round.', { title: 'Surrounded Regions', difficulty: 'Medium', topic: 'Graphs' }),
    entry('decode-ways', amazonL5, 'The candidate links this problem in the onsite DSA round.', { title: 'Decode Ways', difficulty: 'Medium', topic: 'Dynamic programming' }),
  ],
  netflix: [entry('lru-cache', { company: 'netflix', title: 'Top-Independence1222: Netflix phone-screen experience', context: 'Phone screen · Level unspecified', date: 'Interview date unspecified; commenter says previous week', url: 'https://www.reddit.com/r/leetcode/comments/1lh77b3/comment/mz3k9ub/' }, 'The commenter reports implementing a cache with TTL and LRU eviction, followed by a concurrency discussion. This LeetCode exercise covers only the LRU component, not the full interview task.', undefined, true)],
};

// Snapshot of the first evidence-backed release, for saved card migration.
export const initialReportedBanks = Object.fromEntries(Object.entries(reportedProblems).map(([company, bank]) => [company, [...bank]])) as Record<Company, Problem[]>;

const unknownDate = 'Interview date unspecified';
const appleGrad = report('apple', 'Apple | New Grad | India | Nov 2020 [Offer]', 'New Grad · India', 'November 2020 interview', '955110/apple-new-grad-india-nov-2020-offer');
const appleICT3 = report('apple', 'Apple | SDE ICT3 | Cupertino [Offer]', 'ICT3 · Cupertino', 'August 2019 interview', '368422/apple-sde-ict3-cupertino-aug-2019-offer');
const applePhone = report('apple', 'Apple | Phone Interview', 'Hiring-manager call and two phone interviews', unknownDate, '450840/apple-phone-interview');
reportedProblems.apple.push(
  ...['number-of-islands', 'merge-intervals'].map(id => entry(id, appleGrad, 'The candidate links this exercise in round 1.')),
  ...['two-sum', '3sum'].map(id => entry(id, appleGrad, 'The candidate names this exercise in round 2; only 3Sum required code.')),
  entry('knight-probability-in-chessboard', appleICT3, 'The candidate links this as the take-home assignment.', { title: 'Knight Probability in Chessboard', difficulty: 'Medium', topic: 'Dynamic programming' }),
  entry('word-ladder', appleICT3, 'The candidate links this exercise in the phone screen.'),
  entry('n-queens', appleICT3, 'The candidate links this exercise in onsite round 1.', { title: 'N-Queens', difficulty: 'Hard', topic: 'Backtracking' }),
  entry('set-matrix-zeroes', appleICT3, 'The candidate links this exercise in onsite round 2.', { title: 'Set Matrix Zeroes', difficulty: 'Medium', topic: 'Matrices' }),
  entry('validate-binary-search-tree', appleICT3, 'The candidate links this exercise in onsite round 2.'),
  entry('lfu-cache', appleICT3, 'The candidate links this exercise in onsite round 3.'),
  entry('valid-anagram', applePhone, 'The candidate links this exercise in the hiring-manager call.', { title: 'Valid Anagram', difficulty: 'Easy', topic: 'Hashing' }),
  ...['integer-to-roman', 'integer-to-english-words'].map(id => entry(id, applePhone, 'The candidate links this exercise in one of the two subsequent phone interviews.')),
);

const metaMLE = report('meta', 'Meta Interview Experience E4 MLE [Rejection]', 'E4 · Machine learning engineer · Phone screen', unknownDate, '4241029/meta-interview-experience-e4-mle-rejecti-n9zx');
const metaE6 = report('meta', 'Meta E6 Full Loop Interview Experience (ML)', 'E6 · Machine learning', unknownDate, '6721648/meta-e6-full-loop-interview-experience-b-ap7y');
const metaE4 = report('meta', 'Meta E4 Menlo Park [Rejected]', 'E4 · Menlo Park · Phone screen', unknownDate, '5061179/Meta-or-E4-or-Menlo-Park-CA-Rejected');
const metaInfra = report('meta', 'Meta E4 SWE USA [Passed Hiring Committee]', 'E4 · SWE infrastructure · USA', 'February 2025 interview', '6460774/Meta-or-E4-SWE-or-USA-or-Feb-2025-or-Passed-Hiring-Committee');
const metaOnsite = report('meta', 'Meta onsite E4/E5 USA', 'E4/E5 · USA · Onsite', unknownDate, '4422646/Meta-or-on-site-or-E4E5-or-USA');
const metaProduct = report('meta', 'My Meta Full-Loop Interview Experience', 'Software Engineer, Product · Menlo Park', unknownDate, '5778436/My-Meta-Full-Loop-Interview-Experience-%3A-Software-Engineer-Product-Menlo-Park-CA');
const metaReject = report('meta', 'Meta Interview Experience E4/E5 [Reject]', 'E4/E5 · Onsite coding', unknownDate, '4659931/Meta-Interview-Experience-e4e5-Reject');
reportedProblems.meta.push(
  entry('moving-average-from-data-stream', metaMLE, 'The candidate links this exercise in the phone screen.', { title: 'Moving Average from Data Stream', difficulty: 'Easy', topic: 'Queues', premium: true }),
  entry('random-pick-with-weight', metaMLE, 'The candidate links this exercise in the phone screen.'),
  entry('simplify-path', metaE6, 'The candidate names this exercise in the phone screen.'),
  entry('remove-invalid-parentheses', metaE6, 'The candidate links this exercise in the full-loop coding questions.', { title: 'Remove Invalid Parentheses', difficulty: 'Hard', topic: 'Backtracking' }),
  entry('valid-word-abbreviation', metaE6, 'The candidate links this exercise in the full-loop coding questions.'),
  entry('valid-number', metaE6, 'The candidate links this exercise in the full-loop coding questions.', { title: 'Valid Number', difficulty: 'Hard', topic: 'Strings' }),
  entry('range-sum-of-bst', metaE4, 'The candidate links this exercise in the actual phone screen, separate from their mock interview.'),
  entry('add-strings', metaE4, 'The phone-screen variant adds decimal strings, whereas the practice exercise adds integer strings.', { title: 'Add Strings', difficulty: 'Easy', topic: 'Strings' }, true),
  entry('binary-tree-right-side-view', metaInfra, 'The candidate identifies a right-side-view variation in the phone screen; the precise change is not supplied.', undefined, true),
  entry('max-consecutive-ones-iii', metaInfra, 'The candidate links this coding-round variation and mentions a partial-values follow-up, without specifying it fully.', undefined, true),
  entry('find-peak-element', metaInfra, 'The reported task finds a local minimum and permits equal neighbors; this exercise finds a peak.', undefined, true),
  entry('lowest-common-ancestor-of-a-binary-tree-iii', metaOnsite, 'The candidate explicitly calls this an exact round-1 question.', { title: 'Lowest Common Ancestor of a Binary Tree III', difficulty: 'Medium', topic: 'Trees', premium: true }),
  entry('merge-k-sorted-lists', metaOnsite, 'The candidate links this exercise in round 2.'),
  entry('palindrome-permutation', metaProduct, 'The candidate links this exercise in the first coding interview.', { title: 'Palindrome Permutation', difficulty: 'Easy', topic: 'Hashing', premium: true }),
  entry('shortest-path-in-binary-matrix', metaReject, 'The reported version allows four movement directions; the practice problem allows eight.', undefined, true),
  entry('vertical-order-traversal-of-a-binary-tree', metaReject, 'The candidate links this exercise in the second coding round.'),
);

const googleOnsite = report('google', 'Google Onsite: 4 Questions / Interview Experience', 'L4 · California · Virtual onsite', 'Posted October 29, 2021; interview date unspecified', '1546595/google-onsite-4-questions-interview-experience');
const googleMV = report('google', 'Google L4 Mountain View [Offer]', 'L4 · Mountain View', 'August 2020 interview', '820415/google-l4-mountain-view-august-2020-offer');
const googleEurope = report('google', 'Google L5 Europe [Reject]', 'L5 · Europe', 'August 2020 interview', '805582/google-l5-europe-august-2020-reject');
const googleBLR = report('google', 'Google L4 Bangalore [Offer]', 'L4 · Bangalore', 'February 2020 interview', '519532/google-l4-bangalore-feb-2020-offer');
const googleIndia = report('google', 'Google SDE 2 (L3) Interview Experience India', 'L3 · India · Onsite', unknownDate, '4778433/Google-or-SDE-2-%28L3%29-or-Interview-Experience-India');
const googleAugust = report('google', 'Google L4 Bangalore [Offer]', 'L4 · Bangalore', 'June and August 2020 interviews', '858544/google-l4-bangalore-offer');
reportedProblems.google.push(
  entry('longest-increasing-path-in-a-matrix', googleOnsite, 'The candidate links this exercise as onsite question 2.'),
  entry('first-bad-version', googleMV, 'The author supplies similar exercises rather than exact prompts; this one includes discussion of an asynchronous API follow-up.', { title: 'First Bad Version', difficulty: 'Easy', topic: 'Binary search' }, true),
  entry('maximum-sum-circular-subarray', googleMV, 'The author identifies this as a similar practice problem, not the exact interview prompt.', { title: 'Maximum Sum Circular Subarray', difficulty: 'Medium', topic: 'Dynamic programming' }, true),
  entry('design-search-autocomplete-system', googleMV, 'The author identifies this as a similar practice problem, not the exact interview prompt.', { title: 'Design Search Autocomplete System', difficulty: 'Hard', topic: 'Tries', premium: true }, true),
  entry('most-stones-removed-with-same-row-or-column', googleMV, 'The author identifies this as similar practice and describes using union-find.', { title: 'Most Stones Removed with Same Row or Column', difficulty: 'Medium', topic: 'Union find' }, true),
  entry('interval-list-intersections', googleEurope, 'The candidate links this in coding round 3, followed by generalizing to multiple interval lists.'),
  entry('count-of-smaller-numbers-after-self', googleEurope, 'The additional interview asked for smaller elements to the left, rather than to the right.', { title: 'Count of Smaller Numbers After Self', difficulty: 'Hard', topic: 'Merge sort' }, true),
  entry('insert-interval', googleEurope, 'The candidate describes checking whether extra tasks fit a single-core schedule, calling it a simplified Insert Interval.', undefined, true),
  entry('meeting-rooms-ii', googleEurope, 'The follow-up uses a four-core processor and checks task capacity, rather than directly asking for the minimum room count.', { title: 'Meeting Rooms II', difficulty: 'Medium', topic: 'Intervals', premium: true }, true),
  entry('delete-nodes-and-return-forest', googleBLR, 'The candidate links this exercise in round 5.', { title: 'Delete Nodes And Return Forest', difficulty: 'Medium', topic: 'Trees' }),
  entry('house-robber-iii', googleIndia, 'The author supplies this as a closest-match exercise for onsite round 1, not an exact prompt.', { title: 'House Robber III', difficulty: 'Medium', topic: 'Tree dynamic programming' }, true),
  entry('dungeon-game', googleIndia, 'The author supplies this as similar practice for onsite round 1.', { title: 'Dungeon Game', difficulty: 'Hard', topic: 'Dynamic programming' }, true),
  entry('partition-equal-subset-sum', googleIndia, 'The author says the subset logic of onsite round 2 was based on this exercise.', { title: 'Partition Equal Subset Sum', difficulty: 'Medium', topic: 'Dynamic programming' }, true),
  entry('partition-array-into-two-arrays-to-minimize-sum-difference', googleIndia, 'The author identifies this as closest-match subset practice for onsite round 2.', { title: 'Partition Array Into Two Arrays to Minimize Sum Difference', difficulty: 'Hard', topic: 'Meet in the middle' }, true),
  entry('maximum-employees-to-be-invited-to-a-meeting', googleIndia, 'The author says onsite round 3 used similar underlying logic; the full prompt is not disclosed.', { title: 'Maximum Employees to Be Invited to a Meeting', difficulty: 'Hard', topic: 'Graphs' }, true),
  ...['course-schedule-ii', 'word-ladder'].map(id => entry(id, googleAugust, 'The candidate links this exercise but explicitly says the report supplies similar questions to respect their NDA.', undefined, true)),
);

const amazon2020 = report('amazon', 'Amazon SDE1 Apr 2020 [Offer] Virtual Onsite', 'SDE1 · Virtual onsite', 'March 2020 interviews; April 2020 result', '568757/Amazon-or-SDE1-or-Apr-2020-Offer-Virtual-Onsite');
const amazonNYC = report('amazon', 'Amazon SDE1 NYC [Offer]', 'SDE1 · NYC · Virtual onsite', 'October 2021 interview', '1555547/Amazon-or-SDE1-or-NYC-or-October-2021-Offer');
const amazonGrad = report('amazon', 'Amazon New Grad 2021 Interview Experience', 'New Grad · Final interviews', 'March 5, 2021 interview', '1106364/amazon-new-grad-2021-interview-experience-3x45');
const amazonOct = report('amazon', 'Amazon SDE2 Rejected India Oct 2021', 'SDE2 · India', 'October 2021 interview', '1530092/amazon-sde-2-rejected-india-oct-2021');
const amazonAnalyst = report('amazon', 'Amazon Programmer Analyst Hyderabad [Offered]', 'Programmer Analyst · Hyderabad', 'September 14, 2021 interview', '1519361/amazon-off-campusprogrammer-analysthyderabadindiaseptember-2021-offered');
const amazonIntern = report('amazon', 'Amazon 6 months intern Hyderabad India', 'SDE Intern · Online assessment', 'January 2021 internship; interview date unspecified', '914824/amazon-6-months-intern-hyderabad-india');
const amazonCousins = report('amazon', 'Amazon SDE1 Bangalore Jan 2021 [Reject]', 'SDE1 · Bangalore · Round 1', 'January 2021 interview', '1012854/amazon-sde-1-bangalore-jan-2021-reject');
reportedProblems.amazon.push(
  entry('merge-k-sorted-lists', amazon2020, 'The candidate names this exercise in virtual onsite round 2.'),
  entry('unique-paths', amazon2020, 'The candidate names this exercise in virtual onsite round 2.', { title: 'Unique Paths', difficulty: 'Medium', topic: 'Dynamic programming' }),
  entry('longest-substring-without-repeating-characters', amazon2020, 'The candidate names this exercise in the Bar Raiser round.'),
  entry('rotate-list', amazonNYC, 'The candidate identifies this as the exact first onsite problem.'),
  entry('isomorphic-strings', amazonGrad, 'The candidate names this exercise in round 2.', { title: 'Isomorphic Strings', difficulty: 'Easy', topic: 'Hashing' }),
  entry('design-search-autocomplete-system', amazonGrad, 'The candidate links this exercise in round 3.', { title: 'Design Search Autocomplete System', difficulty: 'Hard', topic: 'Tries', premium: true }),
  entry('k-closest-points-to-origin', amazonOct, 'The candidate links this exercise in the online assessment.'),
  ...['rotting-oranges', 'minimum-window-substring'].map(id => entry(id, amazonOct, 'The candidate links this exercise in the onsite DSA round.')),
  entry('two-sum', amazonAnalyst, 'The candidate names and links this exercise in technical round 2.'),
  entry('validate-binary-search-tree', amazonAnalyst, 'The candidate links this exercise in technical round 3.'),
  entry('critical-connections-in-a-network', amazonIntern, 'The candidate links this exercise in the online assessment.', { title: 'Critical Connections in a Network', difficulty: 'Hard', topic: 'Graphs' }),
  entry('search-a-2d-matrix-ii', amazonIntern, 'The candidate links this exercise in the online assessment.', { title: 'Search a 2D Matrix II', difficulty: 'Medium', topic: 'Matrices' }),
  entry('cousins-in-binary-tree', amazonCousins, 'The candidate links this round-1 question and says they explained the approach without coding it.', { title: 'Cousins in Binary Tree', difficulty: 'Easy', topic: 'Trees' }),
);

const netflixIntern = report('netflix', 'Netflix Intern USA Jan 2022 [Reject]', 'Platform software engineering intern · CodeSignal OA', 'January 2022 assessment', '1704206/netflix-intern-usa-jan-2022-reject');
const netflixFrontend = report('netflix', 'Netflix online screening round 1 Poland frontend L4/L5', 'Frontend L4/L5 · Poland · Online screen', unknownDate, '7421643');
function reportedTask(id: string, title: string, difficulty: Problem['difficulty'], topic: string, source: Report, prompt: string): Problem {
  return { id, title, difficulty, topic, minutes: difficulty === 'Easy' ? 15 : 30, note: prompt, url: source.url, platform: 'LeetCode', source: source.url, sourceKind: 'Candidate report', evidence: { company: source.company, title: source.title, context: source.context, date: source.date, match: 'Reported task', summary: 'Practice from the original candidate prompt linked here. Difficulty and time estimate are editorial; this is not a numbered LeetCode exercise.', checkedOn: '2026-10-16' } };
}
reportedProblems.netflix.push(
  reportedTask('netflix-alternating-position-sums', 'Difference of Even and Odd Position Sums', 'Easy', 'Arrays', netflixIntern, 'Compute the difference between sums at even and odd positions, considering values in the reported -100 to 100 range. Clarify the position indexing convention before coding.'),
  reportedTask('netflix-diagonal-sequence', 'Longest Alternating Diagonal Segment', 'Medium', 'Matrices', netflixIntern, 'Find the longest straight diagonal segment starting with 1 and then alternating 2, 0, 2, 0. Consider all diagonal directions.'),
  reportedTask('netflix-at-least-k-distinct', 'Subarrays with at Least K Distinct Integers', 'Hard', 'Sliding window', netflixIntern, 'Count contiguous subarrays containing at least K distinct integers. The candidate links the original question as assessment question 4.'),
  reportedTask('netflix-flatten-object', 'Flatten a Nested Object into an Array', 'Medium', 'Depth-first search', netflixFrontend, 'Flatten a nested object into an array. The report does not specify ordering or which values to include: state these assumptions before implementing your traversal.'),
);
