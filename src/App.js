import React from 'react';
import logo from './brain.svg';
import Row from './Row.js';
import Keyboard from './Keyboard.js';
import Results from './Results.js';
import Sidebar from './Sidebar.js';
import './App.css';
import dictionaryRaw from './dictionary.txt'

export default function App() {
  const LetterStatus = {
    NotPresent: 0,
    WrongSpot: 1,
    RightSpot: 2
  }

  class Letter {
    constructor() {
      this.letter = "";
      this.status = LetterStatus.NotPresent;
    }
  }

  class Word {
    constructor(letters) {
      this.letters = [new Letter(), new Letter(), new Letter(), new Letter(), new Letter()];
      for (let i = 0; i < 5 && i < letters.length; i++)
      {
        this.letters[i] = letters[i];
      }
    }

    static createEmpty() {
      return [new Letter(), new Letter(), new Letter(), new Letter(), new Letter()];
    }

    firstEmptySpace() {
      return this.letters.findIndex(letter => letter.letter === "");
    }

    firstFilledSpace() {
      return this.letters.findIndex(letter => letter.letter !== "");
    }
  }

  const [dictionary, setDictionary] = React.useState();
  const [showFlyout, setShowFlyout] = React.useState(false);
  const [isSmallScreen, setIsSmallScreen] = React.useState(window.innerWidth <= 640);
  const [words, setWords] = React.useState([new Word(Word.createEmpty())]);
  const rows = words.map(w => <Row word={w} onClick={incrementLetterStatus} />);
  const rowLimit = 6;
  const knownLetters = getKnownLetters();
  const mysteryLetters = getMysteryLetters()[0];

  React.useEffect(() => {
    (async () => {
        const response = await fetch(dictionaryRaw);
        setDictionary(await response.text());
      }
    )()
  }, []);

  let possibilities;
  if (lastWord(words) >= 0)
  {
    possibilities = dictionary.split(/\r\n|\r|\n/);
  }
  
  React.useEffect(() => {
    function checkForSmallScreen() {
      setIsSmallScreen(window.innerWidth <= 640);
    }

    window.addEventListener('resize', checkForSmallScreen);
    return () => window.removeEventListener('resize', checkForSmallScreen);
  }, []);

  function onKeyPress(button) {
    if (isLetter(button))
    {
      addLetter(button);
    }
    else if (button === "Backspace")
    {
      removeLastLetter();
    }
  }

  function addLetter(button) {
    const wordToEdit = firstIncompleteWord(words);
    if (wordToEdit !== -1) {
      const firstEmptySpace = words[wordToEdit].firstEmptySpace();
      setWords(oldWords => {
        const newWord = new Word(oldWords[wordToEdit].letters);
        newWord.letters[firstEmptySpace].letter = button;

        const newWords = [...oldWords];
        newWords[wordToEdit] = newWord;

        if (firstIncompleteWord(newWords) === -1 && newWords.length < rowLimit) {
          newWords.push(new Word(Word.createEmpty()));
        }

        return newWords;
      });
    }
  }

  function removeLastLetter() {
    const indexOfLastWord = lastWord(words);
    if (indexOfLastWord !== -1) {
      const firstEmptySpace = words[indexOfLastWord].firstEmptySpace();
      const lastFilledSpace = firstEmptySpace === -1 ? words[indexOfLastWord].letters.length - 1 : firstEmptySpace - 1;

      setWords(oldWords => {
        const newWord = new Word(oldWords[indexOfLastWord].letters);
        newWord.letters[lastFilledSpace].letter = "";
        newWord.letters[lastFilledSpace].status = LetterStatus.NotPresent;

        const newWords = [...oldWords];
        newWords[indexOfLastWord] = newWord;

        if (lastWord(newWords) >= 0)
        {
          const incompleteWordExists = newWords[lastWord(newWords)].firstEmptySpace() > -1;
          const emptyRowExists = newWords[newWords.length - 1].firstFilledSpace() < 0;
          if (incompleteWordExists && emptyRowExists) {
            newWords.pop();
          }
        }

        return newWords;
      });
    }
  }

  function firstIncompleteWord(words) {
    for (let i = 0; i < words.length; i++)
    {
      const hasEmptySpace = words[i].firstEmptySpace() > -1;
      if (hasEmptySpace) return i;
    }

    return -1;
  }

  function lastWord(words) {
    for (let i = words.length-1; i >= 0; i--)
    {
      const hasLetter = words[i].firstFilledSpace() > -1;
      if (hasLetter) return i;
    }

    return -1;
  }

  function incrementLetterStatus(word, letter) {
    if (letter.letter !== "")
    {
      const indexOfChangedWord = words.indexOf(word);
      const indexOfChangedLetter = word.letters.indexOf(letter);
      const newWord = new Word(word.letters);
      const oldStatus = newWord.letters[indexOfChangedLetter].status;
      let newStatus = newWord.letters[indexOfChangedLetter].status;
      newStatus = (newStatus + 1) % Object.keys(LetterStatus).length;

      const numKnownLetters = knownLetters.filter(l => l.letter !== "").length;
      const numMysteryLetters = mysteryLetters.length;
      if (numKnownLetters + numMysteryLetters === 5 && oldStatus === LetterStatus.NotPresent)
      {
        return; //don't add any more letters
      }

      const greenExistsInThisSpot = knownLetters[indexOfChangedLetter].status === LetterStatus.RightSpot;
      if (newStatus === LetterStatus.RightSpot && greenExistsInThisSpot)
      {
        newStatus = (newStatus + 1) % Object.keys(LetterStatus).length; //skip green
      }

      newWord.letters[indexOfChangedLetter].status = newStatus;

      //todo highlight occurrences in other letters
      setWords(oldWords => {
        const newWords = [...oldWords];
        newWords[indexOfChangedWord] = newWord;
        return newWords;
      });
    }
  }

  function getKnownLetters() {
    const word = new Word(Word.createEmpty());
    for (let letter = 0; letter < 5; letter++)
    {
      if (word.letters[letter].letter !== "") continue;

      for (let i = 0; i < words.length; i++)
      {
        if (words[i].letters[letter].status === LetterStatus.RightSpot)
        {
          word.letters[letter] = words[i].letters[letter];
          continue;
        }
      }
    }

    return word.letters;
  }

  function getMysteryLetters() {
    const allExclusions = {};
    const mysteryLetters = [];
    for (let row = 0; row < words.length; row++)
    {
      const exclusionsInThisWord = [];
      for (let letterIndex = 0; letterIndex < 5; letterIndex++)
      {
        const currentLetter = words[row].letters[letterIndex];
        if (currentLetter.status === LetterStatus.WrongSpot)
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

          const numOccurrencesInThisWord = exclusionsInThisWord.filter(l => l.letter === currentLetter.letter).length;
          const numOccurrencesInMysteryLetters = mysteryLetters.filter(l => l.letter === currentLetter.letter).length;
          const numOccurrencesInKnownLetters = knownLetters.filter(l => l.letter === currentLetter.letter).length;
          if (numOccurrencesInThisWord > numOccurrencesInMysteryLetters + numOccurrencesInKnownLetters)
          {
            mysteryLetters.push(currentLetter);
          }
        }
      }
    }

    return [mysteryLetters, allExclusions];
  }

  function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
  }

  function toggleFlyout() {
    setShowFlyout(oldValue => !oldValue);
  }

  return (
    <div className="App">
      <header>
        <img src={logo} className="App-logo" alt="logo" />
        <p>Wordler</p>
      </header>
      <div className='App-middle'>
        {(!isSmallScreen || !showFlyout) &&
          <main>
            <div className='App-rows'>{rows}</div>
            {(!isSmallScreen && possibilities !== undefined) &&
              <Results styleClass='Results-container-full' possibilities={possibilities} />
            }
          </main>
        }
        {(isSmallScreen && showFlyout) &&
          <Results styleClass='Results-flyout' possibilities={possibilities} />
        }
        {(isSmallScreen && possibilities !== undefined) &&
          <Sidebar toggleFlyout={toggleFlyout} showFlyout={showFlyout} />
        }
      </div>
      <footer>
        {(!isSmallScreen || !showFlyout) && 
          <Keyboard onKeyPress={onKeyPress} />
        }
      </footer>
    </div>
  );
}
