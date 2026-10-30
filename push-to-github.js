import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'isomorphic-git/http/node';
import git from 'isomorphic-git';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function push() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (!token) {
    console.error('\n❌ GITHUB_TOKEN environment variable is missing.');
    console.log('\nTo push to GitHub, run with your GitHub Personal Access Token (PAT):');
    console.log('In PowerShell:');
    console.log('  $env:GITHUB_TOKEN="ghp_your_github_token_here"');
    console.log('  node push-to-github.js\n');
    console.log('Or create a fine-grained or classic PAT with "repo" scope at:');
    console.log('  https://github.com/settings/tokens\n');
    process.exit(1);
  }

  console.log('🚀 Pushing commits to https://github.com/shreeyawattamwar-bit/Cold-chain-Integrity-Monitor.git (branch: main)...');

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir: __dirname,
      remote: 'origin',
      ref: 'main',
      force: false,
      onAuth: () => ({
        username: token,
      }),
    });

    if (pushResult.ok) {
      console.log('\n✅ Successfully pushed to GitHub repository!');
      console.log('🔗 View on GitHub: https://github.com/shreeyawattamwar-bit/Cold-chain-Integrity-Monitor\n');
    } else {
      console.error('\n❌ Push was rejected by remote:', pushResult);
    }
  } catch (err) {
    console.error('\n❌ Error pushing to GitHub:', err.message || err);
    process.exit(1);
  }
}

push();
