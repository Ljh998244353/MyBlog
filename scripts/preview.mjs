import { spawn } from "node:child_process";

const env = {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: process.env.ASTRO_TELEMETRY_DISABLED ?? "1",
  SITE_BASE_PATH: "",
};

const previewArgs = process.argv.slice(2);

console.log("\n==> Building local preview without the GitHub Pages base path");
await run("npm", ["run", "build"]);

console.log("\n==> Starting preview at site root");
await run("npm", ["run", "astro", "--", "preview", ...previewArgs]);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
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
