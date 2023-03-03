import React from 'react';
import './HelpDialog.css';
import brain from './brain.svg';

export default function HelpDialog(props) {
  return (
  <div className={props.isShown ? 'dialog' : 'hidden'}>
    <div className='content'>
      <button className='close-button' onClick={props.close}>X</button>
      <div className='title'>
        <img src={brain} alt='logo' className='logo' />
        <h2>Wordler</h2>
      </div>
      <h3>Helpful Hints:</h3>
      <ul className='tips'>
        <li>Tap letters to filter</li>
        <li>Changing previous filters may overwrite later ones</li>
      </ul>
      <div className='footer'>
        <p>
          <a className='link'
            href='https://github.com/josephmyers/wordler/issues/new'>
              Found an issue?
          </a>
        </p>
        
        <p>Copyright © {new Date().getFullYear()}</p>
      </div>
    </div>
  </div>)
}