import { useState } from 'react'

const levels = [
  { count: 1, emoji: '🍎', options: [1, 2, 3] },
  { count: 2, emoji: '🐱', options: [1, 2, 3] },
  { count: 3, emoji: '⭐', options: [2, 3, 4] },
  { count: 4, emoji: '🌸', options: [3, 4, 5] },
  { count: 5, emoji: '🐶', options: [4, 5, 6] },
]

export function CountingGame() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const level = levels[currentLevel]

  const handleAnswer = (answer: number) => {
    if (answer === level.count) {
      setFeedback('correct')
      setTimeout(() => {
        setFeedback(null)
        if (currentLevel < levels.length - 1) {
          setCurrentLevel((prev) => prev + 1)
        } else {
          setCurrentLevel(0)
        }
      }, 1500)
    } else {
      setFeedback('wrong')
      setTimeout(() => setFeedback(null), 1000)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold text-kids-text">🔢 数量配对</h1>

      <p className="text-xl text-kids-text-secondary">数一数，有几个？</p>

      <div className="flex flex-wrap justify-center gap-4 text-6xl p-8 bg-kids-card-lemon rounded-2xl shadow-lg min-h-32">
        {Array.from({ length: level.count }).map((_, i) => (
          <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
            {level.emoji}
          </span>
        ))}
      </div>

      <div className="flex gap-4">
        {level.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={feedback !== null}
            className="w-20 h-20 text-3xl font-bold bg-kids-card-mint rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-kids-mint hover:border-kids-mint-deep text-kids-text"
          >
            {option}
          </button>
        ))}
      </div>

      {feedback === 'correct' && (
        <div className="text-4xl animate-bounce bg-kids-success-bg text-kids-success px-6 py-3 rounded-full">
          🎉 太棒了！
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="text-4xl animate-pulse bg-kids-error-bg text-kids-error px-6 py-3 rounded-full">
          🤔 再试试！
        </div>
      )}

      <div className="text-kids-text-muted">
        关卡 {currentLevel + 1} / {levels.length}
      </div>
    </div>
  )
}
