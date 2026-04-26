import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, sep } from "node:path";
import kebabcase from "lodash.kebabcase";

const BLOG_DIR = "src/data/blog";
const GALLERY_DIR = "public/covers/gallery";
const ASSIGNMENTS_FILE = "src/data/cover-assignments.json";
const BLOG_FILE_RE = /\.(md|mdx)$/;
const IMAGE_FILE_RE = /\.(avif|webp|jpe?g|png)$/i;
const DEFAULT_DATA = {
  mode: "sequence",
  assignments: {},
};

await mkdir(GALLERY_DIR, { recursive: true });
await mkdir(dirname(ASSIGNMENTS_FILE), { recursive: true });

const [posts, galleryImages, data] = await Promise.all([
  collectBlogFiles(BLOG_DIR),
  collectGalleryImages(GALLERY_DIR),
  readAssignments(),
]);

const postKeys = new Set(posts.map(post => post.key));
const imageSet = new Set(galleryImages);
const nextData = {
  mode: data.mode === "random" ? "random" : "sequence",
  assignments: {},
};

for (const [key, cover] of Object.entries(data.assignments || {}).sort()) {
  if (postKeys.has(key) && imageSet.has(cover)) {
    nextData.assignments[key] = cover;
  }
}

if (galleryImages.length > 0) {
  for (const post of posts) {
    if (post.manualImage) continue;
    if (nextData.assignments[post.key]) continue;

    nextData.assignments[post.key] =
      nextData.mode === "random"
        ? pickRandom(galleryImages)
        : pickSequence(galleryImages, Object.keys(nextData.assignments).length);
  }
}

const before = JSON.stringify(data, null, 2);
const after = `${JSON.stringify(nextData, null, 2)}\n`;

if (`${before}\n` !== after) {
  await writeFile(ASSIGNMENTS_FILE, after);

  const assignedCount = Object.keys(nextData.assignments).length;
  if (galleryImages.length === 0) {
    console.log(`No cover images found in ${GALLERY_DIR}; assignments left empty.`);
  } else {
    console.log(`Synced ${assignedCount} automatic cover assignment(s).`);
  }
}

async function collectBlogFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith("_")) continue;

    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectBlogFiles(path)));
      continue;
    }

    if (!entry.isFile() || !BLOG_FILE_RE.test(entry.name)) continue;

    const source = await readFile(path, "utf8");
    files.push({
      key: getPostKey(path),
      manualImage: hasManualImage(source),
    });
  }

  return files.sort((a, b) => a.key.localeCompare(b.key));
}

async function collectGalleryImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectGalleryImages(path)));
      continue;
    }

    if (entry.isFile() && IMAGE_FILE_RE.test(entry.name)) {
      files.push(`/${path.replace(/^public\//, "").split(sep).join("/")}`);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

async function readAssignments() {
  try {
    const source = await readFile(ASSIGNMENTS_FILE, "utf8");
    const parsed = JSON.parse(source);
    return {
      mode: parsed.mode || DEFAULT_DATA.mode,
      assignments: parsed.assignments || {},
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function getPostKey(file) {
  const segments = relative(BLOG_DIR, file)
    .slice(0, -extname(file).length)
    .split(sep)
    .filter(Boolean);
  const fileName = segments.pop();
  const dirs = segments.map(segment => kebabcase(segment));

  if (!fileName) return dirs.join("/");

  return [...dirs, slugFileName(fileName)].join("/");
}

function slugFileName(fileName) {
  return fileName
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function hasManualImage(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return false;

  const imageLine = match[1]
    .split(/\r?\n/)
    .find(line => /^image\s*:/.test(line));

  if (!imageLine) return false;

  const value = imageLine.replace(/^image\s*:\s*/, "").trim();
  return value !== "" && value !== '""' && value !== "''" && !value.startsWith("#");
}

function pickSequence(images, index) {
  return images[index % images.length];
}

function pickRandom(images) {
  return images[Math.floor(Math.random() * images.length)];
}
