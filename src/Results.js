import React from 'react';
import './Results.css';
import Dictionary from './dictionary';
import WordsParser from './WordsParser';

export default function Results(props) {
  const [knownLetters, mysteryLetters, exclusions, absentLetters, limitedLetters] = WordsParser(props.words);
  const knownAndMysteryLetters = knownLetters.concat(mysteryLetters);
  const dictionary = Dictionary();
  const possibilities = [];

  for (let possibility of dictionary)
  {
    if (!hasExcludedLetters(absentLetters, possibility))
    {
      continue;
    }

    if (!hasKnownLetters(knownLetters, possibility))
    {
      continue;
    }

    if (!hasExactLetters(limitedLetters, knownAndMysteryLetters, possibility))
    {
      continue;
    }

    if (!hasMinimumRequiredLetters(mysteryLetters, knownAndMysteryLetters, possibility))
    {
      continue;
    }

    if (!isRuledOutByExclusions(exclusions, knownLetters, possibility))
    {
      continue;
    }

    possibilities.push(possibility);
  }

  //the word value itself can be used as key, since it will be constant and unique
  const results = possibilities.map(w => <div key={w} className='Result'>{w}</div>);

  return (
    <div className={props.styleClass}>
      <div><h3>Possibilities</h3></div>
      <div className='Results'>{results}</div>
    </div>
  )
}

function isRuledOutByExclusions(exclusions, knownLetters, possibility) {
  for (let index = 0; index < 5; index++) {
    if (knownLetters[index].letter !== '') continue;
    const letter = possibility[index];
    const isLetterExcluded = exclusions[index].findIndex(l => l.letter === letter) > -1;
    if (isLetterExcluded) {
      return false;
    }
  }
  return true;
}

function hasMinimumRequiredLetters(mysteryLetters, knownAndMysteryLetters, possibility) {
  for (let letter of mysteryLetters) {
    const numMatchesInAnswer = knownAndMysteryLetters.filter(l => l.letter === letter.letter).length;
    const numOccurrencesInThisWord = [...possibility].filter(l => l === letter.letter).length;
    if (numOccurrencesInThisWord < numMatchesInAnswer) {
      return false;
    }
  }
  return true;
}

function hasExactLetters(limitedLetters, knownAndMysteryLetters, possibility) {
  for (let letter of limitedLetters) {
    const numExpectedOccurrences = knownAndMysteryLetters.filter(l => l.letter === letter.letter).length;
    const numActualOccurrences = [...possibility].filter(l => l === letter.letter).length;
    if (numActualOccurrences !== numExpectedOccurrences) {
      return false;
    }
  }
  return true;
}

function hasKnownLetters(knownLetters, possibility) {
  for (let i = 0; i < knownLetters.length; i++) {
    const letter = knownLetters[i];
    if (letter.letter === '') {
      continue;
    }

    if (possibility[i] !== letter.letter) {
      return false;
    }
  }
  return true;
}

function hasExcludedLetters(absentLetters, possibility) {
  for (let l of absentLetters) {
    if (possibility.indexOf(l.letter) > -1) {
      return false;
    }
  }
  return true;
}
