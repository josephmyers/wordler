import React from 'react';
import './Row.css'

export default function Row(props) {
  function getLetterStyle(letterStatus) {
    if (letterStatus === 1)
    {
      return 'Letter-WrongSpot';
    }
    if (letterStatus === 2)
    {
      return 'Letter-RightSpot';
    }

    return 'Letter-NotPresent';
  }

  const letters = props.word.letters.map((l, index) => (
    <div onClick={() => props.onClick(props.word, l)}
         key={index} //letters will never move
         className={getLetterStyle(l.status)}>
      {l.letter.toUpperCase()}
    </div>
  ));
  return <div className='Row'>{letters}</div>
}