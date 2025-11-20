import React, { useEffect, useState, useCallback } from "react";
import { createRoot, Root } from 'react-dom/client';
import PhaseChangeAdventure3D from "./components/subcomponents/lab 2/PhaseChangeAdventure3D";

// Helper to copy styles from main window to popup
const copyStyles = (sourceDoc: Document, targetDoc: Document) => {
  Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
    try {
      if ((styleSheet as CSSStyleSheet).cssRules) {
        const newStyleEl = sourceDoc.createElement('style');
        Array.from((styleSheet as CSSStyleSheet).cssRules).forEach(rule => {
          newStyleEl.appendChild(sourceDoc.createTextNode((rule as CSSRule).cssText));
        });
        targetDoc.head.appendChild(newStyleEl);
      } else if ((styleSheet as CSSStyleSheet).href) {
        const newLinkEl = sourceDoc.createElement('link');
        newLinkEl.rel = 'stylesheet';
        newLinkEl.href = (styleSheet as CSSStyleSheet).href || '';
        targetDoc.head.appendChild(newLinkEl);
      }
    } catch (e) {
      // ignore cross-origin styles
    }
  });
  const sourceHtmlClassName = sourceDoc.documentElement.className;
  if (sourceHtmlClassName) targetDoc.documentElement.className = sourceHtmlClassName;
};

const createReactRootInWindow = (newWindow: Window): Root => {
  newWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Unit 2 — Solubility Lab</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; }
        #root { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="root"></div>
    </body>
    </html>
  `);
  newWindow.document.close();
  copyStyles(document, newWindow.document);
  const rootElement = newWindow.document.getElementById('root') as HTMLElement;
  return createRoot(rootElement);
};

export default function Unit2Simulation() {
  const [labDone, setLabDone] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);

  const handleLaunchSimulation = useCallback(() => {
    if (isSimulationActive) return;
    const features = "width=1200,height=900,scrollbars=yes,resizable=yes";
    const newWindow = window.open("", "_blank", features);
    if (newWindow) {
      newWindow.focus();
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
        if (newWindow && !newWindow.closed) newWindow.close();
      };

      return handleCleanup;
    }
  }, [isSimulationActive]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data === "LAB2_DONE" || event.data === "LAB_DONE") {
        setLabDone(true);
        setIsSimulationActive(false);
        if (popup && !popup.closed) popup.close();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [popup]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 p-4 bg-gray-800 rounded-xl shadow-lg">
          <h1 className="text-5xl font-bold text-purple-300 mb-2">🧪 Unit 2 — Solubility Lab</h1>
          <p className="text-xl text-purple-200">Solubility & Concentration — Interactive 3D Lab</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-8 text-center" style={{ minHeight: 200 }}>
          {!labDone && !isSimulationActive && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-700 text-lg font-semibold mb-6">Start the Unit 2 Interactive Lab:</p>
              <button onClick={handleLaunchSimulation} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-200 text-xl">
                🚀 Launch Unit 2 Lab
              </button>
            </div>
          )}

          {isSimulationActive && (
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl text-gray-700 mb-4 font-bold">Simulation running in a new window...</div>
              <p className="text-gray-500 mb-6">Close the popup to end the attempt or wait for completion.</p>
              <button onClick={() => { setLabDone(true); setIsSimulationActive(false); if (popup && !popup.closed) popup.close(); }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow">Mark as Done (Dev)</button>
            </div>
          )}
        </div>

        {labDone && (
          <div className="mt-6 bg-green-800 border-4 border-green-500 rounded-xl p-8 text-center shadow-2xl">
            <div className="text-green-300 font-bold text-3xl mb-4">✅ Lab Completed!</div>
            <p className="text-green-200 text-lg mb-4">You have completed the Unit 2 Solubility Lab.</p>
          </div>
        )}
      </div>
    </div>
  );
}