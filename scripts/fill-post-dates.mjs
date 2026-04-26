import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/data/blog";
const BLOG_FILE_RE = /\.(md|mdx)$/;

const now = formatShanghaiDate(new Date());
const files = await collectBlogFiles(BLOG_DIR);
const changed = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  const next = fillPubDatetime(source, now);

  if (next !== source) {
    await writeFile(file, next);
    changed.push(file);
  }
}

if (changed.length > 0) {
  console.log(`Filled pubDatetime for ${changed.length} post(s):`);
  for (const file of changed) {
    console.log(`- ${file}`);
  }
}

async function collectBlogFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectBlogFiles(path)));
      continue;
    }

    if (entry.isFile() && BLOG_FILE_RE.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

function fillPubDatetime(source, value) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return source;

  const frontmatter = match[1];
  const lines = frontmatter.split(/\r?\n/);
  const pubIndex = lines.findIndex(line => /^pubDatetime\s*:/.test(line));

  if (pubIndex >= 0) {
    const line = lines[pubIndex];
    if (!/^pubDatetime\s*:\s*(?:#.*)?$/.test(line)) {
      return source;
    }

    lines[pubIndex] = `pubDatetime: ${value}`;
    return replaceFrontmatter(source, match[0], lines);
  }

  const insertAfter = findInsertPosition(lines);
  lines.splice(insertAfter + 1, 0, `pubDatetime: ${value}`);
  return replaceFrontmatter(source, match[0], lines);
}

function replaceFrontmatter(source, originalBlock, lines) {
  const nextBlock = `---\n${lines.join("\n")}\n---`;
  return source.replace(originalBlock, nextBlock);
}

function findInsertPosition(lines) {
  const preferredFields = ["description", "title"];

  for (const field of preferredFields) {
    const index = lines.findIndex(line => new RegExp(`^${field}\\s*:`).test(line));
    if (index >= 0) return index;
  }

  return -1;
}

function formatShanghaiDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}
