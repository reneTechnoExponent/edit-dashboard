# Property-Based Tests for Admin Taxonomy Management

This directory contains property-based tests for the admin taxonomy and content management feature.

## Setup

Before running these tests, you need to install the required testing dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event fast-check jest-environment-jsdom @types/jest
```

## Jest Configuration

Create a `jest.config.js` file in the `edit-dashboard` directory:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

Create a `jest.setup.js` file in the `edit-dashboard` directory:

```javascript
import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
```

## Update package.json

Add the test script to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only property tests
npm test -- properties
```

## Property-Based Testing

Property-based tests use the `fast-check` library to generate random test data and verify that certain properties hold true across all valid inputs.

### Property 17: Dropdown Population Completeness

**Location:** `properties/dropdown-population.test.tsx`

**Validates:** Requirements 2.6, 4.6

**Property:** For any form with a dropdown/select field referencing another entity, the dropdown should contain all existing records of the referenced entity.

**Test Strategy:**
- Generate random arrays of ClothingMenu objects (1-50 items)
- Mock the API to return these menus
- Verify the form requests all records (limit: 1000)
- Verify no client-side filtering reduces available options
- Run 100 iterations with different random data

## Test Structure

```
__tests__/
├── README.md                           # This file
├── properties/                         # Property-based tests
│   └── dropdown-population.test.tsx    # Property 17
└── unit/                               # Unit tests (to be added)
```

## Writing New Property Tests

When adding new property tests:

1. Create a new file in the `properties/` directory
2. Include the property number and description in comments
3. Reference the requirements being validated
4. Use `fast-check` generators to create random test data
5. Run at least 100 iterations (`numRuns: 100`)
6. Test edge cases (empty arrays, boundary values)

Example:

```typescript
/**
 * Feature: admin-taxonomy-content-management
 * Property X: Property Name
 * 
 * Validates: Requirements X.Y, Z.W
 * 
 * Description of what property is being tested
 */

import * as fc from 'fast-check';

describe('Feature: admin-taxonomy-content-management, Property X: Property Name', () => {
  it('should verify the property holds', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(/* generator */),
        async (testData) => {
          // Test logic
          expect(/* assertion */).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Notes

- Property tests complement unit tests by verifying universal properties
- They help discover edge cases that might not be covered by example-based tests
- Fast-check automatically shrinks failing examples to minimal counterexamples
- All property tests should reference their design document property number
