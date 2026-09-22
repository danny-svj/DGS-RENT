const fs = require('fs');
const path = require('path');

const TEST_DB = path.join(__dirname, 'test-data.sqlite');
process.env.DB_PATH = TEST_DB;
process.env.JWT_SECRET = 'test-secret';

beforeAll(() => {
  ['', '-wal', '-shm', '-journal'].forEach((suffix) => {
    const file = TEST_DB + suffix;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
});

afterAll(() => {
  ['', '-wal', '-shm', '-journal'].forEach((suffix) => {
    const file = TEST_DB + suffix;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
});
