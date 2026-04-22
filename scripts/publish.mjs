import { spawn } from "node:child_process";

const env = {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: process.env.ASTRO_TELEMETRY_DISABLED ?? "1",
};

const steps = [
  { name: "Validate content and routes", command: "npm", args: ["run", "check"] },
  { name: "Build static site", command: "npm", args: ["run", "build"] },
];

for (const step of steps) {
  console.log(`\n==> ${step.name}`);
  await run(step.command, step.args);
}

console.log(
  "\nPublish preflight succeeded. Push to main to trigger GitHub Pages deployment."
);

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
