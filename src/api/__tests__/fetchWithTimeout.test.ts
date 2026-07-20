import { fetchWithTimeout } from '../fetchWithTimeout';

describe('fetchWithTimeout', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = originalFetch;
  });

  it('resolves with the response when fetch completes before the timeout', async () => {
    const response = new Response('{}', { status: 200 });
    global.fetch = jest.fn().mockResolvedValue(response);

    await expect(fetchWithTimeout('https://example.com', {}, 10_000)).resolves.toBe(response);
  });

  it('aborts and throws a timeout error when fetch hangs past the timeout', async () => {
    global.fetch = jest.fn().mockImplementation(
      (_url, { signal }: RequestInit) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );

    const promise = fetchWithTimeout('https://example.com', {}, 10_000);
    const expectation = expect(promise).rejects.toThrow('Request timed out after 10000ms');

    await jest.advanceTimersByTimeAsync(10_000);

    await expectation;
  });

  it('propagates non-abort errors unchanged', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));

    await expect(fetchWithTimeout('https://example.com', {}, 10_000)).rejects.toThrow(
      'Network down',
    );
  });
});
