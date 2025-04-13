// Mock data
const mockData = {
  user: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
  },
  items: ['item1', 'item2', 'item3'],
};

// Mock function
const mockFunction = jest.fn();

describe('Example Test Suite', () => {
  beforeAll(() => {
    console.log('Setting up test environment...');
  });

  afterAll(() => {
    console.log('Cleaning up test environment...');
  });

  beforeEach(() => {
    mockFunction.mockClear();
  });

  test('basic assertions', () => {
    expect(2 + 2).toBe(4);
    expect('hello').toBeTruthy();
    expect(null).toBeFalsy();
    expect(mockData.user).toHaveProperty('name');
    expect(mockData.items).toHaveLength(3);
  });

  test('async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  test('mock function behavior', () => {
    mockFunction('test');
    expect(mockFunction).toHaveBeenCalledWith('test');
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  test('object matching', () => {
    expect(mockData.user).toMatchObject({
      id: 1,
      name: 'Test User',
    });
  });

  test('array operations', () => {
    expect(mockData.items).toContain('item1');
    expect(mockData.items).toEqual(expect.arrayContaining(['item1', 'item2']));
  });
});
