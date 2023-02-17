import React from 'react';
import logo from './brain.svg';
import Row from './Row.js';
import Keyboard from './Keyboard.js';
import Results from './Results.js';
import Sidebar from './Sidebar.js';
import './App.css';
import dictionaryRaw from './dictionary.txt'

export default function App() {
  class Word {
    constructor(word) {
      this.letters = ["", "", "", "", ""];
      for (let i = 0; i < 5 && i < word.length; i++)
      {
        this.letters[i] = word[i];
      }
    }

    firstEmptySpace() {
      return this.letters.findIndex(letter => letter === "");
    }

    firstFilledSpace() {
      return this.letters.findIndex(letter => letter !== "");
    }
  }

  const [words, setWords] = React.useState([new Word("")]);
  const rows = words.map(w => <Row value={w} />);
  const [dictionary, setDictionary] = React.useState();
  const [possibilities, setPossibilities] = React.useState();
  const [showFlyout, setShowFlyout] = React.useState(false);
  const [isSmallScreen, setIsSmallScreen] = React.useState(window.innerWidth <= 640);

  React.useEffect(() => {
    (async () => {
        const response = await fetch(dictionaryRaw);
        setDictionary(await response.text());
      }
    )()
  }, []);

  React.useEffect(() => {
    if (lastWord(words) >= 0)
    {
      setPossibilities(dictionary.split("\r\n"));
    }
  }, [words, dictionary]);
  
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
        newWord.letters[firstEmptySpace] = button;

        const newWords = [...oldWords];
        newWords[wordToEdit] = newWord;

        if (firstIncompleteWord(newWords) === -1) {
          newWords.push(new Word(""));
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
        newWord.letters[lastFilledSpace] = "";

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
