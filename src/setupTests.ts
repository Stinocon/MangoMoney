// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 100000000,
      jsHeapSizeLimit: 2000000000
    }
  }
});

// Mock FileReader for CSV import
Object.defineProperty(window, 'FileReader', {
  value: jest.fn(() => ({
    readAsText: jest.fn(function(blob) {
      // Simulate async reading
      setTimeout(() => {
        if (this.onload) {
          this.onload({ target: { result: 'mock csv data' } });
        }
      }, 0);
    }),
    onload: null,
    onerror: null
  }))
});

// Mock URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  value: jest.fn(() => 'mock-url'),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: jest.fn(),
});

// Custom matchers for financial calculations
expect.extend({
  toBeCloseToPercentage(received: number, expected: number, precision = 2) {
    const pass = Math.abs(received - expected) < Math.pow(10, -precision);
    return {
      message: () => `expected ${received}% to be close to ${expected}%`,
      pass
    };
  },

  toBeValidCurrency(received: number) {
    const pass = typeof received === 'number' && 
                 isFinite(received) && 
                 !isNaN(received) &&
                 received >= -1e12 && 
                 received <= 1e12;
    return {
      message: () => `expected ${received} to be a valid currency amount`,
      pass
    };
  },

  toBeValidCAGR(received: number) {
    const pass = typeof received === 'number' && 
                 isFinite(received) && 
                 !isNaN(received) &&
                 received >= -100 && 
                 received <= 1000;
    return {
      message: () => `expected ${received}% to be a valid CAGR`,
      pass
    };
  }
});

// Global test utilities
global.TestDataGenerator = {
  generateAsset: (overrides = {}) => ({
    id: Math.random(),
    name: 'Test Asset',
    amount: 10000,
    quantity: 100,
    currentPrice: 100,
    avgPrice: 90,
    date: '2023-01-01',
    ...overrides
  }),

  generatePortfolio: (size = 10) => ({
    investments: Array(size).fill(0).map((_, i) => 
      global.TestDataGenerator.generateAsset({ id: i, name: `Asset ${i}` })
    ),
    cash: [{ id: 1, amount: 50000, accountType: 'current' }],
    realEstate: [],
    debts: []
  }),

  generateTransactions: (assetId: number, count = 5) => 
    Array(count).fill(0).map((_, i) => ({
      id: i,
      linkedToAsset: assetId,
      date: `2023-0${Math.min(i + 1, 9)}-01`,
      quantity: 10,
      amount: 1000 + (i * 100),
      transactionType: i % 2 === 0 ? 'purchase' : 'sale'
    }))
};
