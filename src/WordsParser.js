import Word from "./Word";
import LetterStatus from "./LetterStatus";

export default function WordsParser(words) {
  const knownLetters = getKnownLetters(words);
  const allExclusions = {};
  const mysteryLetters = [];
  for (let row = 0; row < words.length; row++)
  {
    const exclusionsInThisWord = [];
    for (let letterIndex = 0; letterIndex < 5; letterIndex++)
    {
      const currentLetter = words[row].letters[letterIndex];
      if (currentLetter.status === LetterStatus().RightSpot)
      {
        exclusionsInThisWord.push(currentLetter);
      }
      else if (currentLetter.status === LetterStatus().WrongSpot)
      {
        exclusionsInThisWord.push(currentLetter);

        if (!allExclusions[letterIndex])
        {
          allExclusions[letterIndex] = [];
        }

        const hasLetterOccurredBefore = allExclusions[letterIndex].findIndex(l => l.letter === currentLetter.letter) >= 0;
        if (!hasLetterOccurredBefore)
        {
          allExclusions[letterIndex].push(currentLetter);
        }

        if (mysteryLetters.findIndex(l => l.letter === currentLetter.letter) === -1 &&
            knownLetters.findIndex(l => l.letter === currentLetter.letter) === -1)
        {
          mysteryLetters.push(currentLetter);
        }
      }
      else
      {
        continue;
      }

      const numOccurrencesInThisWord = exclusionsInThisWord.filter(l => l.letter === currentLetter.letter).length;
      const numOccurrencesInMysteryLetters = mysteryLetters.filter(l => l.letter === currentLetter.letter).length;
      const numOccurrencesInKnownLetters = knownLetters.filter(l => l.letter === currentLetter.letter).length;
      if (numOccurrencesInThisWord > numOccurrencesInMysteryLetters + numOccurrencesInKnownLetters)
      {
        mysteryLetters.push(currentLetter);
      }
    }
  }

  return [knownLetters, mysteryLetters];
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
