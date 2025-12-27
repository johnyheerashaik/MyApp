import { askAi } from '../aiApi';

describe('askAi', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    const flushMicrotasks = async () => {
        await Promise.resolve();
        await Promise.resolve();
    };

    it('returns helper text when prompt is empty or whitespace', async () => {
        const promise = askAi('   ', 'Johny');

        jest.advanceTimersByTime(500);
        await flushMicrotasks();

        await expect(promise).resolves.toBe(
            'Ask me anything about movies, your favourites, or what to watch next!',
        );
    });

    it('returns demo response with provided userName', async () => {
        const promise = askAi('Recommend something like Inception', 'Johny');

        jest.advanceTimersByTime(500);
        await flushMicrotasks();

        await expect(promise).resolves.toBe(
            `Hey Johny 👋\n\nYou asked:\n"Recommend something like Inception"\n\nRight now I'm a demo AI living inside your app. Here you could connect me to a real AI API (like OpenAI) and return smart answers about movies, recommendations, or anything else you want.`,
        );
    });

    it('falls back to "there" when userName is null or undefined', async () => {
        const promise1 = askAi('Hello', null);
        const promise2 = askAi('Hello');

        jest.advanceTimersByTime(500);
        await flushMicrotasks();

        await expect(promise1).resolves.toContain('Hey there 👋');
        await expect(promise2).resolves.toContain('Hey there 👋');
    });

    it('trims the prompt before returning response', async () => {
        const promise = askAi('   hello world   ', 'A');

        jest.advanceTimersByTime(500);
        await flushMicrotasks();

        const result = await promise;
        expect(result).toContain('"hello world"');
        expect(result).not.toContain('"   hello world   "');
    });

    it('waits ~500ms before resolving', async () => {
        const promise = askAi('Hello', 'X');

        let resolved = false;
        promise.then(() => {
            resolved = true;
        });

        jest.advanceTimersByTime(499);
        await flushMicrotasks();
        expect(resolved).toBe(false);

        jest.advanceTimersByTime(1);
        await flushMicrotasks();
        expect(resolved).toBe(true);
    });
});
