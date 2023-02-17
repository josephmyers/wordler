import React from 'react';
import './Results.css'

export default function Results(props) {
  const results = props.possibilities.map(w => <div className='Result'>{w}</div>);

  return (
    <div className={props.styleClass}>
      <div><h3>Possibilities</h3></div>
      <div className='Results'>{results}</div>
    </div>
  )
}