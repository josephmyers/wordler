import React from 'react';
import logo from './logo.svg';
import Keyboard from 'react-simple-keyboard'
import './App.css';
import 'react-simple-keyboard/build/css/index.css';

export default function App() {
  const [word, setWord] = React.useState([ "", "", "", "", "" ])

  const row = word.map(c => <div className='App-letter'>{c.toUpperCase()}</div>)

  const onKeyPress = button => {
    if (isLetter(button))
    {
      const firstEmptySpace = word.findIndex(letter => letter == "");
      if (firstEmptySpace != -1)
      {
        setWord(oldValue => {
          const newValue = [...oldValue];
          newValue[firstEmptySpace] = button;
          return newValue;
        })
      }
    }
    else if (button === "{bksp}")
    {
      const firstEmptySpace = word.findIndex(letter => letter == "");
      const lastFilledSpace = firstEmptySpace == -1 ? word.length-1 : firstEmptySpace-1;
      
      if (lastFilledSpace != -1)
      {
        setWord(oldValue => {
          const newValue = [...oldValue];
          newValue[lastFilledSpace] = "";
          return newValue;
        })
      }
    }
  };

  function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Wordler</p>
      </header>
      <div className="App-main">{row}</div>
      <div className='Keyboard'>
        <Keyboard
            theme={"hg-theme-default darkTheme"}
            onKeyPress={b => onKeyPress(b)}
          />
      </div>
    </div>
  );
}
