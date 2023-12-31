import React from 'react';
import '/src/assets/LoadingSpinner.css';
/* LoadingSpinner.css */

const LoadingSpinnerAnimation: React.FC = () => {
    return (
        <div className="flex flex-row" style={{"height": 124}}>
            <div className="spinner"></div>
        </div>
    );
};

export default LoadingSpinnerAnimation;