export const HelpersUtil = {
  querySelect(element: HTMLElement | Element, selector: string) {
    return element.shadowRoot?.querySelector(selector) as HTMLElement
  },
  getByTestId(element: HTMLElement | Element, testId: string) {
    return this.querySelect(element, `[data-testid="${testId}"]`)
  },
  sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }
}
