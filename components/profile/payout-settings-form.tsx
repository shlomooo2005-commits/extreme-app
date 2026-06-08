"use client"

import { useEffect, useState } from "react"
import { Banknote, Lock, Save } from "lucide-react"
import type { PayoutMethod, PayoutSettings, UserAccount } from "@/lib/user-account"
import { BilingualLabel } from "./bilingual-label"

interface PayoutSettingsFormProps {
  account: UserAccount
  onSave: (payout: PayoutSettings) => void
}

export function PayoutSettingsForm({ account, onSave }: PayoutSettingsFormProps) {
  const existing = account.payout
  const [method, setMethod] = useState<PayoutMethod>(existing?.method ?? "bank")
  const [bankAccountHolder, setBankAccountHolder] = useState(
    existing?.bankAccountHolder ?? account.fullName
  )
  const [bankName, setBankName] = useState(existing?.bankName ?? "")
  const [bankAccountNumber, setBankAccountNumber] = useState(
    existing?.bankAccountNumber ?? ""
  )
  const [bankRoutingOrIban, setBankRoutingOrIban] = useState(
    existing?.bankRoutingOrIban ?? ""
  )
  const [paypalEmail, setPaypalEmail] = useState(existing?.paypalEmail ?? "")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(false)
  }, [method, bankAccountHolder, bankName, bankAccountNumber, bankRoutingOrIban, paypalEmail])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payout: PayoutSettings = {
      method,
      updatedAt: new Date().toISOString(),
      ...(method === "bank"
        ? {
            bankAccountHolder: bankAccountHolder.trim(),
            bankName: bankName.trim(),
            bankAccountNumber: bankAccountNumber.trim(),
            bankRoutingOrIban: bankRoutingOrIban.trim(),
          }
        : { paypalEmail: paypalEmail.trim() }),
    }
    onSave(payout)
    setSaved(true)
  }

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
          <Banknote className="h-5 w-5 text-[#4ade80]" />
        </div>
        <div>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-foreground/45">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Stored securely on this device until HobbyX connects encrypted
            server-side payouts. Never shared publicly.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <BilingualLabel en="Payout method" he="אמצעי תשלום" />
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "bank" as const, en: "Bank account", he: "חשבון בנק" },
                { id: "paypal" as const, en: "PayPal", he: "פייפאל" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMethod(opt.id)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${
                  method === opt.id
                    ? "border-[#22c55e] bg-[#22c55e]/20 text-[#bbf7d0]"
                    : "border-border bg-background/50 text-muted-foreground hover:border-white/30"
                }`}
              >
                {opt.en} / <span dir="rtl">{opt.he}</span>
              </button>
            ))}
          </div>
        </div>

        {method === "bank" ? (
          <>
            <div>
              <BilingualLabel
                en="Account holder name"
                he="שם בעל החשבון"
                htmlFor="holder"
              />
              <input
                id="holder"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 focus:border-[#22c55e] focus:outline-none"
              />
            </div>
            <div>
              <BilingualLabel en="Bank name" he="שם הבנק" htmlFor="bankName" />
              <input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 focus:border-[#22c55e] focus:outline-none"
              />
            </div>
            <div>
              <BilingualLabel
                en="Account number"
                he="מספר חשבון"
                htmlFor="accountNum"
              />
              <input
                id="accountNum"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                autoComplete="off"
                className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 font-mono focus:border-[#22c55e] focus:outline-none"
              />
            </div>
            <div>
              <BilingualLabel
                en="Routing / IBAN"
                he="סניף / IBAN"
                htmlFor="routing"
              />
              <input
                id="routing"
                value={bankRoutingOrIban}
                onChange={(e) => setBankRoutingOrIban(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 font-mono focus:border-[#22c55e] focus:outline-none"
              />
            </div>
          </>
        ) : (
          <div>
            <BilingualLabel en="PayPal email" he="אימייל PayPal" htmlFor="paypal" />
            <input
              id="paypal"
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@email.com"
              className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 focus:border-[#22c55e] focus:outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-white/25 hover:bg-white/5"
        >
          <Save className="h-4 w-4" />
          Save payout details
        </button>

        {saved && (
          <p className="text-center text-sm font-medium text-[#4ade80]">
            Payout settings saved / נשמר בהצלחה
          </p>
        )}
      </form>
    </section>
  )
}
