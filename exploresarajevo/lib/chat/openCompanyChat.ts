/** Dispatched by CTAs; `CompanyChat` listens and opens the panel. */
export const SARAYA_OPEN_COMPANY_CHAT = 'saraya:open-company-chat'

export function dispatchOpenCompanyChat(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SARAYA_OPEN_COMPANY_CHAT))
}
