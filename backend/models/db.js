const initSqlJs = require('../node_modules/sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../database/database.db');
let _db = null;

function saveDb() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function run(sql, params = []) {
  _db.run(sql, params);
  const rowRes = _db.exec('SELECT last_insert_rowid() as id');
  const lastId = rowRes?.[0]?.values?.[0]?.[0] ?? null;
  saveDb();
  return { lastInsertRowid: lastId };
}

function get(sql, params = []) {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  let row = undefined;
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    row = {};
    cols.forEach((c, i) => { row[c] = vals[i]; });
  }
  stmt.free();
  return row;
}

function all(sql, params = []) {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    const row = {};
    cols.forEach((c, i) => { row[c] = vals[i]; });
    rows.push(row);
  }
  stmt.free();
  return rows;
}

function exec(sql) {
  _db.run(sql);
  saveDb();
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(buf);
  } else {
    _db = new SQL.Database();
  }
  _db.run('PRAGMA foreign_keys = ON');
}

module.exports = { initDb, run, get, all, exec, saveDb };
