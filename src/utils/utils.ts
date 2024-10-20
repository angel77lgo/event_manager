export async function processInBatches<T, R>(
  array: T[],
  func: (item: T) => Promise<R>,
  batchSize = 10,
) {
  const results: R[] = [];

  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(func));
    results.push(...batchResults);
  }

  return results;
}
