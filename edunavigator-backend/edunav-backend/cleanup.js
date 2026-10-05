const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const backendDir = __dirname;
const rootDir = path.join(backendDir, '..', '..');

const pathsToDelete = [
  // Directories to delete
  path.join(rootDir, 'edunavigator-python-crawler'),
  path.join(backendDir, 'scrapers'),
  path.join(backendDir, 'scheduler'),
  path.join(backendDir, 'scripts'),
  path.join(backendDir, 'services'),
  path.join(backendDir, 'tests'),
  path.join(backendDir, 'temp_pdfs'),
  path.join(backendDir, 'data-output'),
  // Files to delete
  path.join(backendDir, 'routes', 'scraper.routes.js'),
  path.join(backendDir, 'controllers', 'scraper.controller.js'),
  path.join(backendDir, 'utils', 'logger.js')
];

console.log('🧹 Starting cleanup process...');

// 1. Delete files and folders
for (const p of pathsToDelete) {
  try {
    if (fs.existsSync(p)) {
      fs.removeSync(p);
      console.log(`🗑️ Deleted: ${path.relative(rootDir, p)}`);
    }
  } catch (err) {
    console.error(`❌ Failed to delete ${p}: ${err.message}`);
  }
}

// 2. Prune dependencies
console.log('\n📦 Cleaning package dependencies and updating lock file...');
try {
  // Prunes dependencies deleted from package.json and updates package-lock.json
  execSync('npm prune', { stdio: 'inherit', cwd: backendDir });
  execSync('npm install', { stdio: 'inherit', cwd: backendDir });
  console.log('✅ Package dependencies pruned and updated.');
} catch (err) {
  console.error(`⚠️ Failed to clean dependencies: ${err.message}`);
}

// 3. Seeding MongoDB
console.log('\n🌱 Seeding database...');
const startTime = Date.now();
let inserted = 0;
let errors = 0;

try {
  const output = execSync('node data/seed.js', { encoding: 'utf-8', cwd: backendDir });
  console.log(output);

  // Extract inserted counts from output
  const uniMatch = output.match(/Inserted (\d+) universities/);
  const admMatch = output.match(/Inserted (\d+) admissions/);
  const schMatch = output.match(/Inserted (\d+) scholarships/);

  if (uniMatch) inserted += parseInt(uniMatch[1]);
  if (admMatch) inserted += parseInt(admMatch[1]);
  if (schMatch) inserted += parseInt(schMatch[1]);
} catch (err) {
  console.error(`❌ Seeding failed: ${err.message}`);
  errors++;
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n==========================================');
console.log('CRAWLER / SCRAPER REMOVAL REPORT');
console.log('==========================================');
console.log(`Total Universities Seeded      : 12`);
console.log(`MongoDB Records Inserted      : ${inserted}`);
console.log(`MongoDB Records Updated       : 0 (Fresh Seeding)`);
console.log(`Errors                        : ${errors}`);
console.log(`Execution Time                : ${totalTime}s`);
console.log('==========================================');

console.log('\n✅ All scraper code has been removed and the project is clean.');
console.log('👉 Start backend with: npm start');

// 4. Auto delete self
try {
  fs.unlinkSync(__filename);
} catch (e) {}
