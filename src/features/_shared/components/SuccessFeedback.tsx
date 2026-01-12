interface SuccessFeedbackProps {
  message?: string
}

export function SuccessFeedback({ message = '太棒了！' }: SuccessFeedbackProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="text-center animate-bounce">
        <div className="text-8xl mb-4">🎉</div>
        <div className="text-3xl font-bold text-white drop-shadow-lg">{message}</div>
      </div>
    </div>
  )
}
