export function logTempFile(prefix: string, data: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  // Cross-platform temp directory
  let tempDir = Deno.env.get('TEMP') || Deno.env.get('TMPDIR') || Deno.env.get('TMP') || './tmp';
  // Ensure tempDir exists
  try {
    Deno.mkdirSync(tempDir, { recursive: true });
  } catch (_) {}
  const path = `${tempDir.replace(/[/\\]$/, '')}/${prefix}_${timestamp}.txt`;
  Deno.writeTextFileSync(path, data);
  return path;
}
