import type { Problem } from './problems';

const e5 = 'https://leetcode.com/discuss/post/4925891/Meta-or-E5-or-Reject/';
const fullLoop = 'https://leetcode.com/discuss/post/5795292/Meta-Phone-Screen-and-Full-Loop/';
function reported(id: string, title: string, difficulty: Problem['difficulty'], topic: string, minutes: number, note: string, source: string): Problem {
  return { id, title, difficulty, topic, minutes, note, source, sourceKind: 'Candidate report', platform: 'LeetCode', url: `https://leetcode.com/problems/${id}/` };
}
const community = 'https://leetcode.com/discuss/post/6764809/meta-interview-questions-by-anonymous_us-6myu/';
const infra = 'https://leetcode.com/discuss/post/6460774/Meta-or-E4-SWE-or-USA-or-Feb-2025-or-Passed-Hiring-Committee/';
const product = 'https://leetcode.com/discuss/post/6379540/';
const onsite = 'https://leetcode.com/discuss/post/6013171/Meta-or-E4-or-Onsite-or-US-or-Rejected/';
function curated(id: string, title: string, difficulty: Problem['difficulty'], topic: string, note: string, premium = false): Problem {
  return { ...reported(id, title, difficulty, topic, difficulty === 'Hard' ? 45 : difficulty === 'Easy' ? 20 : 30, note, community), sourceKind: 'Community list', premium };
}
export const metaProblems = [
  reported('valid-palindrome-ii', 'Valid Palindrome II', 'Easy', 'Two pointers', 20, 'Decide which character to skip when the pointers disagree.', e5),
  reported('minimum-remove-to-make-valid-parentheses', 'Minimum Remove to Make Valid Parentheses', 'Medium', 'Strings & stacks', 25, 'Track unmatched brackets and preserve the remaining order.', fullLoop),
  reported('diameter-of-binary-tree', 'Diameter of Binary Tree', 'Easy', 'Trees', 20, 'Use subtree heights to find the longest path.', e5),
  reported('lowest-common-ancestor-of-a-binary-tree', 'Lowest Common Ancestor of a Binary Tree', 'Medium', 'Trees', 30, 'Combine what each branch tells you about the two nodes.', e5),
  reported('subarray-sum-equals-k', 'Subarray Sum Equals K', 'Medium', 'Prefix sums', 30, 'Practice prefix sums. The report describes an existence-check variation.', fullLoop),
  reported('product-of-array-except-self', 'Product of Array Except Self', 'Medium', 'Arrays', 25, 'Combine prefix and suffix products. The report mentions a variation.', fullLoop),
  reported('diagonal-traverse', 'Diagonal Traverse', 'Medium', 'Matrices', 25, 'Keep direction changes and matrix boundaries explicit.', e5),
  reported('next-permutation', 'Next Permutation', 'Medium', 'Arrays', 30, 'Find the pivot, then make the smallest possible increase.', e5),
  curated('valid-palindrome', 'Valid Palindrome', 'Easy', 'Two pointers', 'Ignore punctuation while comparing the two ends.'),
  curated('valid-word-abbreviation', 'Valid Word Abbreviation', 'Easy', 'Two pointers', 'Advance carefully through letters and numeric skips.', true),
  curated('merge-sorted-array', 'Merge Sorted Array', 'Easy', 'Arrays', 'Fill the available space from the back.'),
  curated('best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'Easy', 'Arrays', 'Track the lowest price before each possible sale.'),
  curated('palindrome-permutation', 'Palindrome Permutation', 'Easy', 'Hashing', 'Count how many character frequencies are odd.', true),
  curated('group-shifted-strings', 'Group Shifted Strings', 'Medium', 'Hashing', 'Represent each word by its relative character offsets.', true),
  curated('custom-sort-string', 'Custom Sort String', 'Medium', 'Strings', 'Use the supplied alphabet to arrange character counts.'),
  curated('maximum-swap', 'Maximum Swap', 'Medium', 'Greedy', 'Choose the earliest digit that a later digit can improve.'),
  curated('dot-product-of-two-sparse-vectors', 'Dot Product of Two Sparse Vectors', 'Medium', 'Hashing', 'Match only the positions that contribute to the product.', true),
  curated('powx-n', 'Pow(x, n)', 'Medium', 'Recursion', 'Halve the exponent and handle negative powers.'),
  curated('find-peak-element', 'Find Peak Element', 'Medium', 'Binary search', 'Use the slope to choose a promising half.'),
  curated('kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'Medium', 'Heaps', 'Keep only the candidates needed for the requested rank.'),
  curated('top-k-frequent-elements', 'Top K Frequent Elements', 'Medium', 'Heaps', 'Separate counting from selecting the most frequent values.'),
  curated('k-closest-points-to-origin', 'K Closest Points to Origin', 'Medium', 'Heaps', 'Compare squared distances without computing square roots.'),
  curated('buildings-with-an-ocean-view', 'Buildings With an Ocean View', 'Medium', 'Stacks', 'Scan from the ocean and track the tallest obstruction.', true),
  curated('asteroid-collision', 'Asteroid Collision', 'Medium', 'Stacks', 'Resolve opposing directions before saving the survivor.'),
  curated('simplify-path', 'Simplify Path', 'Medium', 'Stacks', 'Normalize path segments with a stack.'),
  curated('basic-calculator-ii', 'Basic Calculator II', 'Medium', 'Parsing', 'Apply multiplication and division before combining terms.'),
  curated('sum-root-to-leaf-numbers', 'Sum Root to Leaf Numbers', 'Medium', 'Trees', 'Carry the accumulated number down each branch.'),
  curated('binary-search-tree-iterator', 'Binary Search Tree Iterator', 'Medium', 'Trees', 'Keep the next inorder path ready without flattening the tree.'),
  curated('binary-tree-zigzag-level-order-traversal', 'Binary Tree Zigzag Level Order Traversal', 'Medium', 'Trees', 'Traverse by level and alternate the output direction.'),
  reported('binary-tree-right-side-view', 'Binary Tree Right Side View', 'Medium', 'Trees', 25, 'Capture one visible node per level. The report describes a variation.', infra),
  curated('lowest-common-ancestor-of-a-binary-search-tree', 'Lowest Common Ancestor of a Binary Search Tree', 'Medium', 'Trees', 'Follow the ordering until the two target paths separate.'),
  curated('lowest-common-ancestor-of-a-binary-tree-iii', 'Lowest Common Ancestor of a Binary Tree III', 'Medium', 'Trees', 'Use parent pointers to connect two paths to the root.', true),
  curated('max-consecutive-ones-iii', 'Max Consecutive Ones III', 'Medium', 'Sliding window', 'Maintain a window with at most the allowed number of zeros.'),
  curated('interval-list-intersections', 'Interval List Intersections', 'Medium', 'Intervals', 'Advance the interval that ends first.'),
  reported('merge-intervals', 'Merge Intervals', 'Medium', 'Intervals', 30, 'Sort by start time and extend overlapping ranges. Matched to the report’s merge-interval task.', onsite),
  { ...reported('nested-list-weight-sum', 'Nested List Weight Sum', 'Medium', 'Recursion', 25, 'Accumulate values with their nesting depth. Related practice for the report’s brief nested-list description.', onsite), premium: true },
  curated('shortest-path-in-binary-matrix', 'Shortest Path in Binary Matrix', 'Medium', 'Graphs', 'Explore eight-directional neighbors in breadth-first layers.'),
  curated('minesweeper', 'Minesweeper', 'Medium', 'Graphs', 'Reveal empty regions while respecting adjacent mine counts.'),
  curated('pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'Medium', 'Graphs', 'Search uphill from each ocean and intersect the reachable cells.'),
  reported('course-schedule', 'Course Schedule', 'Medium', 'Graphs', 30, 'Practice dependency cycles. The report asks a different maximum-course variation.', product),
  curated('letter-combinations-of-a-phone-number', 'Letter Combinations of a Phone Number', 'Medium', 'Backtracking', 'Choose one letter per digit and explore the combinations.'),
  curated('word-search-ii', 'Word Search II', 'Hard', 'Backtracking & tries', 'Prune grid searches using shared word prefixes.'),
  curated('valid-number', 'Valid Number', 'Hard', 'Parsing', 'Make the rules for signs, decimal points, and exponents explicit.'),
  curated('vertical-order-traversal-of-a-binary-tree', 'Vertical Order Traversal of a Binary Tree', 'Hard', 'Trees', 'Track coordinates and resolve position ties by node value.'),
  curated('minimum-window-substring', 'Minimum Window Substring', 'Hard', 'Sliding window', 'Shrink a valid window without losing required character counts.'),
  curated('sliding-window-maximum', 'Sliding Window Maximum', 'Hard', 'Sliding window', 'Maintain a deque of candidates that can still become the maximum.'),
  curated('sliding-window-median', 'Sliding Window Median', 'Hard', 'Heaps', 'Balance both halves while removing expired elements.'),
  reported('merge-k-sorted-lists', 'Merge k Sorted Lists', 'Hard', 'Heaps', 45, 'Practice multiway merging. The report asks for three sorted lists with duplicates removed.', infra),
  curated('valid-palindrome-iii', 'Valid Palindrome III', 'Hard', 'Dynamic programming', 'Find the minimum deletions needed to make a palindrome.', true),
  { ...reported('robot-room-cleaner', 'Robot Room Cleaner', 'Hard', 'Backtracking', 45, 'Explore an unknown room and restore the robot’s position after each branch.', e5), premium: true },
];

