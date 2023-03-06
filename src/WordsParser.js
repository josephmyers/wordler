import Word from "./Word";
import LetterStatus from "./LetterStatus";

export default function WordsParser(words) {
  const knownLetters = getKnownLetters(words);
  const mysteryLetters = [];
  const exclusions = { 0:[], 1:[], 2:[], 3:[], 4:[] };
  const absentLetters = [];
  const limitedLetters = [];
  for (let row = 0; row < words.length; row++)
  {
    const matchesInThisWord = [];
    for (let letterIndex = 0; letterIndex < 5; letterIndex++)
    {
      const currentLetter = words[row].letters[letterIndex];
      if (currentLetter.letter === '') continue;

      if (currentLetter.status === LetterStatus().RightSpot)
      {
        matchesInThisWord.push(currentLetter);
      }
      else if (currentLetter.status === LetterStatus().WrongSpot)
      {
        matchesInThisWord.push(currentLetter);

        exclusions[letterIndex].push(currentLetter);

        if (mysteryLetters.findIndex(l => l.letter === currentLetter.letter) === -1 &&
            knownLetters.findIndex(l => l.letter === currentLetter.letter) === -1)
        {
          mysteryLetters.push(currentLetter);
          continue;
        }

        const numOccurrencesInThisWord = matchesInThisWord.filter(l => l.letter === currentLetter.letter).length;
        const numOccurrencesInMysteryLetters = mysteryLetters.filter(l => l.letter === currentLetter.letter).length;
        const numOccurrencesInKnownLetters = knownLetters.filter(l => l.letter === currentLetter.letter).length;
        if (numOccurrencesInThisWord > numOccurrencesInMysteryLetters + numOccurrencesInKnownLetters)
        {
          mysteryLetters.push(currentLetter);
        }
      }
      else //Not Present
      {
        if (absentLetters.find(l => l.letter === currentLetter.letter)) continue;

        const occurrencesInThisWord = words[row].letters.filter(l => l.letter === currentLetter.letter);
        const matchesInThisWord = occurrencesInThisWord.filter(l => l.status !== LetterStatus().NotPresent);
        if (matchesInThisWord.length === 0)
        {
          absentLetters.push(currentLetter);
        }
        else
        {
          //the letter occurs, but not as many times as it appears in this word
          limitedLetters.push(currentLetter);
          exclusions[letterIndex].push(currentLetter);
        }

        continue;
      }
    }
  }

  return [knownLetters, mysteryLetters, exclusions, absentLetters, limitedLetters];
}

function getKnownLetters(words) {
  const word = new Word(Word.createEmpty());
  for (let letter = 0; letter < 5; letter++)
  {
    if (word.letters[letter].letter !== "") continue;

    for (let i = 0; i < words.length; i++)
    {
      if (words[i].letters[letter].status === LetterStatus().RightSpot)
      {
        word.letters[letter] = words[i].letters[letter];
        continue;
      }
    }
  }

  return word.letters;
}
