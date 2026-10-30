import fs from 'node:fs';
import path from 'node:path';
import git from 'isomorphic-git';

const dir = 'C:/Users/shree/.gemini/antigravity/scratch/coldchain-monitor';

async function main() {
  console.log('Initializing Git repository in', dir);
  await git.init({ fs, dir, defaultBranch: 'main' });
  console.log('Git repo initialized!');

  // Set remote
  const remoteUrl = 'https://github.com/shreeyawattamwar-bit/Cold-chain-Integrity-Monitor.git';
  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: remoteUrl,
    force: true,
  });
  console.log('Remote "origin" added:', remoteUrl);

  // List all files to add (excluding node_modules, dist, .git)
  function getFiles(currentDir, relativeTo = dir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath, relativeTo));
      } else {
        const rel = path.relative(relativeTo, fullPath).replace(/\\/g, '/');
        files.push(rel);
      }
    }
    return files;
  }

  const filesToAdd = getFiles(dir);
  console.log(`Staging ${filesToAdd.length} files...`);
  for (const file of filesToAdd) {
    await git.add({ fs, dir, filepath: file });
  }

  console.log('Creating initial commit...');
  const sha = await git.commit({
    fs,
    dir,
    message: 'feat: Initial commit for Cold-Chain Integrity Monitor with Vercel and Firebase RTDB support',
    author: {
      name: 'shreeyawattamwar-bit',
      email: 'shreeyawattamwar@users.noreply.github.com',
    },
  });

  console.log('Commit created successfully! SHA:', sha);
}

main().catch(err => {
  console.error('Error in git-init:', err);
  process.exit(1);
});
