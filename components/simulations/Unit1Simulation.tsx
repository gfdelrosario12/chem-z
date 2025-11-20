import React, { useEffect, useState, useCallback } from "react";
import { createRoot, Root } from 'react-dom/client';
import PhaseChangeAdventure3D from "./components/subcomponents/lab 1/PhaseChangeAdventure3D";

// --- Helper function to copy styles from main window to popup ---
const copyStyles = (sourceDoc: Document, targetDoc: Document) => {
    Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
        try {
            if (styleSheet.cssRules) { // For inline <style> tags
                const newStyleEl = sourceDoc.createElement('style');
                Array.from(styleSheet.cssRules).forEach(rule => {
                    newStyleEl.appendChild(sourceDoc.createTextNode(rule.cssText));
                });
                targetDoc.head.appendChild(newStyleEl);
            } else if (styleSheet.href) { // For <link> tags
                const newLinkEl = sourceDoc.createElement('link');
                newLinkEl.rel = 'stylesheet';
                newLinkEl.href = styleSheet.href;
                targetDoc.head.appendChild(newLinkEl);
            }
        } catch (e) {
            console.warn("Could not copy one or more stylesheets. This may be due to CORS restrictions.", e);
        }
    });
    // Also copy tailwind dark/light mode class
    const sourceHtmlClassName = sourceDoc.documentElement.className;
    if (sourceHtmlClassName) {
        targetDoc.documentElement.className = sourceHtmlClassName;
    }
};


// --- Helper Function for Cross-Window React Rendering ---
const createReactRootInWindow = (newWindow: Window): Root => {
    // 1. Set up the basic HTML structure
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Phase Change Simulation</title>
          <style>
            body { margin: 0; padding: 0; background-color: #f0f0f0; }
            #root { width: 100vw; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="root"></div>
        </body>
        </html>
      `);
    newWindow.document.close();

    // 2. Copy styles from the main window
    copyStyles(document, newWindow.document);

    // 3. Get the root element and create the React root
    const rootElement = newWindow.document.getElementById('root') as HTMLElement;
    return createRoot(rootElement);
};

export default function Unit1Simulation() {
  const [labDone, setLabDone] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);

  // --- Logic to Launch Simulation in Separate Window ---
  const handleLaunchSimulation = useCallback(() => {
    if (isSimulationActive) return;

    const features = "width=1200,height=900,scrollbars=yes,resizable=yes";
    const newWindow = window.open("", "_blank", features);
    
    if (newWindow) {
      newWindow.focus(); // Explicitly focus the new window
      setPopup(newWindow);
      setIsSimulationActive(true);

      const root = createReactRootInWindow(newWindow);
      
      root.render(
        <React.StrictMode>
          <PhaseChangeAdventure3D />
        </React.StrictMode>
      ); 
      
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          setIsSimulationActive(false);
          root.unmount();
        }
      }, 500);

      const handleCleanup = () => {
        clearInterval(checkClosed);
        if (newWindow && !newWindow.closed) {
          newWindow.close();
        }
      };
      
      return handleCleanup;
    }
  }, [isSimulationActive]);

  // --- Effect for Message Listener (for completion sent from pop-up) ---
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
        if (event.data === "LAB_DONE") {
            setLabDone(true);
            setIsSimulationActive(false);
            if (popup && !popup.closed) {
                popup.close();
            }
        }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [popup]);
  
  // --- Component Render ---
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 p-4 bg-gray-800 rounded-xl shadow-lg">
          <h1 className="text-5xl font-bold text-purple-300 mb-2">🧪 Matter in Our Surroundings</h1>
          <p className="text-xl text-purple-200">Can Matter Change Its State? (Effect of Change of Temperature)</p>
        </div>

        {/* Main Control Area */}
        <div 
          className="bg-white rounded-xl shadow-2xl overflow-hidden p-8 text-center" 
          style={{ minHeight: "200px" }}
        >
          
          {/* 1. Launch Button */}
          {!labDone && !isSimulationActive && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-700 text-lg font-semibold mb-6">
                Start the Interactive Phase Change Lab:
              </p>
              <button 
                onClick={handleLaunchSimulation}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-200 text-xl"
              >
                🚀 Launch Simulation
              </button>
            </div>
          )}

          {/* 2. Active Status / Developer Tools */}
          {isSimulationActive && (
            <div className="flex flex-col items-center justify-center">
                <div className="text-xl text-gray-700 mb-4 font-bold">
                    Simulation Running in New Window...
                </div>
                <p className="text-gray-500 mb-6">
                    Close the pop-up to end the attempt, or wait for the system message.
                </p>
                
                {/* 3. Manual Done Button (for development/testing) */}
                <button
                    onClick={() => {
                        setLabDone(true);
                        setIsSimulationActive(false);
                        if(popup && !popup.closed) popup.close();
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow transition duration-200"
                >
                    Mark as Done (Dev Tool)
                </button>
            </div>
          )}
        </div>
        
        {/* Completion Message */}
        {labDone && (
          <div className="mt-6 bg-green-800 border-4 border-green-500 rounded-xl p-8 text-center shadow-2xl">
            <div className="text-green-300 font-bold text-3xl mb-4">
              ✅ Simulation Completed!
            </div>
            <p className="text-green-200 text-lg mb-4">
              Congratulations! You have successfully completed the Matter Phase Change simulation.
            </p>
            <p className="text-green-100">
              You can now proceed to the next activity or review your results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}