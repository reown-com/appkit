export const HelpersUtil = {
  getTextContent(element: HTMLElement | Element) {
    return element.textContent?.trim().replace('\n', '') ?? ''
  },
  querySelect(element: HTMLElement | Element, selector: string) {
    return element.shadowRoot?.querySelector(selector) as HTMLElement
  },
  querySelectAll(element: HTMLElement | Element, selector: string) {
    return element.shadowRoot?.querySelectorAll(selector) as NodeListOf<HTMLElement>
  },
  getAllByTestId(element: HTMLElement | Element, testId: string) {
    return this.querySelectAll(element, `[data-testid="${testId}"]`)
  },
  getByTestId(element: HTMLElement | Element, testId: string) {
    return this.querySelect(element, `[data-testid="${testId}"]`)
  },
  getClasses(element: HTMLElement | Element, selector?: string) {
    if (selector) {
      const targetElement = this.querySelect(element, selector)

      return Array.from(targetElement.classList)
    }

    return Array.from(element.classList)
  }
}
