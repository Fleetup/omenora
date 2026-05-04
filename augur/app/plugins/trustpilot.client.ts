export default defineNuxtPlugin(() => {
  const script = document.createElement('script')
  script.id   = 'trustpilot-bootstrap'
  script.type = 'text/javascript'
  script.async = true
  script.src = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js'
  script.onload = () => {
    const tp = (window as any).Trustpilot
    if (!tp?.loadFromElement) return
    document.querySelectorAll<HTMLElement>('.trustpilot-widget').forEach(el => {
      tp.loadFromElement(el, true)
    })
  }
  const firstScript = document.getElementsByTagName('script')[0]
  if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript)
})
