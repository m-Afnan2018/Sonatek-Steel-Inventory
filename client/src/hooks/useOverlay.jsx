import { createContext, useContext, useState, useCallback } from "react";

const OverlayContext = createContext();

export function OverlayProvider({ children }) {
    const [overlay, setOverlay] = useState(null);

    const showOverlay = useCallback((Component, props = {}) => {
        setOverlay({ Component, props });
    }, []);

    const hideOverlay = useCallback(() => {
        setOverlay(null);
    }, []);

    const backdropStyle = {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--overlay-bg)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
    };

    return (
        <OverlayContext.Provider value={{ showOverlay, hideOverlay }}>
            {overlay && (
                <div style={backdropStyle} onClick={hideOverlay}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <overlay.Component {...overlay.props} close={hideOverlay} />
                    </div>
                </div>
            )}
            {children}
        </OverlayContext.Provider>
    );
}

export const useOverlay = () => useContext(OverlayContext);
