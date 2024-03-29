import React from 'react';
import logo from './logo.png';
import Row from './Row.js';
import Keyboard from './Keyboard.js';
import Results from './Results.js';
import Sidebar from './Sidebar.js';
import HelpButton from './HelpButton.js';
import HelpDialog from './HelpDialog.js';
import Mask from './AppMask.js';
import Word from './Word.js';
import getLettersInAnswer from './WordsParser.js';
import LetterStatus from './LetterStatus.js';
import './App.css';

export default function App() {
  function firstEmptySpace(word) {
    return word.letters.findIndex(letter => letter.letter === "");
  }

  function firstFilledSpace(word) {
    return word.letters.findIndex(letter => letter.letter !== "");
  }

  const [showFlyout, setShowFlyout] = React.useState(false);
  const [isSmallScreen, setIsSmallScreen] = React.useState(window.innerWidth <= 640);
  const [words, setWords] = React.useState([new Word(Word.createEmpty())]);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const rows = words.map((w, index) => <Row word={w} key={index} onClick={incrementLetterStatus} />);
  const rowLimit = 6;

  let showResults = false;
  if (lastWord(words) >= 0)
  {
    showResults = true;
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
      const firstEmptySpaceIndex = firstEmptySpace(words[wordToEdit]);
      setWords(oldWords => {
        const newWord = new Word(oldWords[wordToEdit].letters);
        newWord.letters[firstEmptySpaceIndex].letter = button;

        const newWords = structuredClone(oldWords);
        newWords[wordToEdit] = newWord;

        const indexOfWord = oldWords.indexOf(wordToEdit);
        const precedingWords = oldWords.slice(0, indexOfWord);
        const [knownLetters, mysteryLetters] = getLettersInAnswer(precedingWords);

        updateNewLetterStatus(firstEmptySpaceIndex, button, newWord, knownLetters, mysteryLetters);

        if (firstIncompleteWord(newWords) === -1 && newWords.length < rowLimit) {
          newWords.push(new Word(Word.createEmpty()));
        }

        return newWords;
      });
    }
  }

  function updateNewLetterStatus(letterIndex, newValue, newWord, knownLetters, mysteryLetters) {
    if (knownLetters[letterIndex].letter === newValue) {
      newWord.letters[letterIndex].status = LetterStatus().RightSpot;
    }
    else {
      const knownAndMysteryLetters = knownLetters.concat(mysteryLetters).filter(l => l.letter !== "");
      const matchesInPreviousWords = knownAndMysteryLetters.filter(l => l.letter === newValue);
      const matchesInChangedWord = newWord.letters.filter(
        l => l.letter === newValue && l.status !== LetterStatus().NotPresent);
      if (matchesInChangedWord.length < matchesInPreviousWords.length) {
        newWord.letters[letterIndex].status = LetterStatus().WrongSpot;
      }
    }
  }

  function removeLastLetter() {
    const indexOfLastWord = lastWord(words);
    if (indexOfLastWord !== -1) {
      const firstEmptySpaceIndex = firstEmptySpace(words[indexOfLastWord]);
      const lastFilledSpace = firstEmptySpaceIndex === -1 ? words[indexOfLastWord].letters.length - 1 : firstEmptySpaceIndex - 1;

      setWords(oldWords => {
        const newWord = new Word(oldWords[indexOfLastWord].letters);
        newWord.letters[lastFilledSpace].letter = "";
        newWord.letters[lastFilledSpace].status = LetterStatus().NotPresent;

        const newWords = structuredClone(oldWords);
        newWords[indexOfLastWord] = newWord;

        if (lastWord(newWords) >= 0)
        {
          const incompleteWordExists = firstEmptySpace(newWords[lastWord(newWords)]) > -1;
          const emptyRowExists = firstFilledSpace(newWords[newWords.length - 1]) < 0;
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
      const hasEmptySpace = firstEmptySpace(words[i]) > -1;
      if (hasEmptySpace) return i;
    }

    return -1;
  }

  function lastWord(words) {
    for (let i = words.length-1; i >= 0; i--)
    {
      const hasLetter = firstFilledSpace(words[i]) > -1;
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
      newStatus = (newStatus + 1) % Object.keys(LetterStatus()).length;

      setWords(oldWords => {
        const newWords = structuredClone(oldWords);
        
        newWord.letters[indexOfChangedLetter].status = newStatus;
        newWords[indexOfChangedWord] = newWord;

        const previousWords = newWords.slice(0, indexOfChangedWord);
        if (!isChangeAllowed(letter, previousWords, newWord, newStatus))
        {
          newStatus = (newStatus + 1) % Object.keys(LetterStatus()).length;
          newWord.letters[indexOfChangedLetter].status = newStatus;
          if (!isChangeAllowed(letter, previousWords, newWord, newStatus)) //try the remaining status
          {
            newWord.letters[indexOfChangedLetter].status = oldStatus; //undo
            return newWords;
          }
        }

        const wordsUpToThisPoint = newWords.slice(0, indexOfChangedWord+1);
        const [knownLetters, mysteryLetters] = getLettersInAnswer(wordsUpToThisPoint);
        const knownAndMysteryLetters = knownLetters.concat(mysteryLetters).filter(l => l.letter !== "");

        if (knownAndMysteryLetters.length > 5)
        {
          newWord.letters[indexOfChangedLetter].status = oldStatus; //undo
          return newWords;
        }

        clearAndInitialize(newWords, knownLetters, knownAndMysteryLetters, indexOfChangedWord);

        return newWords;
      });
    }
  }

  function isChangeAllowed(letter, previousWords, word, newStatus) {
    const [knownLetters, mysteryLetters] = getLettersInAnswer(previousWords);
    const knownAndMysteryLetters = knownLetters.concat(mysteryLetters).filter(l => l.letter !== "");
    const indexOfChangedLetter = word.letters.indexOf(letter);

    const matchesInPreviousWords = knownAndMysteryLetters.filter(l => l.letter === letter.letter).length;
    const matchesInNewWord = word.letters.filter(
      l => l.letter === letter.letter && l.status !== LetterStatus().NotPresent).length;
    
    //disallow change if previous column is same letter and green
    if (newStatus === LetterStatus().NotPresent || newStatus === LetterStatus().WrongSpot)
    {
      for (let row = 0; row < previousWords.length; row++)
      {
        if (previousWords[row].letters[indexOfChangedLetter].letter === letter.letter &&
            previousWords[row].letters[indexOfChangedLetter].status === LetterStatus().RightSpot)
        {
          return false;
        }
      }
    }
    //disallow yellow -> green when column is already yellow
    if (newStatus === LetterStatus().RightSpot)
    {
      for (let row = 0; row < previousWords.length; row++)
      {
        if (previousWords[row].letters[indexOfChangedLetter].letter === letter.letter &&
            previousWords[row].letters[indexOfChangedLetter].status === LetterStatus().WrongSpot)
        {
          return false;
        }
      }
    }
    //disallow deletions based on previous rows
    if (newStatus === LetterStatus().NotPresent && matchesInPreviousWords > matchesInNewWord)
    {
      return false;
    }
    //disallow additions based on previous rows
    if (newStatus === LetterStatus().WrongSpot || newStatus === LetterStatus().RightSpot)
    {
      const mostOccurrencesOfLetter = getMostOccurrencesOfLetter(letter, previousWords);
      if (mostOccurrencesOfLetter > 0 && mostOccurrencesOfLetter > matchesInPreviousWords)
      {
        const exactOccurrencesInAnswer = matchesInPreviousWords;
        if (matchesInNewWord > exactOccurrencesInAnswer)
        {
          return false;
        }
      }
    }
    //disallow green if column already has one
    if (newStatus === LetterStatus().RightSpot)
    {
      if (knownLetters[indexOfChangedLetter].letter !== '')
      {
        return false;
      }
    }

    return true;
  }

  function getMostOccurrencesOfLetter(letter, words) {
    let mostOccurrences = 0;
    for (let row = 0; row < words.length; row++)
    {
      const count = words[row].letters.filter(l => l.letter === letter.letter).length;
      if (count > mostOccurrences)
      {
        mostOccurrences = count;
      }
    }

    return mostOccurrences;
  }

  function clearAndInitialize(newWords, knownLetters, knownAndMysteryLetters, indexOfChangedWord) {
    for (let row = indexOfChangedWord+1; row < newWords.length; row++) {
      for (let i = 0; i < 5; i++) {
        const currentLetter = newWords[row].letters[i];
        currentLetter.status = LetterStatus().NotPresent;
      }

      for (let i = 0; i < 5; i++) {
        const currentLetter = newWords[row].letters[i];
        if (currentLetter.letter === '')
          break;
        if (knownLetters[i].letter === currentLetter.letter) {
          currentLetter.status = LetterStatus().RightSpot;
        }
      }

      for (let i = 0; i < 5; i++) {
        const currentLetter = newWords[row].letters[i];
        if (currentLetter.letter === '')
          break;
        const occurrencesInAnswer = knownAndMysteryLetters.filter(l => l.letter === currentLetter.letter);
        const matchesInCurrentWord = newWords[row].letters.filter(
          l => l.letter === currentLetter.letter && l.status !== LetterStatus().NotPresent);
        const isMysteryLetterNeeded = occurrencesInAnswer.length > matchesInCurrentWord.length;
        if (isMysteryLetterNeeded && currentLetter.status === LetterStatus().NotPresent) {
          currentLetter.status = LetterStatus().WrongSpot;
        }
      }
    }
  }

  function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
  }

  function toggleFlyout() {
    setShowFlyout(oldValue => !oldValue);
  }

  function openHelp() {
    setIsHelpOpen(true);
  }

  function closeHelp() {
    setIsHelpOpen(false);
  }

  return (
    <div className="App">
      <header>
        <img src={logo} className="App-logo" alt="logo" />
        <div className="App-help-text">
          <HelpButton words={words} click={openHelp} isHelpOpen={isHelpOpen} />
        </div>
      </header>
      <div className='App-middle'>
        {(!isSmallScreen || !showFlyout) &&
          <main>
            <div className='App-rows'>{rows}</div>
            {(!isSmallScreen && showResults) &&
              <Results styleClass='Results-container-full' words={words} />
            }
          </main>
        }
        {(isSmallScreen && showFlyout) &&
          <Results styleClass='Results-flyout' words={words} />
        }
        {(isSmallScreen && showResults) &&
          <Sidebar toggleFlyout={toggleFlyout} showFlyout={showFlyout} />
        }
      </div>
      <footer>
        {(!isSmallScreen || !showFlyout) && 
          <Keyboard onKeyPress={onKeyPress} />
        }
      </footer>
      <Mask isShown={isHelpOpen} click={closeHelp} />
      <HelpDialog isShown={isHelpOpen} close={closeHelp} />
    </div>
  );
}
