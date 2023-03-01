import React from 'react';
import './HelpButton.css';
import question from './question.svg';

export default function HelpText(props) {
  const [hasSetStatus, setHasSetStatus] = React.useState(false);
  const [secondsLeft, setSecondsLeft] =  React.useState(2);
  const [fade, setFade] = React.useState('fade-in');
  const [flashHelp, setFlashHelp] = React.useState(false);
  const [helpOpened, setHelpOpened] = React.useState(false);

  React.useEffect(() => {
    const timeout = setInterval(() => {
      if (!hasSetStatus && secondsLeft === 0 && flashHelp)
      {
        if (fade === 'fade-in') {
          setFade('fade-out');
        } else {
          setFade('fade-in');
        }
      }
      else if (hasSetStatus || !flashHelp)
      {
        setFade('fade-in');
      }
    }, 1000);
    return () => clearInterval(timeout);
  }, [fade, secondsLeft, hasSetStatus, flashHelp]);

  React.useEffect(()=> {
    let myInterval = setInterval(() =>
      {
        if (secondsLeft > 0 && props.words.length > 2) {
          setSecondsLeft(secondsLeft - 1);
          if (!helpOpened)
          {
            setFlashHelp(true);
          }
        }
      }, 1000);
    return () => clearInterval(myInterval);
  });

  if (!hasSetStatus)
  {
    const words = props.words;
    for (let w in words)
    {
      if (words[w].letters.filter(l => l.status !== 0).length > 0)
      {
        setHasSetStatus(true);
        break;
      }
    }
  }

  function showHelp() {
    setFlashHelp(false);
    setHelpOpened(true);
    props.click();
  }

  return (
    <div className={fade} onClick={showHelp}>
      <img src={question} className="icon" alt="help" />
    </div>
  );
}