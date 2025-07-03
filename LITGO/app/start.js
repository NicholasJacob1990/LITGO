#!/usr/bin/env node

// Script para contornar problema do Expo CLI
const currentDir = process.cwd();

process.chdir(currentDir);
process.env.PWD = currentDir;

const { spawn } = require('child_process');

const expo = spawn('npx', ['@expo/cli', 'start', '--clear'], {
  stdio: 'inherit',
  cwd: currentDir
});

expo.on('error', (err) => {
  console.error('Erro ao iniciar Expo:', err);
});
