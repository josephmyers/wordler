import React from 'react';
import lightbulb from './lightbulb.svg';
import './Sidebar.css';

export default function Sidebar(props) {
  return (
    <div className='Sidebar'>
      <img src={lightbulb}
           className={props.showFlyout ? 'Results-icon-active' : 'Results-icon'}
           alt='Results'
           onClick={props.toggleFlyout} />
    </div>
  )
}