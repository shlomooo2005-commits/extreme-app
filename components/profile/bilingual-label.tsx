interface BilingualLabelProps {
  en: string
  he: string
  required?: boolean
  htmlFor?: string
}

export function BilingualLabel({ en, he, required, htmlFor }: BilingualLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="hobbyx-setting-label mb-2 block"
    >
      <span>{en}</span>
      <span className="mx-1.5 text-slate-500">/</span>
      <span dir="rtl" className="inline-block font-bold text-slate-700">
        {he}
      </span>
      {required && <span className="ml-1 text-[#f87171]">*</span>}
    </label>
  )
}
