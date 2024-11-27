export function addStyleTagRemovingAllTransitions(css: HTMLStyleElement) {
  css.appendChild(
    document.createTextNode(
      `* {
       -webkit-transition: none !important;
       -moz-transition: none !important;
       -o-transition: none !important;
       -ms-transition: none !important;
       transition: none !important;
    }`
    )
  )
  document.head.appendChild(css)
}

export function removeStyleTagRemovingAllTransitions(css: HTMLStyleElement) {
  const _ = window.getComputedStyle(css).opacity
  document.head.removeChild(css)
}
