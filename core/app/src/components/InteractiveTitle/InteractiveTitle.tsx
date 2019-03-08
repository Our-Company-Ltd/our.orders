import * as React from 'react';
import './InteractiveTitle.css';

export const InteractiveTitle: React.SFC = (props) => {
  
  return (
      <div className="interactive-title ">
         {props.children}
      </div>);
};

export default InteractiveTitle;