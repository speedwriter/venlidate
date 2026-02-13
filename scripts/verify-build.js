
try {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { execSync } = require('child_process');
    console.log('Running build...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build successful!');
} catch {
    console.error('Build failed!');
    process.exit(1);
}
