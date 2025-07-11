export class HelpersUtil {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static getByTestId(element: any, testId: string): HTMLElement | null {
    return element.shadowRoot?.querySelector(`[data-testid="${testId}"]`) || null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static queryByTestId(element: any, testId: string): HTMLElement | null {
    return element.shadowRoot?.querySelector(`[data-testid="${testId}"]`) || null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static getAllByTestId(element: any, testId: string): HTMLElement[] {
    return Array.from(element.shadowRoot?.querySelectorAll(`[data-testid="${testId}"]`) || [])
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static querySelector(element: any, selector: string): HTMLElement | null {
    return element.shadowRoot?.querySelector(selector) || null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static querySelectorAll(element: any, selector: string): HTMLElement[] {
    return Array.from(element.shadowRoot?.querySelectorAll(selector) || [])
  }
}
