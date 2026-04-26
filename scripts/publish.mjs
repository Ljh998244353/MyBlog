/* eslint-disable no-console */
import { spawn } from "node:child_process";
import { cp, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const env = {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: process.env.ASTRO_TELEMETRY_DISABLED ?? "1",
};

const sourceBranch = process.env.PUBLISH_SOURCE_BRANCH ?? "main";
const publishBranch = process.env.PUBLISH_BRANCH ?? "gh-pages";
const publishRemote = process.env.PUBLISH_REMOTE ?? "origin";
const distDir = "dist";

const steps = [
  { name: "Validate content and routes", command: "npm", args: ["run", "check"] },
  { name: "Build static site", command: "npm", args: ["run", "build"] },
];

await assertSourceBranch();
await assertCleanWorktree("before building");

for (const step of steps) {
  console.log(`\n==> ${step.name}`);
  await run(step.command, step.args);
}

await assertCleanWorktree("after building");
await publishDist();

console.log(`\nPublished ${distDir}/ to ${publishRemote}/${publishBranch}.`);

async function assertSourceBranch() {
  const currentBranch = await capture("git", ["branch", "--show-current"], {
    allowFailure: true,
  });

  if (!currentBranch) {
    throw new Error("Cannot determine the current git branch. Run publish from main.");
  }

  if (currentBranch !== sourceBranch) {
    throw new Error(
      `Run npm run publish from ${sourceBranch}; current branch is ${currentBranch}.`
    );
  }
}

async function assertCleanWorktree(label) {
  const status = await capture("git", ["status", "--porcelain"]);

  if (!status) return;

  throw new Error(
    [
      `Working tree is not clean ${label}.`,
      "Commit source changes before publishing the generated site:",
      status,
    ].join("\n")
  );
}

async function publishDist() {
  const sourceCommit = await capture("git", ["rev-parse", "HEAD"]);
  const shortSourceCommit = await capture("git", [
    "rev-parse",
    "--short=12",
    "HEAD",
  ]);
  const remoteUrl = await capture("git", [
    "config",
    "--get",
    `remote.${publishRemote}.url`,
  ]);
  const userName =
    (await capture("git", ["config", "--get", "user.name"], {
      allowFailure: true,
    })) || "local-publisher";
  const userEmail =
    (await capture("git", ["config", "--get", "user.email"], {
      allowFailure: true,
    })) || "local-publisher@users.noreply.github.com";
  const publishDir = await mkdtemp(join(tmpdir(), "blog-publish-"));

  try {
    console.log(`\n==> Preparing single-commit ${publishBranch} deployment`);
    await run("git", ["init"], { cwd: publishDir, stdio: "ignore" });
    await run("git", ["remote", "add", publishRemote, remoteUrl], {
      cwd: publishDir,
    });

    const remotePublishRef = await getRemotePublishRef(publishDir);

    await run("git", ["switch", "--orphan", publishBranch], {
      cwd: publishDir,
    });

    await copyDirectoryContents(distDir, publishDir);
    await writeFile(join(publishDir, ".nojekyll"), "");

    await run("git", ["add", "-A"], { cwd: publishDir });

    const noChanges = await tryRun("git", ["diff", "--cached", "--quiet"], {
      cwd: publishDir,
      stdio: "ignore",
    });

    if (noChanges) {
      throw new Error(`No generated files found in ${distDir}/.`);
    }

    await run(
      "git",
      [
        "-c",
        `user.name=${userName}`,
        "-c",
        `user.email=${userEmail}`,
        "commit",
        "-m",
        `deploy: ${shortSourceCommit}`,
        "-m",
        `Source: ${sourceCommit}`,
      ],
      { cwd: publishDir }
    );

    console.log(`\n==> Pushing ${publishBranch}`);
    await run("git", buildPushArgs(remotePublishRef), { cwd: publishDir });
  } finally {
    await rm(publishDir, { recursive: true, force: true });
  }
}

async function copyDirectoryContents(source, target) {
  const entries = await readdir(source, { withFileTypes: true });

  await Promise.all(
    entries.map(entry =>
      cp(join(source, entry.name), join(target, entry.name), {
        recursive: true,
        dereference: true,
      })
    )
  );
}

async function getRemotePublishRef(cwd) {
  const output = await capture(
    "git",
    ["ls-remote", "--heads", publishRemote, publishBranch],
    { cwd }
  );
  const [line] = output.split(/\r?\n/).filter(Boolean);
  const [hash] = line?.trim().split(/\s+/) ?? [];

  return hash ?? "";
}

function buildPushArgs(remotePublishRef) {
  const expectedRef = remotePublishRef
    ? `refs/heads/${publishBranch}:${remotePublishRef}`
    : `refs/heads/${publishBranch}:`;

  return [
    "push",
    `--force-with-lease=${expectedRef}`,
    publishRemote,
    `HEAD:${publishBranch}`,
  ];
}

async function tryRun(command, args, options = {}) {
  try {
    await run(command, args, options);
    return true;
  } catch {
    return false;
  }
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: options.stdio ?? "inherit",
      env,
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(
          new Error(`${command} ${args.join(" ")} terminated by signal ${signal}`)
        );
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? 1}`));
    });
  });
}

function capture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(command, args, {
      cwd: options.cwd,
      env,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", chunk => {
      stdout += chunk;
    });
    child.stderr.on("data", chunk => {
      stderr += chunk;
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(
          new Error(`${command} ${args.join(" ")} terminated by signal ${signal}`)
        );
        return;
      }

      if (code === 0) {
        resolve(stdout.trim());
        return;
      }

      if (options.allowFailure) {
        resolve("");
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} exited with code ${code ?? 1}\n${stderr.trim()}`
        )
      );
    });
  });
}
