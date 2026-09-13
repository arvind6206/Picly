import '@testing-library/jest-dom'

// Extend Jest's matchers with jest-dom
declare namespace jest {
  interface Matchers<R> {
    toBeDisabled(): R
    toBeInTheDocument(): R
    toHaveClass(...classNames: string[]): R
    toHaveAttribute(attr: string, value?: any): R
  }
}