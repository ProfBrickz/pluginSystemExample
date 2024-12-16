import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

const settingsPath = 'settings.json';

/**
 * Compares two version strings to determine if the first is greater than the second.
 *
 * @param {string} version1 - The first version string.
 * @param {string} version2 - The second version string.
 *
 * @returns {boolean} - Returns true if version1 is greater than version2, otherwise false.
 */
function isVersionGreater(version1, version2) {
   const v1 = version1.split('.').map(Number);
   const v2 = version2.split('.').map(Number);

   const length = Math.max(v1.length, v2.length);

   for (let i = 0; i < length; i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;

      if (num1 > num2) {
         return true;
      } else if (num1 < num2) {
         return false;
      }
   }

   return false;
}

function updateDatabaseVersion() {
   let settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

   const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

   if (isVersionGreater(packageJson.version, settings.version)) {
      settings.version = packageJson.version;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
   }
}

const databasePath = 'databases/database.db';
const databaseDir = path.dirname(databasePath);

if (!fs.existsSync(databaseDir)) {
   fs.mkdirSync(databaseDir);
}

if (!fs.existsSync(databasePath)) {
   fs.writeFileSync(databasePath, '', 'utf8');
}

if (!fs.existsSync(settingsPath)) {
   fs.writeFileSync(settingsPath, JSON.stringify({ version: '0.0' }, null, 2), 'utf8');
}

const database = new sqlite3.Database(databasePath);

database.get(
   'SELECT name FROM sqlite_master WHERE type="table" AND name="settings"',
   (error, settings) => {
      if (error) {
         console.error(error);
         return;
      }

      database.serialize(() => {
         if (!settings || !settings.name || !settings.name === 'settings') {
            database.run(
               'CREATE TABLE IF NOT EXISTS tasklists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)'
            );
            database.run(
               'CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, tasklist_id INTEGER, FOREIGN KEY(tasklist_id) REFERENCES tasklists(id))'
            );
         }

         updateDatabaseVersion();
      });
   }
);

export default database;
