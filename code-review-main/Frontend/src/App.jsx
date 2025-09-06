import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios'
import { FiPlay, FiCopy, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './App.css'

function App() {
  // UI state: editable code input and AI review output
  const [ code, setCode ] = useState(`function sum(a, b) {\n  return a + b\n}`)
  const [ review, setReview ] = useState('')
  const [ language, setLanguage ] = useState('javascript')
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState('')
  // Removed dark mode toggle for simplicity

  // Simple examples to help users get started quickly
  const examples = [
    {
      label: 'JS: Sum function',
      value: `function sum(a, b) {\n  return a + b\n}`,
    },
    {
      label: 'JS: Factorial (loop)',
      value: `function factorial(n) {\n  if (n < 0) return 0\n  let res = 1\n  for (let i = 2; i <= n; i++) res *= i\n  return res\n}`,
    },
    {
      label: 'JS: Debounce helper',
      value: `function debounce(fn, delay) {\n  let timer\n  return (...args) => {\n    clearTimeout(timer)\n    timer = setTimeout(() => fn(...args), delay)\n  }\n}`,
    },
    {
      label: 'C++: Vector sum',
      value: `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  vector<int> a = {1,2,3};\n  int s = accumulate(a.begin(), a.end(), 0);\n  cout << s;\n}`,
    },
    {
      label: 'Java: Hello',
      value: `public class Main {\n  public static void main(String[] args){\n    System.out.println("Hello");\n  }\n}`,
    },
  ]

  useEffect(() => {
    prism.highlightAll()
  }, [])

  // Dark mode removed


  // Calls backend API to review the code
  async function reviewCode() {
    try {
      setIsLoading(true)
      setError('')
      const response = await axios.post('http://localhost:3000/ai/get-review', { code, language })
      setReview(response.data)
    } catch (e) {
      setError('Failed to fetch review. Is the backend running on http://localhost:3000?')
    } finally {
      setIsLoading(false)
    }
  }

  function loadExample(value) {
    setCode(value)
    setReview('')
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (_) {
      // no-op: clipboard may be blocked by browser permissions
      toast.error('Copy failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-gray-100 font-['Inter']">
      {/* Header explains the app purpose at a glance */}
      <header className="border-b bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700 text-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI Code Reviewer</h1>
            <p className="text-xs/6 opacity-90">Type code on the left, get a review on the right.</p>
          </div>
          <span />
        </div>
      </header>

      {/* Two-column layout: Editor and Review panel */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-2 h-[calc(100vh-96px)] overflow-hidden">
        {/* Header row spanning both columns for perfect alignment */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-gray-300">Your Code</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Language"
              className="rounded-md border border-slate-700 bg-slate-800 text-gray-100 px-2 py-1 text-sm shadow-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="markup">HTML</option>
            </select>
            <select
              aria-label="Examples"
              className="rounded-md border border-slate-700 bg-slate-800 text-gray-100 px-2 py-1 text-sm shadow-sm"
              onChange={(e) => loadExample(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Load example…</option>
              {examples.map(ex => (
                <option key={ex.label} value={ex.value}>{ex.label}</option>
              ))}
            </select>
            <button
              onClick={() => copyToClipboard(code)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-gray-100 shadow-sm hover:bg-slate-700"
              title="Copy code"
            ><FiCopy /> Copy</button>
            <button
              onClick={() => { setCode(''); setReview(''); toast('Cleared'); }}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-gray-100 shadow-sm hover:bg-slate-700"
              title="Clear"
            ><FiTrash2 /> Clear</button>
            <button
              onClick={reviewCode}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
              disabled={isLoading}
              title="Send to reviewer"
            >
              <FiPlay />
              {isLoading ? 'Reviewing…' : 'Review'}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-gray-300">AI Review</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(review)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-gray-100 shadow-sm hover:bg-slate-700"
              title="Copy review"
              disabled={!review}
            ><FiCopy /> Copy</button>
          </div>
        </div>

        <section className="flex flex-col gap-3 overflow-auto">
          <div className="rounded-md border border-slate-700 bg-slate-900 p-2 shadow-sm">
            <Editor
              value={code}
              onValueChange={value => setCode(value)}
              highlight={value => prism.highlight(value, prism.languages[language] || prism.languages.javascript, language)}
              padding={12}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: '420px'
              }}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 overflow-auto">
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="rounded-md border border-slate-700 bg-slate-900 p-4 shadow-sm text-sm leading-6 min-h-[420px] max-h-[calc(100vh-220px)] overflow-auto break-words">
            {isLoading && !review ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-1/3 rounded bg-slate-700" />
                <div className="h-3 w-5/6 rounded bg-slate-700" />
                <div className="h-3 w-4/6 rounded bg-slate-700" />
                <div className="h-3 w-2/3 rounded bg-slate-700" />
                <div className="h-3 w-1/2 rounded bg-slate-700" />
              </div>
            ) : (
              <>
                <div className="mb-3 text-xs text-gray-400">Model feedback</div>
                <div className="break-words">
                  <Markdown rehypePlugins={[ rehypeHighlight ]}>{review || 'The review will appear here.'}</Markdown>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}



export default App
