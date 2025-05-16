export default function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20">
      <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-purple-200 flex items-center justify-center">
          <span className="text-purple-600 text-2xl">🔮</span>
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold">Welcome to Shenaya's Tarot Reading</h2>
        <p className="text-gray-600">
          I'm Shenaya, your trendsetting tarot reader. Ask me for a reading or chat about your future!
        </p>
      </div>
    </div>
  )
}
