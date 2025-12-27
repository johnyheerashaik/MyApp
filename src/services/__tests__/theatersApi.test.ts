describe('theatersApi', () => {
    const mockApiCall = jest.fn();
    const mockTrackOperation = jest.fn();
    const mockGetTheatersBaseUrl = jest.fn();

    const requireModule = () => {
        jest.resetModules();

        jest.doMock('../api', () => ({
            apiCall: (...args: any[]) => mockApiCall(...args),
        }));

        jest.doMock('../performance', () => ({
            trackOperation: (name: string, fn: any) => mockTrackOperation(name, fn),
        }));

        jest.doMock('../theatersBaseUrl', () => ({
            getTheatersBaseUrl: () => mockGetTheatersBaseUrl(),
        }));

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('../theatersApi') as typeof import('../theatersApi');
    };

    beforeEach(() => {
        mockApiCall.mockReset();
        mockTrackOperation.mockReset();
        mockGetTheatersBaseUrl.mockReset();

        mockTrackOperation.mockImplementation(async (_name: string, fn: any) => fn());

        mockGetTheatersBaseUrl.mockReturnValue('http://base');
    });

    describe('fetchNearbyTheaters', () => {
        it('calls correct URL (with radius) and returns [] when results missing', async () => {
            const { fetchNearbyTheaters } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: {} });

            const res = await fetchNearbyTheaters(1, 2);

            expect(mockTrackOperation).toHaveBeenCalledWith('fetchNearbyTheaters', expect.any(Function));
            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://base/theaters/nearby?latitude=1&longitude=2&radius=32186.9',
                method: 'GET',
            });
            expect(res).toEqual([]);
        });

        it('uses provided baseUrl parameter', async () => {
            const { fetchNearbyTheaters } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { results: [] } });

            await fetchNearbyTheaters(10, 20, 'http://custom');

            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://custom/theaters/nearby?latitude=10&longitude=20&radius=32186.9',
                method: 'GET',
            });
        });

        it('throws when data.error is true (prefers message, otherwise error)', async () => {
            const { fetchNearbyTheaters } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { error: true, message: 'Boom' } });
            await expect(fetchNearbyTheaters(0, 0)).rejects.toThrow('Boom');

            mockApiCall.mockResolvedValueOnce({ data: { error: 'SOME_ERR' } });
            await expect(fetchNearbyTheaters(0, 0)).rejects.toThrow('SOME_ERR');
        });

        it('maps results, filters to <= 20 miles, and sorts by distance ascending', async () => {
            const { fetchNearbyTheaters } = requireModule();

            const data = {
                results: [
                    {
                        place_id: 'C',
                        name: 'Far One',
                        vicinity: 'Far Address',
                        geometry: { location: { lat: 0.4, lng: 0 } },
                    },
                    {
                        place_id: 'B',
                        name: 'Mid One',
                        vicinity: 'Mid Address',
                        geometry: { location: { lat: 0.2, lng: 0 } },
                    },
                    {
                        place_id: 'A',
                        name: 'Near One',
                        vicinity: 'Near Address',
                        geometry: { location: { lat: 0.1, lng: 0 } },
                    },
                ],
            };

            mockApiCall.mockResolvedValueOnce({ data });

            const res = await fetchNearbyTheaters(0, 0);

            expect(res).toHaveLength(2);
            expect(res[0].id).toBe('A');
            expect(res[1].id).toBe('B');

            expect(res[0]).toEqual(
                expect.objectContaining({
                    id: 'A',
                    name: 'Near One',
                    address: 'Near Address',
                    latitude: 0.1,
                    longitude: 0,
                    distance: expect.any(Number),
                }),
            );

            expect(res[0].distance).toBeLessThanOrEqual(res[1].distance);
            expect(res[1].distance).toBeLessThanOrEqual(20);
        });
    });

    describe('geocodeZipCode', () => {
        it('calls correct URL and returns location on success', async () => {
            const { geocodeZipCode } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { location: { lat: 33.1, lng: -96.8 } } });

            const res = await geocodeZipCode('75075');

            expect(mockTrackOperation).toHaveBeenCalledWith('geocodeZipCode', expect.any(Function));
            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://base/geocode/zipcode?zip=75075',
                method: 'GET',
            });
            expect(res).toEqual({ lat: 33.1, lng: -96.8 });
        });

        it('uses provided baseUrl parameter', async () => {
            const { geocodeZipCode } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { location: { lat: 1, lng: 2 } } });

            await geocodeZipCode('99999', 'http://custom');

            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://custom/geocode/zipcode?zip=99999',
                method: 'GET',
            });
        });

        it('throws when data.error exists', async () => {
            const { geocodeZipCode } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { error: 'Invalid zip' } });

            await expect(geocodeZipCode('bad')).rejects.toThrow('Invalid zip');
        });
    });
});
