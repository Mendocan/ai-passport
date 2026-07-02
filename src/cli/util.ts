export function handleCliError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}

export async function confirm(message: string): Promise<boolean> {
  const { createInterface } = await import('node:readline/promises');
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await readline.question(`${message} [y/N] `);
    return answer.trim().toLowerCase() === 'y';
  } finally {
    readline.close();
  }
}
