const BILL_COUNT = 48

const bills = Array.from({ length: BILL_COUNT }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  delay: `${(i * 0.37) % 5}s`,
  duration: `${4.5 + (i % 7) * 0.65}s`,
  size: i % 3 === 0 ? "text-2xl" : i % 3 === 1 ? "text-xl" : "text-lg",
  drift: i % 2 === 0 ? "money-rain-drift-a" : "money-rain-drift-b",
  opacity: 0.55 + (i % 5) * 0.09,
}))

export function MoneyRain() {
  return (
    <div
      className="money-rain pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {bills.map((bill) => (
        <span
          key={bill.id}
          className={`money-rain-bill absolute top-0 font-black text-[#85bb65] ${bill.size} ${bill.drift}`}
          style={{
            left: bill.left,
            animationDelay: bill.delay,
            animationDuration: bill.duration,
            opacity: bill.opacity,
            textShadow:
              "0 0 8px rgba(34,197,94,0.6), 0 2px 0 #166534, 0 0 20px rgba(255,215,0,0.35)",
          }}
        >
          $
        </span>
      ))}
      {/* Larger “bills” for depth */}
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={`bill-${i}`}
          className="money-rain-bill-slow absolute top-0 rounded-sm border border-[#4ade80]/40 bg-gradient-to-br from-[#bbf7d0] to-[#22c55e] px-1.5 py-0.5 text-[10px] font-black text-[#14532d] shadow-lg"
          style={{
            left: `${(i * 23 + 11) % 95}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${6 + (i % 4)}s`,
            transform: `rotate(${-25 + (i % 5) * 12}deg)`,
          }}
        >
          $
        </span>
      ))}
    </div>
  )
}
