import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const astroBin = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const env = {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: process.env.ASTRO_TELEMETRY_DISABLED ?? '1'
};

const steps = [
  { name: 'Validate content and routes', args: ['check'] },
  { name: 'Build static site', args: ['build'] }
];

for (const step of steps) {
  console.log(`\n==> ${step.name}`);
  await runAstro(step.args);
}

console.log('\nPublish preflight succeeded. Push to main to trigger GitHub Pages deployment.');

function runAstro(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [astroBin, ...args], {
      stdio: 'inherit',
      env
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`astro ${args.join(' ')} terminated by signal ${signal}`));
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`astro ${args.join(' ')} exited with code ${code ?? 1}`));
    });
  });
}
