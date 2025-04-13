// Example test file demonstrating basic Jest functionality

describe("Example Test Suite", () => {
  // Before all tests in this suite
  beforeAll(() => {
    // Setup code that runs once before all tests
    console.log("Setting up test suite");
  });

  // After all tests in this suite
  afterAll(() => {
    // Cleanup code that runs once after all tests
    console.log("Cleaning up test suite");
  });

  // Before each test
  beforeEach(() => {
    // Setup code that runs before each test
    console.log("Setting up test");
  });

  // After each test
  afterEach(() => {
    // Cleanup code that runs after each test
    console.log("Cleaning up test");
  });

  // Example test using expect
  test("basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  // Example test using async/await
  test("async operation", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  // Example test with multiple assertions
  test("multiple assertions", () => {
    const value = "hello";
    expect(value).toBeDefined();
    expect(value).toBe("hello");
    expect(value).toHaveLength(5);
  });

  // Example test with error handling
  test("error handling", () => {
    expect(() => {
      throw new Error("Test error");
    }).toThrow("Test error");
  });
});
