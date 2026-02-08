/**
 * Generate user prompt for the AI companion
 * @param {Object} params
 * @param {string} params.userName - User's name
 * @param {string} params.question - User's question
 * @param {string} params.favSummary - Summary of user's favorites
 * @returns {string} User prompt
 */
export function generateUserPrompt({ userName, question, favSummary }) {
    return `
${userName || 'User'} just asked: "${question}"

IMPORTANT INSTRUCTIONS:
- Be conversational and natural (like ChatGPT)
- If asking for a genre and movies are available: suggest 3-5 with brief reasons
- If asking for a genre but NONE available: say so naturally, then offer alternatives
- For questions: answer directly, then ask if they want more
- Wrap ALL movie titles in *asterisks*
- Be friendly and helpful

Their favorites for context: ${favSummary}
  `.trim();
}
