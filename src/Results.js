import React from 'react';
import './Results.css';
import Dictionary from './dictionary.js';

export default function Results(props) {
  //the word value itself can be used as key, since it will be constant and unique
  const results = Dictionary().map(w => <div key={w} className='Result'>{w}</div>);

  return (
    <div className={props.styleClass}>
      <div><h3>Possibilities</h3></div>
      <div className='Results'>{results}</div>
    </div>
  )
}