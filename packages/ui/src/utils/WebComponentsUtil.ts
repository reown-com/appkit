/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

// -- Types ------------------------------------------------------------- //
type Constructor<T> = new (...args: any[]) => T

interface ClassDescriptor {
  kind: 'class'
  elements: ClassElement[]
  finisher?: <T>(clazz: Constructor<T>) => undefined | Constructor<T>
}

interface ClassElement {
  kind: 'field' | 'method'
  key: PropertyKey
  placement: 'static' | 'prototype' | 'own'
  initializer?: Function
  extras?: ClassElement[]
  finisher?: <T>(clazz: Constructor<T>) => undefined | Constructor<T>
  descriptor?: PropertyDescriptor
}

// -- Utility ------------------------------------------------------------- //
function standardCustomElement(tagName: string, descriptor: ClassDescriptor) {
  const { kind, elements } = descriptor

  return {
    kind,
    elements,
    finisher(clazz: Constructor<HTMLElement>) {
      if (!customElements.get(tagName)) {
        customElements.define(tagName, clazz)
      }
    }
  }
}

function legacyCustomElement(tagName: string, clazz: Constructor<HTMLElement>) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, clazz)
  }

  return clazz as any
}

export function customElement(tagName: string) {
  return function create(classOrDescriptor: Constructor<HTMLElement> | ClassDescriptor) {
    return typeof classOrDescriptor === 'function'
      ? legacyCustomElement(tagName, classOrDescriptor)
      : standardCustomElement(tagName, classOrDescriptor)
  }
}
