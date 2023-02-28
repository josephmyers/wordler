import React from 'react';
import './HelpText.css';

export default function HelpText(props) {
  let text;
  const [shouldDisplay, setShouldDisplay] = React.useState(false);
  const [hasSetStatus, setHasSetStatus] = React.useState(false);
  const [secondsLeft, setSecondsLeft] =  React.useState(2);
  const [fade, setFade] = React.useState('fade-out');

  React.useEffect(() => {
    const timeout = setInterval(() => {
      if (shouldDisplay)
      {
        if (fade === 'fade-in') {
          setFade('fade-out');
        } else {
          setFade('fade-in');
        }
      }
    }, 2000);
    return () => clearInterval(timeout);
  }, [fade, shouldDisplay]);

  React.useEffect(()=> {
    let myInterval = setInterval(() =>
      {
        if (secondsLeft > 0 && props.words.length > 2) {
          setSecondsLeft(secondsLeft - 1);
        }
        if (secondsLeft === 0 && !hasSetStatus)
        {
          setShouldDisplay(true);
        }
        else
        {
          setShouldDisplay(false);
        }
      }, 1000);
    return () => clearInterval(myInterval);
  });

  if (!hasSetStatus)
  {
    text = "Touch letter to filter";
    const words = props.words;
    for (let w in words)
    {
      if (words[w].letters.filter(l => l.status != 0).length > 0)
      {
        setHasSetStatus(true);
        return;
      }
    }
  
    return (shouldDisplay && <div className={fade}>{text}</div>);
  }

  return;
}