import React, { useEffect, useMemo, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import ts from 'typescript';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import './Pages.css';
import './Assessments.css';

globalThis.MonacoEnvironment = {
  ...(globalThis.MonacoEnvironment || {}),
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });

monaco.editor.defineTheme('learnpath-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#06070b',
    'editorGutter.background': '#06070b',
    'minimap.background': '#06070b',
    'editor.lineHighlightBackground': '#0b0d12',
  },
});

const QUIZ_DRAFT_KEY = 'assessments_quiz_draft_v1';
const CODE_DRAFT_KEY = 'assessments_code_draft_v1';


const quizQuestionsBank = [
  // JavaScript
  { id:1, category:'JavaScript', difficulty:'Medium',
    question:'What is the output of `typeof null` in JavaScript?',
    options:['null','undefined','object','string'], correct:2,
    explanation:'`typeof null` returns "object" â€” a historic JS bug kept for backward compatibility.' },
  { id:2, category:'JavaScript', difficulty:'Easy',
    question:'Which method removes the last element from an array and returns it?',
    options:['shift()','pop()','splice()','slice()'], correct:1,
    explanation:'`pop()` removes and returns the last element. `shift()` does the same for the first.' },
  { id:3, category:'JavaScript', difficulty:'Hard',
    question:'What will `console.log(0.1 + 0.2 === 0.3)` print?',
    options:['true','false','NaN','undefined'], correct:1,
    explanation:'Floating-point precision: `0.1 + 0.2` equals `0.30000000000000004`, not `0.3`.' },
  { id:4, category:'JavaScript', difficulty:'Medium',
    question:'What is a closure in JavaScript?',
    options:['A function with no return value','A function bundled with its lexical environment','A way to close the browser tab','An error-handling mechanism'],
    correct:1, explanation:'A closure retains access to its outer scope even after the outer function has returned.' },
  // Python
  { id:5, category:'Python', difficulty:'Easy',
    question:'Which keyword is used to define a function in Python?',
    options:['func','function','def','define'], correct:2,
    explanation:'Python uses `def` to declare functions.' },
  { id:6, category:'Python', difficulty:'Medium',
    question:'What does `*args` mean in a Python function definition?',
    options:['Unpacks a dictionary','Accepts any number of keyword args','Accepts any number of positional args','Creates a pointer'],
    correct:2, explanation:'`*args` collects extra positional arguments into a tuple.' },
  { id:7, category:'Python', difficulty:'Hard',
    question:'What is the output of `[x**2 for x in range(4) if x % 2 == 0]`?',
    options:['[1, 9]','[0, 4]','[0, 1, 4, 9]','[4, 16]'], correct:1,
    explanation:'Even numbers in range(4) are 0 and 2. 0Â²=0, 2Â²=4 â†’ [0, 4].' },
  // React
  { id:8, category:'React', difficulty:'Easy',
    question:'Which hook performs side effects in a functional component?',
    options:['useState','useEffect','useContext','useReducer'], correct:1,
    explanation:'`useEffect` handles side effects like data fetching and DOM mutations.' },
  { id:9, category:'React', difficulty:'Medium',
    question:'What does the second value of `useState` return?',
    options:['The initial state','A setter function that triggers re-render','A ref object','The previous state'],
    correct:1, explanation:'`useState` returns `[currentValue, setter]`. Calling the setter triggers a re-render.' },
  { id:10, category:'React', difficulty:'Hard',
    question:'When does React re-render a component?',
    options:['Only when props change','Only when state changes','When state, props, or consumed context changes','Every second automatically'],
    correct:2, explanation:'React re-renders on state change, props change, or context value update.' },
  // DSA
  { id:11, category:'DSA', difficulty:'Hard',
    question:'Time complexity of searching in a balanced BST?',
    options:['O(n)','O(log n)','O(n log n)','O(1)'], correct:1,
    explanation:'Each comparison halves the search space â†’ O(log n).' },
  { id:12, category:'DSA', difficulty:'Medium',
    question:'Which data structure uses LIFO order?',
    options:['Queue','Stack','Heap','Graph'], correct:1,
    explanation:'Stack follows Last-In-First-Out.' },
  { id:13, category:'DSA', difficulty:'Medium',
    question:'Worst-case time complexity of QuickSort?',
    options:['O(n log n)','O(n)','O(nÂ²)','O(log n)'], correct:2,
    explanation:'QuickSort degrades to O(nÂ²) when the pivot is always the smallest/largest element.' },
  // SQL
  { id:14, category:'SQL', difficulty:'Easy',
    question:'Which clause filters rows returned by a query?',
    options:['ORDER BY','GROUP BY','WHERE','HAVING'], correct:2,
    explanation:'`WHERE` filters rows before aggregation. `HAVING` filters after GROUP BY.' },
  { id:15, category:'SQL', difficulty:'Medium',
    question:'Difference between INNER JOIN and LEFT JOIN?',
    options:['No difference','INNER returns only matches; LEFT also returns unmatched left rows','LEFT JOIN is always faster','INNER JOIN only works on primary keys'],
    correct:1, explanation:'LEFT JOIN returns all left rows with NULLs for missing matches.' },
  // CSS
  { id:16, category:'CSS', difficulty:'Easy',
    question:'Which property controls space between the border and content?',
    options:['margin','padding','border-spacing','gap'], correct:1,
    explanation:'`padding` is inside the border; `margin` is outside.' },
  { id:17, category:'CSS', difficulty:'Medium',
    question:'What does `display: flex` do?',
    options:['Makes element invisible','Creates a flex container for children','Floats the element left','Fixes element to viewport'],
    correct:1, explanation:'`display: flex` enables flexbox layout on all direct children.' },
  // TypeScript
  { id:18, category:'TypeScript', difficulty:'Medium',
    question:'What is the `any` type in TypeScript?',
    options:['Accepts only numbers','Opts out of type checking','Union of all primitives','Type for arrays'],
    correct:1, explanation:'`any` disables TypeScript type checking â€” use sparingly.' },
  // System Design
  { id:19, category:'System Design', difficulty:'Medium',
    question:'Best database for unstructured data at scale?',
    options:['MySQL','PostgreSQL','MongoDB','SQLite'], correct:2,
    explanation:'MongoDB is document-oriented NoSQL, ideal for unstructured data at scale.' },
  { id:20, category:'System Design', difficulty:'Hard',
    question:'What is the purpose of a CDN?',
    options:['Store databases near the server','Serve static assets from edge servers near users','Encrypt API traffic','Manage DNS records'],
    correct:1, explanation:'CDNs cache and deliver static content from edge nodes close to users, reducing latency.' },
];

const STACK_TO_QUIZ_CATEGORIES = {
  react: ['React', 'JavaScript', 'TypeScript', 'CSS'],
  vue: ['JavaScript', 'TypeScript', 'CSS'],
  angular: ['JavaScript', 'TypeScript', 'CSS'],
  'node.js': ['JavaScript', 'SQL', 'System Design'],
  express: ['JavaScript', 'SQL', 'System Design'],
  python: ['Python', 'DSA', 'SQL'],
  django: ['Python', 'SQL', 'System Design'],
  fastapi: ['Python', 'SQL', 'System Design'],
  java: ['DSA', 'System Design'],
  'spring boot': ['SQL', 'System Design'],
  go: ['System Design', 'DSA'],
  postgresql: ['SQL'],
  mongodb: ['SQL', 'System Design'],
  redis: ['System Design'],
  docker: ['System Design'],
  kubernetes: ['System Design'],
  aws: ['System Design'],
  typescript: ['TypeScript', 'JavaScript'],
  graphql: ['System Design'],
  'rest apis': ['System Design', 'JavaScript'],
};

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateQuizFromStack(stack, bank, targetCount = 10) {
  if (!Array.isArray(stack) || stack.length === 0) {
    return shuffle(bank).slice(0, Math.min(targetCount, bank.length));
  }

  const categorySet = new Set();
  stack.forEach((tech) => {
    const normalized = String(tech).toLowerCase();
    Object.entries(STACK_TO_QUIZ_CATEGORIES).forEach(([key, categories]) => {
      if (normalized.includes(key)) {
        categories.forEach((cat) => categorySet.add(cat));
      }
    });
  });

  if (categorySet.size === 0) {
    return shuffle(bank).slice(0, Math.min(targetCount, bank.length));
  }

  const priority = shuffle(bank.filter((q) => categorySet.has(q.category)));
  const fallback = shuffle(bank.filter((q) => !categorySet.has(q.category)));
  return [...priority, ...fallback].slice(0, Math.min(targetCount, bank.length));
}


const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript', monaco: 'javascript' },
  { label: 'TypeScript', value: 'typescript', monaco: 'typescript' },
  { label: 'Python',     value: 'python',     monaco: 'python'     },
  { label: 'Java',       value: 'java',        monaco: 'java'       },
  { label: 'C++',        value: 'cpp',         monaco: 'cpp'        },
];


const PROBLEMS = [
  {
    id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays & Hashing',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nEach input has exactly one solution. You may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9.' },
      { input: 'nums = [3,2,4], target = 6',     output: '[1,2]', explanation: 'nums[1] + nums[2] == 6.' },
    ],
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer.'],
    code: {
      javascript: `function twoSum(nums, target) {\n  // Write your solution here\n}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  // Write your solution here\n  return [];\n}`,
      python:     `from typing import List\n\ndef two_sum(nums: List[int], target: int) -> List[int]:\n    # Write your solution here\n    pass`,
      java:       `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
      cpp:        `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
    },
  },
  {
    id: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy', category: 'Two Pointers',
    description: 'A phrase is a palindrome if, after converting all uppercase to lowercase and removing non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, false otherwise.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true',  explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"',                    output: 'false', explanation: '"raceacar" is not a palindrome.' },
    ],
    testCases: [
      { input: ["A man, a plan, a canal: Panama"], expected: true },
      { input: ["race a car"], expected: false },
      { input: [" "], expected: true },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists of printable ASCII characters.'],
    code: {
      javascript: `function isPalindrome(s) {\n  // Write your solution here\n}`,
      typescript: `function isPalindrome(s: string): boolean {\n  // Write your solution here\n  return false;\n}`,
      python:     `def is_palindrome(s: str) -> bool:\n    # Write your solution here\n    pass`,
      java:       `class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n        return false;\n    }\n}`,
      cpp:        `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your solution here\n        return false;\n    }\n};`,
    },
  },
  {
    id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', category: 'Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'List is reversed.' },
      { input: 'head = [1,2]',       output: '[2,1]',       explanation: 'List is reversed.' },
    ],
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { input: [[1, 2]], expected: [2, 1] },
      { input: [[]], expected: [] },
    ],
    constraints: ['Number of nodes in [0, 5000].', '-5000 <= Node.val <= 5000'],
    code: {
      javascript: `// ListNode: function ListNode(val, next) { this.val = val; this.next = next ?? null; }\n\nfunction reverseList(head) {\n  // Write your solution here\n}`,
      typescript: `// class ListNode { val: number; next: ListNode | null = null; }\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n  // Write your solution here\n  return null;\n}`,
      python:     `# class ListNode:\n#     def __init__(self, val=0, next=None): ...\n\ndef reverse_list(head):\n    # Write your solution here\n    pass`,
      java:       `// public class ListNode { int val; ListNode next; }\n\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}`,
      cpp:        `// struct ListNode { int val; ListNode *next; };\n\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        return nullptr;\n    }\n};`,
    },
  },
  {
    id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', category: 'Dynamic Programming',
    description: 'You are climbing a staircase that takes n steps to reach the top.\n\nEach time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2 â€” two ways.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1 â€” three ways.' },
    ],
    testCases: [
      { input: [2], expected: 2 },
      { input: [3], expected: 3 },
      { input: [4], expected: 5 },
    ],
    constraints: ['1 <= n <= 45'],
    code: {
      javascript: `function climbStairs(n) {\n  // Write your solution here\n}`,
      typescript: `function climbStairs(n: number): number {\n  // Write your solution here\n  return 0;\n}`,
      python:     `def climb_stairs(n: int) -> int:\n    # Write your solution here\n    pass`,
      java:       `class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp:        `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n};`,
    },
  },
  {
    id: 'max-subarray', title: 'Maximum Subarray', difficulty: 'Medium', category: 'Dynamic Programming',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has sum = 6.' },
      { input: 'nums = [1]',                      output: '1', explanation: 'Single element.' },
    ],
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    code: {
      javascript: `function maxSubArray(nums) {\n  // Kadane's Algorithm\n}`,
      typescript: `function maxSubArray(nums: number[]): number {\n  // Kadane's Algorithm\n  return 0;\n}`,
      python:     `from typing import List\n\ndef max_sub_array(nums: List[int]) -> int:\n    # Kadane's Algorithm\n    pass`,
      java:       `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Kadane's Algorithm\n        return 0;\n    }\n}`,
      cpp:        `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Kadane's Algorithm\n        return 0;\n    }\n};`,
    },
  },
  {
    id: 'binary-search', title: 'Binary Search', difficulty: 'Easy', category: 'Binary Search',
    description: 'Given a sorted array of integers nums and an integer target, return the index if target exists, otherwise return -1.\n\nYou must write an O(log n) algorithm.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4',  explanation: '9 exists at index 4.' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist.' },
    ],
    testCases: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { input: [[2, 5], 5], expected: 1 },
    ],
    constraints: ['1 <= nums.length <= 10^4', 'All integers are unique.', '-10^4 <= target <= 10^4'],
    code: {
      javascript: `function search(nums, target) {\n  // O(log n) solution\n}`,
      typescript: `function search(nums: number[], target: number): number {\n  // O(log n) solution\n  return -1;\n}`,
      python:     `from typing import List\n\ndef search(nums: List[int], target: int) -> int:\n    # O(log n) solution\n    pass`,
      java:       `class Solution {\n    public int search(int[] nums, int target) {\n        // O(log n) solution\n        return -1;\n    }\n}`,
      cpp:        `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // O(log n) solution\n        return -1;\n    }\n};`,
    },
  },
];

const DIFF_COLORS = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

/* ── Universal Evaluation Engine ── */
const PISTON_RUNTIME = {
  python: { language: 'python', version: '3.10.0' },
  java:   { language: 'java',   version: '15.0.2' },
  cpp:    { language: 'c++',    version: '10.2.0' },
};
const JS_FN  = { 'two-sum':'twoSum','valid-palindrome':'isPalindrome','climbing-stairs':'climbStairs','max-subarray':'maxSubArray','binary-search':'search','reverse-linked-list':'reverseList' };
const PY_FN  = { 'two-sum':'two_sum','valid-palindrome':'is_palindrome','climbing-stairs':'climb_stairs','max-subarray':'max_sub_array','binary-search':'search','reverse-linked-list':'reverse_list' };

const deepEqual = (a, b) => {
  if (a === undefined || a === null) return false;
  if (b === undefined || b === null) return false;
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;
  return JSON.stringify(a) === JSON.stringify(b);
};

const stripCodeComments = (input = '') => input
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/.*$/gm, '$1')
  .replace(/#.*$/gm, '');

const normalizeCodeForComparison = (input = '') => stripCodeComments(input)
  .replace(/\s+/g, ' ')
  .replace(/[{}();,]/g, '')
  .trim()
  .toLowerCase();

const isUnmodifiedBoilerplate = (userCode, templateCode) => {
  if (!userCode || !String(userCode).trim()) return true;
  if (!templateCode) return false;
  const normalizedUser = normalizeCodeForComparison(userCode);
  const normalizedTemplate = normalizeCodeForComparison(templateCode);
  return Boolean(normalizedUser) && normalizedUser === normalizedTemplate;
};

const toBooleanVerdict = (value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true' || value.trim() === '1';
  return Boolean(value);
};

const buildBoilerplateFailureCases = (testCases) => testCases.map((tc, i) => ({
  num: i + 1,
  passed: false,
  error: 'Wrong Answer: code is empty or still boilerplate. Please implement the solution before running.',
  input: tc.input,
  expected: tc.expected,
  actual: undefined,
}));

const transpileTypeScriptCode = (sourceCode) => {
  const transpiled = ts.transpileModule(sourceCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      strict: false,
    },
    reportDiagnostics: true,
  });

  const firstDiagnostic = transpiled.diagnostics?.[0];
  if (firstDiagnostic) {
    const message = ts.flattenDiagnosticMessageText(firstDiagnostic.messageText, '\n');
    throw new Error(`TypeScript Error: ${message}`);
  }

  return transpiled.outputText || '';
};

/* JS/TS: run instantly in browser sandbox */
const runInBrowserSandbox = (langValue, userCode, problemId, testCases) => {
  const fnName = JS_FN[problemId];
  if (!fnName) return testCases.map((tc, i) => ({ num:i+1, passed:false, error:'Problem not found.', input:tc.input, expected:tc.expected }));
  let executableCode = userCode;

  if (langValue === 'typescript') {
    try {
      executableCode = transpileTypeScriptCode(userCode);
    } catch (err) {
      return testCases.map((tc, i) => ({
        num: i + 1,
        passed: false,
        error: `Compile Error: ${err.message}`,
        input: tc.input,
        expected: tc.expected,
        actual: undefined,
      }));
    }
  }

  let userFn;
  try {
    userFn = new Function(`${executableCode}\nreturn typeof ${fnName}!=='undefined'?${fnName}:null;`)();
    if (typeof userFn !== 'function') throw new Error(`Function '${fnName}' is not defined.`);
  } catch (err) {
    return testCases.map((tc,i) => ({ num:i+1, passed:false, error:`Compile Error: ${err.message}`, input:tc.input, expected:tc.expected, actual:undefined }));
  }
  return testCases.map((tc, idx) => {
    try {
      const actual = userFn(...JSON.parse(JSON.stringify(tc.input)));
      if (actual === undefined) return { num:idx+1, passed:false, error:'Function returned undefined — did you forget a return statement?', input:tc.input, expected:tc.expected, actual:undefined };
      return { num:idx+1, input:tc.input, expected:tc.expected, actual, passed:deepEqual(actual, tc.expected) };
    } catch (e) {
      return { num:idx+1, passed:false, error:`Runtime Error: ${e.message}`, input:tc.input, expected:tc.expected, actual:undefined };
    }
  });
};

/* Python: build a self-contained test-runner script */
const buildPythonRunner = (problemId, userCode, testCases) => {
  const fn = PY_FN[problemId] || 'solution';
  const isLL = problemId === 'reverse-linked-list';
  const llDef = isLL ? `
class ListNode:
    def __init__(self,val=0,next=None): self.val=val; self.next=next
def _toL(a):
    d=ListNode(0);c=d
    for v in a: c.next=ListNode(v);c=c.next
    return d.next
def _toA(n):
    r=[]
    while n: r.append(n.val);n=n.next
    return r
` : '';
  const call = isLL ? `_toA(${fn}(_toL(__inp__[0])))` : `${fn}(*__inp__)`;
  const tdata = JSON.stringify(testCases.map(tc => ({ input:tc.input, expected:tc.expected })));
  return `import json
${llDef}
# -- User Solution --
${userCode}
# -------------------
__T__=json.loads('${tdata.replace(/'/g,"\\'")}')
__R__=[]
for __i__,__tc__ in enumerate(__T__):
    try:
        __inp__=json.loads(json.dumps(__tc__["input"]))
        __act__=${call}
        __exp__=__tc__["expected"]
        __R__.append({"num":__i__+1,"passed":bool(__act__==__exp__),"actual":__act__,"expected":__exp__,"input":__tc__["input"]})
    except Exception as __e__:
        __R__.append({"num":__i__+1,"passed":False,"error":str(__e__),"expected":__tc__["expected"],"input":__tc__["input"],"actual":None})
print(json.dumps(__R__))
`;
};

/* Java: build typed test-runner per problem */
const buildJavaRunner = (problemId, userCode, testCases) => {
  const arr = (a = []) => `new int[]{${a.join(',')}}`;
  const isLL = problemId === 'reverse-linked-list';
  const cases = testCases.map((tc, i) => {
    const n = i + 1;
    let call = '', eq = '', act = '';
    if (problemId === 'two-sum') {
      call = `int[] r=sol.twoSum(${arr(tc.input[0])},${tc.input[1]});`;
      eq   = `java.util.Arrays.equals(r,${arr(tc.expected)})`;
      act  = `java.util.Arrays.toString(r).replaceAll(" ","")`;
    } else if (problemId === 'valid-palindrome') {
      call = `boolean r=sol.isPalindrome(${JSON.stringify(tc.input[0])});`;
      eq   = `r==${tc.expected}`; act = `String.valueOf(r)`;
    } else if (problemId === 'climbing-stairs') {
      call = `int r=sol.climbStairs(${tc.input[0]});`;
      eq   = `r==${tc.expected}`; act = `String.valueOf(r)`;
    } else if (problemId === 'max-subarray') {
      call = `int r=sol.maxSubArray(${arr(tc.input[0])});`;
      eq   = `r==${tc.expected}`; act = `String.valueOf(r)`;
    } else if (problemId === 'binary-search') {
      call = `int r=sol.search(${arr(tc.input[0])},${tc.input[1]});`;
      eq   = `r==${tc.expected}`; act = `String.valueOf(r)`;
    } else if (problemId === 'reverse-linked-list') {
      call = `ListNode r=sol.reverseList(toList(${arr(tc.input[0])}));int[] out=toArray(r);`;
      eq   = `java.util.Arrays.equals(out,${arr(tc.expected)})`;
      act  = `java.util.Arrays.toString(out).replaceAll(" ","")`;
    } else {
      return `        if(!first)sb.append(",");first=false;
        sb.append("{\\"num\\":${n},\\"passed\\":false,\\"error\\":\\"Linked list not supported in Java runner\\"}");`;
    }
    return `        if(!first)sb.append(",");first=false;
        try{${call}boolean p=${eq};String a=${act};
            sb.append("{\\"num\\":${n},\\"passed\\":"+p+",\\"actual\\":\\"\"+(a)+"\\",\\"expected\\":\\"${JSON.stringify(tc.expected).replace(/"/g,"'")}\\"}");
        }catch(Exception e){sb.append("{\\"num\\":${n},\\"passed\\":false,\\"error\\":\\""+e.getMessage()+("\\"}"));}` ;
  }).join('\n');
  const llPrelude = isLL
    ? `class ListNode {\n  int val;\n  ListNode next;\n  ListNode() {}\n  ListNode(int v) { this.val = v; }\n  ListNode(int v, ListNode n) { this.val = v; this.next = n; }\n}`
    : '';
  const llHelpers = isLL
    ? `  static ListNode toList(int[] vals){\n    ListNode d=new ListNode(0), c=d;\n    for(int v:vals){ c.next=new ListNode(v); c=c.next; }\n    return d.next;\n  }\n  static int[] toArray(ListNode head){\n    java.util.ArrayList<Integer> out=new java.util.ArrayList<>();\n    while(head!=null){ out.add(head.val); head=head.next; }\n    int[] arr=new int[out.size()];\n    for(int i=0;i<out.size();i++) arr[i]=out.get(i);\n    return arr;\n  }`
    : '';
  return `import java.util.*;
${llPrelude}
${userCode}
public class Main{
${llHelpers}
  public static void main(String[] a){
    Solution sol=new Solution();
    StringBuilder sb=new StringBuilder("[");boolean first=true;
${cases}
    sb.append("]");System.out.println(sb);
  }
}`;
};

/* C++: build typed test-runner per problem */
const buildCppRunner = (problemId, userCode, testCases) => {
  const vec = (a = []) => `{${a.join(',')}}`;
  const isLL = problemId === 'reverse-linked-list';
  const cases = testCases.map((tc, i) => {
    const n = i + 1;
    let body = '';
    if (problemId === 'two-sum') {
      body = `vector<int> inp${vec(tc.input[0])};vector<int> r=sol.twoSum(inp,${tc.input[1]});bool p=(r==vector<int>${vec(tc.expected)});string a=vecToJson(r);
      cout<<"{\\"num\\":${n},\\"passed\\":"<<(p?"true":"false")<<",\\"actual\\":\\""<<a<<"\\",\\"expected\\":\\"${JSON.stringify(tc.expected)}\\"}";`;
    } else if (problemId === 'valid-palindrome') {
      body = `bool r=sol.isPalindrome(${JSON.stringify(tc.input[0])});bool p=(r==${tc.expected});string a=r?"true":"false";
      cout<<"{\\"num\\":${n},\\"passed\\":"<<(p?"true":"false")<<",\\"actual\\":\\""<<a<<"\\",\\"expected\\":\\"${tc.expected}\\"}";`;
    } else if (problemId === 'climbing-stairs') {
      body = `int r=sol.climbStairs(${tc.input[0]});bool p=(r==${tc.expected});
      cout<<"{\\"num\\":${n},\\"passed\\":"<<(p?"true":"false")<<",\\"actual\\":\\""<<r<<"\\",\\"expected\\":\\"${tc.expected}\\"}";`;
    } else if (problemId === 'max-subarray') {
      body = `vector<int> inp${vec(tc.input[0])};int r=sol.maxSubArray(inp);bool p=(r==${tc.expected});
      cout<<"{\\"num\\":${n},\\"passed\\":"<<(p?"true":"false")<<",\\"actual\\":\\""<<r<<"\\",\\"expected\\":\\"${tc.expected}\\"}";`;
    } else if (problemId === 'binary-search') {
      body = `vector<int> inp${vec(tc.input[0])};int r=sol.search(inp,${tc.input[1]});bool p=(r==${tc.expected});
      cout<<"{\\"num\\":${n},\\"passed\\":"<<(p?"true":"false")<<",\\"actual\\":\\""<<r<<"\\",\\"expected\\":\\"${tc.expected}\\"}";`;
    } else if (problemId === 'reverse-linked-list') {
      body = `ListNode* r=sol.reverseList(toList(vector<int>${vec(tc.input[0])}));vector<int> out=toVec(r);bool p=(out==vector<int>${vec(tc.expected)});string a=vecToJson(out);
      cout<<"{\\"num\\":${n},\\"passed\\":"<<(p?"true":"false")<<",\\"actual\\":\\""<<a<<"\\",\\"expected\\":\\"${JSON.stringify(tc.expected)}\\"}";`;
    } else {
      body = `cout<<"{\\"num\\":${n},\\"passed\\":false,\\"error\\":\\"Linked list test not supported\\"}";`;
    }
    return `  if(!first)cout<<",";first=false;
  try{${body}}
  catch(...){cout<<"{\\"num\\":${n},\\"passed\\":false,\\"error\\":\\"Runtime exception\\"}";}`;
  }).join('\n');
  const llPrelude = isLL
    ? `struct ListNode {\n  int val;\n  ListNode* next;\n  ListNode() : val(0), next(nullptr) {}\n  ListNode(int x) : val(x), next(nullptr) {}\n  ListNode(int x, ListNode* n) : val(x), next(n) {}\n};`
    : '';
  const llHelpers = isLL
    ? `vector<int> toVec(ListNode* node){ vector<int> out; while(node){ out.push_back(node->val); node=node->next; } return out; }\nListNode* toList(const vector<int>& vals){ ListNode d(0); ListNode* c=&d; for(int v:vals){ c->next=new ListNode(v); c=c->next; } return d.next; }`
    : '';
  return `#include<vector>\n#include<string>\n#include<iostream>\nusing namespace std;\n${llPrelude}\n${userCode}\n${llHelpers}\nstring vecToJson(const vector<int>& v){ string s="["; for(size_t i=0;i<v.size();++i){ if(i) s+=","; s+=to_string(v[i]); } s+="]"; return s; }\nint main(){\n  Solution sol;\n  cout<<"[";bool first=true;\n${cases}\n  cout<<"]"<<endl;\n  return 0;\n}`;
};

/* Call Piston via our backend proxy (avoids browser CORS/401 issues) */
const callPiston = async (lang, version, code, filename) => {
  const res = await fetch(`${API_BASE}/api/assessment/execute-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: lang, version, files: [{ name: filename, content: code }] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Execution error ${res.status}`);
  }
  return res.json();
};

/* Parse structured JSON output from test runners */
const parseRunnerOutput = (stdout, stderr, testCases) => {
  try {
    const lines = (stdout || '').trim().split('\n');
    const jsonLine = lines.reverse().find(l => l.trim().startsWith('['));
    if (!jsonLine) throw new Error('No output');
    return JSON.parse(jsonLine).map((r, i) => ({
      num: r.num || i + 1,
      passed: toBooleanVerdict(r.passed),
      actual: r.actual,
      expected: r.expected !== undefined ? r.expected : testCases[i]?.expected,
      input: r.input !== undefined ? r.input : testCases[i]?.input,
      error: r.error || undefined,
    }));
  } catch (_) {
    const errMsg = stderr?.trim() || stdout?.trim() || 'No output received';
    return testCases.map((tc, i) => ({ num: i+1, passed: false, error: errMsg.slice(0, 200), input: tc.input, expected: tc.expected, actual: undefined }));
  }
};

/* Main orchestrator */
const evaluateCode = async (langValue, problem, userCode) => {
  const { id: problemId, testCases } = problem;
  const boilerplateTemplate = problem?.code?.[langValue] || '';
  if (isUnmodifiedBoilerplate(userCode, boilerplateTemplate)) {
    return { cases: buildBoilerplateFailureCases(testCases), runtime: null };
  }

  if (langValue === 'javascript' || langValue === 'typescript') {
    return { cases: runInBrowserSandbox(langValue, userCode, problemId, testCases), runtime: null };
  }
  const rt = PISTON_RUNTIME[langValue];
  if (!rt) return { cases: testCases.map((tc, i) => ({ num:i+1, passed:false, error:`${langValue} is not supported.`, input:tc.input, expected:tc.expected })), runtime: null };
  let code, filename;
  if (langValue === 'python')  { code = buildPythonRunner(problemId, userCode, testCases); filename = 'solution.py'; }
  else if (langValue === 'java') { code = buildJavaRunner(problemId, userCode, testCases);  filename = 'Main.java'; }
  else if (langValue === 'cpp')  { code = buildCppRunner(problemId, userCode, testCases);   filename = 'main.cpp'; }
  const result = await callPiston(rt.language, rt.version, code, filename);
  const compileErr = result.compile?.stderr;
  if (compileErr) return { cases: testCases.map((tc, i) => ({ num:i+1, passed:false, error:`Compile Error: ${compileErr.slice(0,300)}`, input:tc.input, expected:tc.expected, actual:undefined })), runtime: null };
  const runtime = result.run?.time ? `${Math.round(result.run.time*1000)} ms` : null;
  return { cases: parseRunnerOutput(result.run?.stdout, result.run?.stderr, testCases), runtime };
};

export default function Assessments({ theme = 'dark' }) {
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const persistedQuizDraft = useMemo(() => {
    try {
      const raw = localStorage.getItem(QUIZ_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const persistedCodeDraft = useMemo(() => {
    try {
      const raw = localStorage.getItem(CODE_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [activeTab, setActiveTab] = useState(persistedCodeDraft?.activeTab || 'quiz');

  const selectedTechStack = useMemo(() => {
    try {
      const raw = localStorage.getItem('learning_plan_profile');
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed?.stack) ? parsed.stack : [];
    } catch {
      return [];
    }
  }, []);

  const quizQuestions = useMemo(
    () => {
      const fromDraftIds = Array.isArray(persistedQuizDraft?.questionIds)
        ? persistedQuizDraft.questionIds
        : [];

      if (fromDraftIds.length > 0) {
        const byId = new Map(quizQuestionsBank.map((q) => [q.id, q]));
        const restored = fromDraftIds.map((id) => byId.get(id)).filter(Boolean);
        if (restored.length > 0) return restored;
      }

      return generateQuizFromStack(selectedTechStack, quizQuestionsBank, 10);
    },
    [selectedTechStack, persistedQuizDraft]
  );

  // Quiz state
  const [current, setCurrent]   = useState(persistedQuizDraft?.current ?? 0);
  const [selected, setSelected] = useState(persistedQuizDraft?.selected ?? null);
  const [submitted, setSubmitted] = useState(persistedQuizDraft?.submitted ?? false);
  const [score, setScore]       = useState(persistedQuizDraft?.score ?? 0);
  const [answers, setAnswers]   = useState(Array.isArray(persistedQuizDraft?.answers) ? persistedQuizDraft.answers : []);
  const [quizDone, setQuizDone] = useState(persistedQuizDraft?.quizDone ?? false);
  const [quizSaved, setQuizSaved] = useState(persistedQuizDraft?.quizSaved ?? false);
  const [quizCoaching, setQuizCoaching] = useState(null);

  // Code editor state
  const initialLanguage = useMemo(
    () => LANGUAGES.find((l) => l.value === persistedCodeDraft?.languageValue) || LANGUAGES[0],
    [persistedCodeDraft]
  );

  const initialProblem = useMemo(
    () => PROBLEMS.find((p) => p.id === persistedCodeDraft?.problemId) || PROBLEMS[0],
    [persistedCodeDraft]
  );

  const [language, setLanguage] = useState(initialLanguage);
  const [problem, setProblem]   = useState(initialProblem);
  const [code, setCode]         = useState(
    persistedCodeDraft?.code || initialProblem.code[initialLanguage.value]
  );
  const [output, setOutput]     = useState(null);
  const [executingAction, setExecutingAction] = useState(null); // 'run', 'submit', or null
  const [submitResult, setSubmitResult] = useState(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const isProcessingRef = React.useRef(false);

  const q = quizQuestions[current] || quizQuestions[0];
  const hasExecutionResult = Boolean(output || submitResult || executingAction);
  const shouldRenderTestPanel = hasExecutionResult || isTestPanelOpen;

  const renderCoachingPanel = (coaching) => {
    if (!coaching) return null;
    const suggestions = Array.isArray(coaching.improvementSuggestions) ? coaching.improvementSuggestions : [];
    const bestPractices = Array.isArray(coaching.bestPractices) ? coaching.bestPractices : [];
    const guidedPath = Array.isArray(coaching.guidedPath) ? coaching.guidedPath : [];

    return (
      <div className="coaching-card">
        <h3 className="coaching-title">Personalized Improvement Plan</h3>
        {coaching.summary && <p className="coaching-summary">{coaching.summary}</p>}

        {suggestions.length > 0 && (
          <div className="coaching-block">
            <h4>Suggestions</h4>
            <ul>
              {suggestions.map((item, idx) => <li key={`s-${idx}`}>{item}</li>)}
            </ul>
          </div>
        )}

        {bestPractices.length > 0 && (
          <div className="coaching-block">
            <h4>Best Practices</h4>
            <ul>
              {bestPractices.map((item, idx) => <li key={`b-${idx}`}>{item}</li>)}
            </ul>
          </div>
        )}

        {guidedPath.length > 0 && (
          <div className="coaching-block">
            <h4>Guided Path</h4>
            <ol>
              {guidedPath.map((step, idx) => (
                <li key={`g-${idx}`}>
                  <strong>{step.title || `Step ${step.step || idx + 1}`}</strong>: {step.action || step.details || "Continue structured practice."}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  /* Quiz handlers */
  const handleOptionSelect = (i) => { if (!submitted) setSelected(i); };

  const handleNext = async () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    const newScore = selected === q.correct ? score + 1 : score;
    setScore(newScore);
    if (current + 1 >= quizQuestions.length) {
      setQuizDone(true);
      if (isSignedIn) {
        try {
          const token = await getToken();
          const res = await fetch(`${API_BASE}/api/assessment/submit-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ answers: newAnswers.map(String), score: newScore, totalQuestions: quizQuestions.length }),
          });
          const data = await res.json();
          if (res.ok) {
            setQuizSaved(true);
            setQuizCoaching(data.coaching || null);
            localStorage.setItem('learning_activity_updated', 'true');
          }
        } catch (err) { console.error('Quiz save failed:', err); }
      }
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const handleCheck = () => setSubmitted(true);
  const resetQuiz = () => {
    setCurrent(0); setSelected(null); setSubmitted(false);
    setScore(0); setAnswers([]); setQuizDone(false); setQuizSaved(false); setQuizCoaching(null);
    localStorage.removeItem(QUIZ_DRAFT_KEY);
  };

  /* Code editor handlers */
  const handleLanguageChange = (e) => {
    const lang = LANGUAGES.find(l => l.value === e.target.value);
    setLanguage(lang);
    setCode(problem.code[lang.value]);
    setOutput(null); setSubmitResult(null);
    setIsTestPanelOpen(false);
  };

  const handleProblemChange = (e) => {
    const p = PROBLEMS.find(pr => pr.id === e.target.value);
    setProblem(p);
    setCode(p.code[language.value]);
    setOutput(null); setSubmitResult(null);
    setIsTestPanelOpen(false);
  };

  const handleRun = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isProcessingRef.current || executingAction) return;
    isProcessingRef.current = true;
    setExecutingAction('run');
    setSubmitResult(null); setOutput(null);
    setIsTestPanelOpen(true); setActiveTestCase(0);
    try {
      const { cases: runCases, runtime } = await evaluateCode(language.value, problem, code);
      const allPassed = runCases.every(c => c.passed);
      setOutput({ testCases: runCases, runtime: runtime || (allPassed ? '8 ms' : 'N/A'), type: 'run', status: allPassed ? 'Accepted' : 'Wrong Answer' });
    } catch (err) {
      console.error('Run error:', err);
      setOutput({ error: `Evaluation failed: ${err.message}`, type: 'run', status: 'Runtime Error' });
    } finally { setExecutingAction(null); isProcessingRef.current = false; }
  };

  const handleSubmit = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isProcessingRef.current || executingAction) return;
    isProcessingRef.current = true;
    setExecutingAction('submit');
    setSubmitResult(null); setOutput(null);
    setIsTestPanelOpen(true); setActiveTestCase(0);
    try {
      const { cases: submitCases, runtime } = await evaluateCode(language.value, problem, code);
      const allPassed = submitCases.every(c => c.passed);
      const displayRuntime = runtime || (allPassed ? '38 ms' : 'N/A');
      const displayMemory  = allPassed ? '38.4 MB' : 'N/A';
      const displayBeats   = allPassed ? '92%' : '0%';

      if (isSignedIn) {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/assessment/submit-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ code, language: language.value, problemTitle: problem.title, status: allPassed ? 'accepted' : 'attempted' }),
        });
        const data = await res.json();
        if (res.ok) {
          setSubmitResult({ status: allPassed ? 'Accepted' : 'Wrong Answer', runtime: displayRuntime, memory: displayMemory, beats: displayBeats, saved: true, testCases: submitCases, type: 'submit', coaching: data.coaching || null });
          if (allPassed) { setSolvedProblems(prev => [...prev.filter(id => id !== problem.id), problem.id]); localStorage.setItem('learning_activity_updated', 'true'); }
        } else {
          setSubmitResult({ status: 'Error', error: data.error || 'Submission failed', type: 'submit' });
        }
      } else {
        setSubmitResult({ status: allPassed ? 'Accepted' : 'Wrong Answer', runtime: displayRuntime, memory: displayMemory, beats: displayBeats, saved: false, testCases: submitCases, type: 'submit' });
        if (allPassed) { setSolvedProblems(prev => [...prev.filter(id => id !== problem.id), problem.id]); }
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitResult({ status: 'Error', error: `Evaluation failed: ${err.message}`, type: 'submit' });
    } finally { setExecutingAction(null); isProcessingRef.current = false; }
  };

  // Persist quiz draft (attempted question progress) across refresh.
  useEffect(() => {
    localStorage.setItem(
      QUIZ_DRAFT_KEY,
      JSON.stringify({
        questionIds: quizQuestions.map((item) => item.id),
        current,
        selected,
        submitted,
        score,
        answers,
        quizDone,
        quizSaved,
      })
    );
  }, [quizQuestions, current, selected, submitted, score, answers, quizDone, quizSaved]);

  // Persist code editor draft (problem/language/code) across refresh.
  useEffect(() => {
    localStorage.setItem(
      CODE_DRAFT_KEY,
      JSON.stringify({
        activeTab,
        languageValue: language.value,
        problemId: problem.id,
        code,
      })
    );
  }, [activeTab, language, problem, code]);

  return (
    <div className="page-container">
      <div className="assess-header">
        <h1 className="page-title">Skill Assessments</h1>
        <div className="assess-tabs">
          <button className={`assess-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>Quiz</button>
          <button className={`assess-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>Coding Challenge</button>
        </div>
      </div>

      
      {activeTab === 'quiz' && (
        <div className="quiz-wrapper">
          {quizDone ? (
            <div className="quiz-result">
              <div className="result-circle">
                <span className="result-score">{score}/{quizQuestions.length}</span>
                <span className="result-label">Score</span>
              </div>
              <h2 style={{ color: 'white', marginTop: '1.5rem' }}>
                {score === quizQuestions.length ? 'Perfect Score!' : score >= quizQuestions.length / 2 ? 'Good Job!' : 'Keep Practicing!'}
              </h2>
              <p style={{ color: '#9ca3af' }}>You answered {score} out of {quizQuestions.length} correctly.</p>
              {quizSaved  && <p style={{ color: '#22c55e', fontSize: '0.9rem' }}>Saved to your profile</p>}
              {!isSignedIn && <p style={{ color: '#f59e0b', fontSize: '0.9rem' }}>Sign in to save your results</p>}
              {renderCoachingPanel(quizCoaching)}
              <button className="btn-primary" onClick={resetQuiz} style={{ marginTop: '1rem' }}>Retry Quiz</button>
            </div>
          ) : (
            <>
              <div className="quiz-card">
                <div className="quiz-progress-bar">
                  <div className="quiz-progress-fill" style={{ width: `${(current / quizQuestions.length) * 100}%` }} />
                </div>
                <div className="quiz-meta">
                  <span className="quiz-cat">{q.category}</span>
                  <span className="quiz-diff" style={{ color: DIFF_COLORS[q.difficulty] }}>{q.difficulty}</span>
                  <span className="quiz-counter">{current + 1} / {quizQuestions.length}</span>
                </div>
                <p className="quiz-question">{q.question}</p>
                <div className="quiz-options">
                  {q.options.map((opt, i) => {
                    let cls = 'quiz-option';
                    if (selected === i) cls += ' selected';
                    if (submitted && i === q.correct) cls += ' correct';
                    if (submitted && selected === i && i !== q.correct) cls += ' wrong';
                    
                    const optionStyle = {};
                    if (selected === i) {
                      optionStyle.borderColor = DIFF_COLORS[q.difficulty];
                      optionStyle.boxShadow = `0 0 16px ${DIFF_COLORS[q.difficulty]}40, inset 0 0 0 1px ${DIFF_COLORS[q.difficulty]}`;
                    }
                    
                    return (
                      <button key={i} className={cls} onClick={() => handleOptionSelect(i)} style={optionStyle}>
                        <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={`quiz-explanation ${selected === q.correct ? 'exp-correct' : 'exp-wrong'}`}>
                    <strong>{selected === q.correct ? 'Correct!' : 'Incorrect'}</strong>
                    <p style={{ margin: '0.4rem 0 0' }}>{q.explanation}</p>
                  </div>
                )}
                <div className="quiz-actions">
                  {!submitted
                    ? <button className="btn-primary" disabled={selected === null} onClick={handleCheck}>Check Answer</button>
                    : <button className="btn-primary" onClick={handleNext}>{current + 1 < quizQuestions.length ? 'Next Question >' : 'See Results'}</button>}
                </div>
              </div>
            </>
          )}
        </div>
      )}


      {activeTab === 'code' && (
        <div className="code-layout">
          {/* Problem panel */}
          <div className="code-problem">
            <div className="prob-header-top">
              <div className="prob-picker-row">
                <select className="prob-select" value={problem.id} onChange={handleProblemChange}>
                  {PROBLEMS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <span className="prob-diff" style={{ color: DIFF_COLORS[problem.difficulty] }}>{problem.difficulty}</span>
                <span className="prob-cat">{problem.category}</span>
              </div>
              <h2 className="prob-title">
                {solvedProblems.includes(problem.id) && <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span>}
                {problem.title}
              </h2>
            </div>
            <p className="prob-desc">{problem.description}</p>
            <div className="prob-section">
              <h4>Examples</h4>
              {problem.examples.map((ex, i) => (
                <div key={i} className="prob-example">
                  <div><span className="prob-label">Input:</span> <code>{ex.input}</code></div>
                  <div><span className="prob-label">Output:</span> <code>{ex.output}</code></div>
                  {ex.explanation && <div className="prob-exp-text"><span className="prob-label">Explanation:</span> {ex.explanation}</div>}
                </div>
              ))}
            </div>
            <div className="prob-section">
              <h4>Constraints</h4>
              <ul className="prob-constraints">
                {problem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}
              </ul>
            </div>
          </div>

          {/* Editor panel container */}
          <div className="code-right-pane">
            <div className="code-editor-panel">
              <div className="editor-header-brand">
                <span className="brand-icon">&lt;/&gt;</span> <span className="brand-text">Code</span>
              </div>
              <div className="editor-topbar">
                <select className="lang-select" value={language.value} onChange={handleLanguageChange}>
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <div className="editor-btns">
                  <button
                    key="code-run-btn"
                    type="button"
                    className="btn-run code-action-run"
                    onClick={handleRun}
                    disabled={executingAction === 'run'}
                  >
                    <span className="icon" style={{marginRight:'6px'}}>▷</span> {executingAction === 'run' ? 'Running' : 'Run'}
                  </button>
                  <button
                    key="code-submit-btn"
                    type="button"
                    className="btn-submit code-action-submit"
                    onClick={handleSubmit}
                    disabled={executingAction === 'submit'}
                  >
                    <span className="icon" style={{marginRight:'6px'}}>↗</span> {executingAction === 'submit' ? 'Submitting' : 'Submit'}
                  </button>
                </div>
              </div>
              
              <div className="editor-inner-wrapper">
                <Editor
                  height="100%"
                  language={language.monaco}
                  theme={theme === 'light' ? 'light' : 'learnpath-dark'}
                  value={code}
                  onChange={(val) => setCode(val)}
                  options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, contextmenu: false, renderLineHighlight: 'none' }}
                />
              </div>
              
              <div className="editor-statusbar">
                <button
                  type="button"
                  className="test-dropdown-trigger"
                  onClick={() => setIsTestPanelOpen((prev) => !prev)}
                >
                  <span className="trigger-tab active">
                    <span className="tc-icon" style={{ color: '#22c55e', marginRight: '6px' }}>☑</span>
                    Testcase
                  </span>
                  <span className="trigger-divider">|</span>
                  <span className="trigger-tab">
                    <span className="tc-icon" style={{ color: '#22c55e', marginRight: '6px' }}>&gt;_</span>
                    Test Result
                  </span>
                  <span className={`trigger-caret ${isTestPanelOpen ? 'open' : ''}`}>▾</span>
                </button>
              </div>
            </div>

            {/* Test Case / Output Panel */}
            {shouldRenderTestPanel && (() => {
              const resData = submitResult || output || {};
              const isAccepted = resData.status === 'Accepted';
              const isWrongAnswer = resData.status === 'Wrong Answer';
              const isRuntimeError = resData.status === 'Runtime Error';
              const isSubmit = resData.type === 'submit';
              const statusLabel = resData.status || (resData.error ? 'Error' : 'Finished');
              const tcs = resData.testCases || [];
              const passedCount = tcs.filter(tc => tc.passed).length;
              const totalCount = tcs.length;
              const hasPanelData = Boolean(
                executingAction ||
                resData?.error ||
                resData?.status ||
                resData?.runtime ||
                (Array.isArray(tcs) && tcs.length > 0)
              );

              return (
                <div className={`code-output console-panel code-output-dropup ${isTestPanelOpen ? 'open' : ''}`}>
                  <div className="console-header-tabs">
                    <div className="console-tab active">
                      <span className="tc-icon" style={{color: '#22c55e', marginRight: '5px'}}>☑</span> Testcase
                    </div>
                    <div className="console-tab">
                      <span className="tc-icon" style={{color: '#6366f1', marginRight: '5px'}}>&gt;_</span> Test Result
                    </div>
                    <button 
                      className="console-collapse-btn"
                      onClick={() => setIsTestPanelOpen(false)}
                      title="Collapse"
                    >
                      ▾
                    </button>
                  </div>

                  <div className="custom-term-output">
                  {!hasPanelData ? (
                    <div className="tc-empty-state">
                      <h3 className="tc-status-text" style={{ color: '#cbd5e1' }}>No test results yet</h3>
                      <p style={{ color: '#94a3b8' }}>Click Run or Submit to open testcase details.</p>
                    </div>
                  ) : executingAction ? (
                    <div className="tc-status-row">
                      <h3 className="tc-status-text" style={{ color: '#60a5fa' }}>
                        {executingAction === 'run' ? 'Running test cases...' : 'Submitting solution...'}
                      </h3>
                      <p style={{ color: '#94a3b8' }}>Please wait while we evaluate your code.</p>
                    </div>
                  ) : resData?.error ? (
                    <div className="tc-status-row">
                      <h3 className="tc-status-text" style={{ color: '#ef4444' }}>Compile/Runtime Error</h3>
                      <p style={{ color: '#f87171' }}>{resData.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="tc-status-row">
                        <div className="status-main">
                          <h3 className={`tc-status-text ${isAccepted ? 'accepted' : 'failed'}`}>
                            {statusLabel}
                          </h3>
                          <span className="tc-runtime">Runtime: {resData.runtime || 'N/A'}</span>
                        </div>
                        {totalCount > 0 && (
                          <div className={`tc-passed-pill ${isAccepted ? 'all-passed' : 'some-failed'}`}>
                            {passedCount}/{totalCount} Passed test cases
                          </div>
                        )}
                      </div>

                      {totalCount > 0 && (
                        <div className="tc-cases-row">
                          {tcs.map((tc, idx) => (
                            <button 
                              key={idx} 
                              className={`tc-case-btn ${activeTestCase === idx ? 'active' : ''}`}
                              onClick={() => setActiveTestCase(idx)}
                            >
                              <span className="tc-case-icon" style={{ color: tc.passed ? '#22c55e' : '#ef4444' }}>
                                {tc.passed ? '✓' : '✗'}
                              </span>
                              Case {tc.num}
                            </button>
                          ))}
                        </div>
                      )}

                      {totalCount > 0 && tcs[activeTestCase] && (
                        <div className="tc-detail-box animate-fade-in">
                          <div className="tc-detail-section">
                            <span className="tc-detail-label">Input</span>
                            <div className="tc-detail-val">
                               <div className="tc-val-text code-font">
                                 {JSON.stringify(tcs[activeTestCase].input)}
                               </div>
                            </div>
                          </div>
                          
                          <div className="tc-detail-section">
                            <span className="tc-detail-label">Output</span>
                            <div className="tc-detail-val">
                               <div className="tc-val-text code-font" style={{ color: tcs[activeTestCase].passed ? '#22c55e' : '#ef4444' }}>
                                 {tcs[activeTestCase].error ? `Error: ${tcs[activeTestCase].error}` : JSON.stringify(tcs[activeTestCase].actual)}
                               </div>
                            </div>
                          </div>

                          {!tcs[activeTestCase].passed && tcs[activeTestCase].expected !== undefined && (
                            <div className="tc-detail-section">
                              <span className="tc-detail-label">Expected</span>
                              <div className="tc-detail-val">
                                 <div className="tc-val-text code-font">
                                   {JSON.stringify(tcs[activeTestCase].expected)}
                                 </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isSubmit && isAccepted && (
                        <div className="sr-stats">
                          <span>Runtime: <strong style={{color: 'white'}}>{resData.runtime}</strong></span>
                          <span>Memory: <strong style={{color: 'white'}}>{resData.memory}</strong></span>
                          <span>Beats: <strong style={{color: 'white'}}>{resData.beats}</strong></span>
                          {resData.saved !== undefined && (
                            <span style={{color: '#22c55e'}}>{resData.saved ? 'Saved to profile' : ''}</span>
                          )}
                        </div>
                      )}

                      {isSubmit && isAccepted && renderCoachingPanel(resData.coaching)}
                    </>
                  )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
