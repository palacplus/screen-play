import React, { useState, useEffect } from 'react';

interface GradientLoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  colors?: [string, string];
  speed?: number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children?: React.ReactNode;
}

const GradientLoadingButton: React.FC<GradientLoadingButtonProps> = ({
  text = 'Loading...',
  colors = ['lightblue', 'lightgreen'],
  speed = 50,
  onClick,
  children,
  ...props
}) => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState(children || text);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const startLoading = () => {
    if (!isLoading) {
      setIsLoading(true);
      setIsDisabled(true);
      setButtonText(text);
      setProgress(0);

      const id = setInterval(() => {
        setProgress((prevProgress) => (prevProgress + 5) % 100);
      }, speed);
      setIntervalId(id);
    }
  };

  const stopLoading = (newText = 'Done') => {
    if (isLoading) {
      setIsLoading(false);
      setIsDisabled(false);
      setButtonText(newText);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setProgress(0);
    }
  };

  useEffect(() => {
    if (isLoading) {
      const r1 = parseInt(colors[0].slice(1, 3), 16);
      const g1 = parseInt(colors[0].slice(3, 5), 16);
      const b1 = parseInt(colors[0].slice(5, 7), 16);

      const r2 = parseInt(colors[1].slice(1, 3), 16);
      const g2 = parseInt(colors[1].slice(3, 5), 16);
      const b2 = parseInt(colors[1].slice(5, 7), 16);

      const factor = progress / 100;
      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);

      const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      buttonStyle.backgroundColor = hexColor;
    } else {
      buttonStyle.backgroundColor = colors[0];
    }
  }, [progress, isLoading, colors]);

  const handleClick = () => {
    if (!isLoading && onClick) {
      onClick();
    }
  };

  const buttonStyle: React.CSSProperties = {
    transition: 'background-color 0.3s ease', // Optional: for smoother transition when loading starts/stops
  };

  return (
    <button
      {...props}
      style={buttonStyle}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {buttonText}
    </button>
  );
};