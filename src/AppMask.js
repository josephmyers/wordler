import React from 'react';
import './AppMask.css'

export default function AppMask(props) {
  return <div className={props.isShown ? 'mask' : 'hidden'} onClick={props.click} />
}