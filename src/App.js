import React from 'react';
import logo from './brain.svg';
import lightbulb from './lightbulb.svg';
import Keyboard from 'react-simple-keyboard';
import Row from './Row.js';
import './App.css';
import 'react-simple-keyboard/build/css/index.css';
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
      setPossibilities(dictionary);
    }
  }, [words, dictionary]);

  const layout = {
    default: [
      "q w e r t y u i o p",
      "a s d f g h j k l",
      "z x c v b n m Backspace",
    ]
  }

  const display = {
    "Backspace": "⌫",
  }

  const buttonTheme = [{
    class: "special-button",
    buttons: "Backspace"
  }]

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

  return (
    <div className="App">
      <header>
        <img src={logo} className="App-logo" alt="logo" />
        <p>Wordler</p>
      </header>
      <div className='App-middle'>
        <main>
          <div className='App-rows'>{rows}</div>
          {possibilities !== undefined &&
            <div className='App-results-container-full'>
              <div><h3>Possibilities</h3></div>
              <div>{possibilities}</div>
            </div>
          }
        </main>
        {possibilities !== undefined &&
          <div className='App-results-container-small'>
            <img src={lightbulb} className='App-results-icon' />
          </div>
        }
      </div>
      <footer>
        <Keyboard
            layout={layout} display={display}
            theme={"hg-theme-default darkTheme"}
            buttonTheme={buttonTheme}
            onKeyPress={b => onKeyPress(b)}
          />
      </footer>
    </div>
  );
}
