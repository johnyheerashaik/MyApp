// Quick test of the extraction logic
const responseText = `Here are some great picks for you:

*Five Nights at Freddy's* (2023) ⭐7.4 - Dive into this thrilling horror experience that combines suspense and nostalgia from the beloved video game franchise. Perfect for a heart-pounding watch!

*Wicked: For Good* (2025) ⭐6.8 - If you enjoy magical tales, this musical adventure explores friendship and redemption, creating a captivating experience that will leave you enchanted.

*Bugonia* (2025) ⭐7.5 - This intriguing film promises a unique storyline, making it a must-watch!`;

console.log('Testing extraction...\n');
console.log('Response:', responseText);

const cleanedText = responseText.replace(/^\d+\.\s+/gm, '');
const pattern = /\*([^*]+)\*/g;

const matches = [...cleanedText.matchAll(pattern)];
console.log('\nMatches found:', matches.length);

matches.forEach((match, i) => {
  const title = match[1];
  console.log(`${i + 1}. "${title}"`);
  
  // Clean the title
  let cleanTitle = title.trim();
  cleanTitle = cleanTitle.split(' - ')[0].trim();
  cleanTitle = cleanTitle.replace(/[.,!?;:]+$/, '').trim();
  
  console.log(`   Cleaned: "${cleanTitle}"`);
});
