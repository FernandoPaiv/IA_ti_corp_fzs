jest.mock('axios', () => ({
  get: jest.fn(),
}));

const axios = require('axios');
const { searchImages } = require('../scripts/pixabay-search');

describe('pixabay-search searchImages', () => {
  const originalApiKey = process.env.PIXABAY_API_KEY;

  beforeEach(() => {
    axios.get.mockReset();
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.PIXABAY_API_KEY;
    } else {
      process.env.PIXABAY_API_KEY = originalApiKey;
    }
  });

  test('returns an empty mock result without an API key and makes no request', async () => {
    process.env.PIXABAY_API_KEY = '';
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(searchImages('laptop')).resolves.toMatchObject({
      total: 0,
      hits: [],
      mock: true,
    });
    expect(axios.get).not.toHaveBeenCalled();

    warning.mockRestore();
  });

  test('maps Pixabay results and applies the requested search constraints', async () => {
    process.env.PIXABAY_API_KEY = 'test-key';
    const hit = {
      id: 12345,
      title: 'Test Image',
      tags: 'laptop, desk',
      previewURL: 'https://example.invalid/preview.jpg',
      webformatURL: 'https://example.invalid/web.jpg',
      largeImageURL: 'https://example.invalid/large.jpg',
      views: 150,
      downloads: 50,
      likes: 20,
      category: 'computer',
    };
    axios.get.mockResolvedValue({ data: { total: 1, hits: [hit] } });

    await expect(searchImages('laptop', { limit: 5 })).resolves.toEqual({
      total: 1,
      hits: [hit],
      mock: false,
    });
    expect(axios.get).toHaveBeenCalledWith(
      'https://pixabay.com/api/',
      {
        params: {
          key: 'test-key',
          q: 'laptop',
          per_page: 5,
          safesearch: 'true',
          min_width: 800,
          min_height: 600,
        },
      },
    );
  });

  test('returns an explicit error result when the API request fails', async () => {
    process.env.PIXABAY_API_KEY = 'test-key';
    axios.get.mockRejectedValue(new Error('API unavailable'));
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(searchImages('laptop')).resolves.toEqual({
      total: 0,
      hits: [],
      mock: false,
      error: 'API unavailable',
    });

    error.mockRestore();
  });
});
