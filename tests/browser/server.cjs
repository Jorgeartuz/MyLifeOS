// Build with a fake Supabase endpoint; browser tests cannot reach the real database.
process.env.VITE_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'test-public-key';
(async () => {
  const { build, preview } = await import('vite');
  await build({ build: { outDir: 'dist-e2e' } });
  await preview({ build: { outDir: 'dist-e2e' }, preview: { host: '127.0.0.1', port: 4175, strictPort: true } });
})().catch(error => { console.error(error); process.exitCode = 1; });
