import React, { useState, useRef } from 'react';

const OutputResultSection = ({ resultValue, addToClipboard, resultTextAreaRef }) => {
    return (
        <div id='output'>
            <textarea
                id="result"
                style={{
                    minWidth: window.innerWidth >= 992 ? '500px' : '300px',
                    minHeight: window.innerWidth >= 992 ? '500px' : '150px',
                    padding: '5px',
                }}
                value={resultValue}
                ref={resultTextAreaRef}
            ></textarea>
            <br />
            <input
                className="btn btn-info btn-sm"
                type="button"
                id="copy"
                value="COPY"
                onClick={addToClipboard}
            />
        </div>
    );
};

const OutputWaitSection = () => {
    return (
        <div id='output' className='h-5'>
            <p>Output will show up here</p>
        </div>
    );
};

const OutputSection = ({resultValue, showResults}) => {
    const resultTextAreaRef = useRef(null);

    const addToClipboard = () => {
        if (resultTextAreaRef.current) {
            resultTextAreaRef.current.select();
            resultTextAreaRef.current.setSelectionRange(0, 99999);
            document.execCommand('copy');
        }
    };

    return (
        <>
            <div className="container-fluid p-0">
                <div className="display-5 white">Output</div>
            </div>
            <br />
            {showResults 
                ? <OutputResultSection 
                    resultValue={resultValue} 
                    addToClipboard={addToClipboard} 
                    resultTextAreaRef={resultTextAreaRef}
                  />
                : <OutputWaitSection />}
        </>
    );
}

export default OutputSection;
