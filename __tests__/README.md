# Testing Guide

This directory contains test files for the Picly application.

## Test Structure

```
__tests__/
├── components/       # Component tests
│   ├── button.test.tsx
│   └── input.test.tsx
└── lib/             # Utility function tests
    └── utils.test.ts
```

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test -- button.test.tsx
```

## Test Configuration

- **Framework**: Jest
- **Testing Library**: React Testing Library
- **Environment**: jsdom (browser-like environment)
- **Configuration**: jest.config.js

## Writing Tests

### Component Tests

Component tests should:
1. Test component rendering with different props
2. Test user interactions (clicks, inputs, etc.)
3. Test conditional rendering
4. Test accessibility

Example:
```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### Utility Function Tests

Utility function tests should:
1. Test normal cases
2. Test edge cases
3. Test error handling

Example:
```ts
import { cn } from '@/lib/utils'

describe('cn function', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
```

## Best Practices

1. **Test user behavior, not implementation details**
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Keep tests simple and focused**
4. **Use descriptive test names**
5. **Mock external dependencies** (API calls, routers)
6. **Test happy paths and error cases**

## Current Test Coverage

- ✅ Button component
- ✅ Input component
- ✅ Utility functions (cn)

## Future Test Additions

- [ ] API route tests
- [ ] Authentication flow tests
- [ ] Form validation tests
- [ ] Integration tests
- [ ] E2E tests with Playwright/Cypress

## Troubleshooting

### Tests failing due to Next.js imports
Make sure jest.config.js is properly configured with next/jest.

### Mocking not working
Check jest.setup.js for proper mocking of Next.js modules.

### TypeScript errors in tests
Ensure @types/jest and @testing-library/* are installed.