const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db;

describe('Terminal Database Operations', () => {
  beforeAll(async () => {
    // Create an in-memory database for testing
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database,
    });

    // Create test tables
    await db.exec(`
      CREATE TABLE terminals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        settings TEXT
      );

      CREATE TABLE terminal_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        terminal_id INTEGER,
        command TEXT NOT NULL,
        output TEXT,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (terminal_id) REFERENCES terminals(id)
      );
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    // Clear tables before each test
    await db.exec('DELETE FROM terminal_history');
    await db.exec('DELETE FROM terminals');
  });

  test('create new terminal', async () => {
    const result = await db.run('INSERT INTO terminals (name, settings) VALUES (?, ?)', [
      'test-terminal',
      JSON.stringify({ theme: 'dark' }),
    ]);

    expect(result.lastID).toBeTruthy();

    const terminal = await db.get('SELECT * FROM terminals WHERE id = ?', result.lastID);
    expect(terminal).toBeTruthy();
    expect(terminal.name).toBe('test-terminal');
    expect(JSON.parse(terminal.settings)).toEqual({ theme: 'dark' });
  });

  test('record terminal history', async () => {
    // First create a terminal
    const terminalResult = await db.run('INSERT INTO terminals (name) VALUES (?)', [
      'history-test-terminal',
    ]);

    // Record a command
    const historyResult = await db.run(
      'INSERT INTO terminal_history (terminal_id, command, output) VALUES (?, ?, ?)',
      [terminalResult.lastID, 'ls -la', 'total 0\ndrwxr-xr-x']
    );

    expect(historyResult.lastID).toBeTruthy();

    // Verify the history record
    const history = await db.get(
      'SELECT * FROM terminal_history WHERE id = ?',
      historyResult.lastID
    );
    expect(history).toBeTruthy();
    expect(history.command).toBe('ls -la');
    expect(history.output).toBe('total 0\ndrwxr-xr-x');
  });

  test('query terminal history', async () => {
    // Create a terminal
    const terminalResult = await db.run('INSERT INTO terminals (name) VALUES (?)', [
      'query-test-terminal',
    ]);

    // Add multiple history entries
    const commands = ['ls', 'pwd', 'echo "hello"'];
    for (const cmd of commands) {
      await db.run('INSERT INTO terminal_history (terminal_id, command) VALUES (?, ?)', [
        terminalResult.lastID,
        cmd,
      ]);
    }

    // Query all history for the terminal
    const history = await db.all(
      'SELECT command FROM terminal_history WHERE terminal_id = ? ORDER BY executed_at ASC',
      terminalResult.lastID
    );

    expect(history).toHaveLength(3);
    expect(history.map(h => h.command)).toEqual(commands);
  });

  test('update terminal settings', async () => {
    // Create a terminal with initial settings
    const result = await db.run('INSERT INTO terminals (name, settings) VALUES (?, ?)', [
      'settings-test',
      JSON.stringify({ theme: 'light' }),
    ]);

    // Update settings
    const newSettings = { theme: 'dark', fontSize: 14 };
    await db.run('UPDATE terminals SET settings = ? WHERE id = ?', [
      JSON.stringify(newSettings),
      result.lastID,
    ]);

    // Verify updated settings
    const terminal = await db.get('SELECT settings FROM terminals WHERE id = ?', result.lastID);
    expect(JSON.parse(terminal.settings)).toEqual(newSettings);
  });
});
