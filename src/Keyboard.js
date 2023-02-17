import React from 'react';
import SimpleKeyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './Keyboard.css';

export default function Keyboard(props) {
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

  return (
    <SimpleKeyboard
      layout={layout} display={display}
      theme={"hg-theme-default darkTheme"}
      buttonTheme={buttonTheme}
      onKeyPress={b => props.onKeyPress(b)}
    />
  )
}