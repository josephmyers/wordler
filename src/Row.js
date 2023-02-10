import React from 'react';
import './Row.css'

export default function Row(props) {
  const letters = props.value.letters.map(c => <div className='Letter'>{c.toUpperCase()}</div>);
  return <div className='Row'>{letters}</div>
}