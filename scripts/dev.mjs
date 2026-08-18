import { spawn } from 'node:child_process';

const processes = [
  spawn('mdbook', [
    'serve',
    '--watcher',
    'native',
    '--hostname',
    '127.0.0.1',
    '--port',
    '3000',
  ], { stdio: 'inherit' }),
  spawn('./node_modules/.bin/vite', ['--host', '0.0.0.0'], { stdio: 'inherit' }),
];

let stopping = false;

function stop(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (!child.killed) child.kill(signal);
  }
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => stop(signal));
}

for (const child of processes) {
  child.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
    stop();
  });
  child.on('exit', (code, signal) => {
    if (!stopping && code !== 0) {
      process.exitCode = code ?? 1;
      stop(signal || 'SIGTERM');
    }
  });
}