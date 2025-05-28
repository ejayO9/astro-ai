import type React from "react"
interface CodeBlockProps {
  children: React.ReactNode
  language?: string
  className?: string
}

export function CodeBlock({ children, language, className = "" }: CodeBlockProps) {
  return (
    <pre className={`p-4 rounded-md bg-gray-50 dark:bg-zinc-800 overflow-auto ${className}`}>
      <code className={language ? `language-${language}` : ""}>{children}</code>
    </pre>
  )
}
