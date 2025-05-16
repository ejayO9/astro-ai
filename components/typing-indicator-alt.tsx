"use client"

export default function TypingIndicatorAlt() {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gray-500 opacity-40"
            style={{
              animation: "typingDot 1.5s infinite ease-in-out",
              animationDelay: `${i * 300}ms`,
            }}
          ></div>
        ))}
      </div>
      <span className="text-sm font-medium">Shenaya is typing...</span>
    </div>
  )
}
