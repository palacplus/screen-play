import { useEffect, useRef } from "react";
import { set } from "zod";

interface LoadingOverlayProps {
    isLoading: boolean;
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const parentElement = overlayRef.current?.parentElement;

        if (parentElement) {
            const originalStyles = {
                filter: parentElement.style.filter,
                pointerEvents: parentElement.style.pointerEvents,
                position: parentElement.style.position,
                border: parentElement.style.border,
                boxShadow: parentElement.style.boxShadow,
            };

            if (isLoading) {
                parentElement.style.filter = "blur(1.5px)";
                parentElement.style.pointerEvents = "none";
                parentElement.style.position = "relative";
                parentElement.style.border = "2px solid rgba(0, 0, 0, 0.2)";
                parentElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
            }

            return () => {
                parentElement.style.filter = originalStyles.filter;
                parentElement.style.pointerEvents = originalStyles.pointerEvents;
                parentElement.style.position = originalStyles.position;
                parentElement.style.border = originalStyles.border;
                parentElement.style.boxShadow = originalStyles.boxShadow;
            };
        }
    }, [isLoading]);

    if (!isLoading) return null;

    const overlayStyle: React.CSSProperties = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
    };

    const spinnerStyle: React.CSSProperties = {
        width: "50px",
        height: "50px",
        border: "5px solid #ccc",
        borderTop: "5px solid #007bff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    };

    const spinnerContainerStyle: React.CSSProperties = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
    };

    return (
        <div ref={overlayRef} style={overlayStyle} data-testid="loading-overlay">
            <div style={spinnerContainerStyle}>
                <div style={spinnerStyle}></div>
            </div>
        </div>
    );
}

const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);