export default defineNuxtPlugin(() => {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.src = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js'
  script.onload = () => {
    ;(window as any).Trustpilot?.loadFromDOM?.()
  }
  const firstScript = document.getElementsByTagName('script')[0]
  if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript)
})
