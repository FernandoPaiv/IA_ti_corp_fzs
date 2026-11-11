const { EquipamentoService } = require('../dist/modules/equipamento/service/equipamento.service');

const originalApiKey = process.env.PIXABAY_API_KEY;
const originalFetch = global.fetch;
const service = new EquipamentoService({});

afterAll(() => {
  if (originalApiKey === undefined) delete process.env.PIXABAY_API_KEY;
  else process.env.PIXABAY_API_KEY = originalApiKey;
  global.fetch = originalFetch;
});

describe('Pixabay image search graceful failure', () => {
  test('returns an empty result when the API key is absent', async () => {
    delete process.env.PIXABAY_API_KEY;
    global.fetch = jest.fn();

    await expect(service.searchImages('notebook')).resolves.toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns an empty result for provider HTTP errors', async () => {
    process.env.PIXABAY_API_KEY = 'qa-only-key';
    global.fetch = jest.fn(async () => new Response('unavailable', { status: 503 }));

    await expect(service.searchImages('notebook')).resolves.toEqual([]);
  });

  test('returns an empty result for network errors and invalid JSON', async () => {
    process.env.PIXABAY_API_KEY = 'qa-only-key';
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(new Response('not json', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));

    await expect(service.searchImages('notebook')).resolves.toEqual([]);
    await expect(service.searchImages('notebook')).resolves.toEqual([]);
  });
});
