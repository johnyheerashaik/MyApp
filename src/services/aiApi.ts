export const askAi = async (
  prompt: string,
  userName?: string | null,
): Promise<string> => {
  await new Promise<void>(resolve => setTimeout(resolve, 700));

  const trimmed = prompt.trim();

  if (!trimmed) {
    return "Ask me anything about movies, your favourites, or what to watch next!";
  }

  return `Hey ${userName ?? 'there'} 👋\n\nYou asked:\n"${trimmed}"\n\nRight now I'm a demo AI living inside your app. Here you could connect me to a real AI API (like OpenAI) and return smart answers about movies, recommendations, or anything else you want.`;
};
