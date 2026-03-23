import { createContext, useContext, useState } from "react";

const OverlayContext = createContext();

export function OverlayProvider({ children }) {
    const [overlay, setOverlay] = useState(null);

    function showOverlay(Component, props = {}) {
        setOverlay({ Component, props });
    }

    function hideOverlay() {
        setOverlay(null);
    }

    const showStyle = {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001f2bd4',
        zIndex: 10,
    }

    const hideStyle = {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001f2b',
    }

    const innerStyle = {
        padding: '1rem',
        background: 'white',
        width: '80%',
        height: '80%',
        top: '50%',
        transform: 'translate(-50%, -50 %)',
        left: '50%',
        borderRadius: '1rem',
        boxShadow: '1px 1px black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
    }

    return (
        <OverlayContext.Provider value={{ showOverlay, hideOverlay }}>
            {overlay && (
                <div style={overlay ? showStyle : hideStyle} onClick={hideOverlay}>
                    <overlay.Component style={{innerStyle}} {...overlay.props} close={hideOverlay} />
                </div>
            )}
            {children}
        </OverlayContext.Provider>
    );
}

export const useOverlay = () => useContext(OverlayContext);