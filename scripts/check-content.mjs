import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentPath = path.resolve(__dirname, '../src/content/content.json');

if (!fs.existsSync(contentPath)) {
  console.error(`Missing file: ${contentPath}`);
  process.exit(1);
}

const rawText = fs.readFileSync(contentPath, 'utf8');
let data;
try {
  data = JSON.parse(rawText);
} catch (err) {
  console.error(`Invalid JSON in ${contentPath}: ${err.message}`);
  process.exit(1);
}

const errors = [];

function findTodos(val, currentPath = '') {
  if (typeof val === 'string') {
    if (val.includes('TODO')) {
      errors.push(`Found TODO at "${currentPath}": "${val}"`);
    }
  } else if (Array.isArray(val)) {
    val.forEach((item, index) => findTodos(item, `${currentPath}[${index}]`));
  } else if (val && typeof val === 'object') {
    Object.keys(val).forEach((key) => {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      findTodos(val[key], nextPath);
    });
  }
}

findTodos(data);

if (!Array.isArray(data.projects)) {
  errors.push('projects must be an array.');
} else {
  const seenIds = new Set();
  let goldenCount = 0;

  data.projects.forEach((proj, idx) => {
    const id = proj.id;
    if (!id) {
      errors.push(`projects[${idx}] has no id.`);
    } else if (seenIds.has(id)) {
      errors.push(`Duplicate project id: "${id}".`);
    } else {
      seenIds.add(id);
    }

    if (!proj.what || typeof proj.what !== 'string' || proj.what.trim().length === 0) {
      errors.push(`Project "${id || idx}" has an empty "what" field.`);
    }

    if (!proj.wrong || typeof proj.wrong !== 'string' || proj.wrong.trim().length === 0) {
      errors.push(`Project "${id || idx}" has an empty "wrong" field.`);
    }

    if (proj.golden === true) {
      goldenCount += 1;
    }
  });

  if (goldenCount !== 1) {
    errors.push(`Expected exactly 1 golden project, found ${goldenCount}.`);
  }

  const unlockAfter = data.ticket?.unlockAfter ?? 0;
  if (data.projects.length < unlockAfter + 1) {
    errors.push(
      `Fewer than ticket.unlockAfter + 1 projects exist: found ${data.projects.length}, needed at least ${unlockAfter + 1}.`
    );
  }
}

if (errors.length > 0) {
  console.error(`Content check failed with ${errors.length} issue(s):`);
  errors.forEach((err) => console.error(` - ${err}`));
  process.exit(1);
}

console.log('Content check passed.');
process.exit(0);

