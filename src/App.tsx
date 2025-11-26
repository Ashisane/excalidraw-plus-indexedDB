import { useState, useEffect, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./App.css";
import { dbService } from "./services/indexedDB";

function App() {
  const [selectedCanvas, setSelectedCanvas] = useState<any>(null);
  const [allCanvases, setAllCanvases] = useState<any[]>([]);
  const [fileName, setFileName] = useState("Untitled");
  const [isEditingName, setIsEditingName] = useState(false);
  const excalidrawAPI = useRef<any>(null);

  const [initialData, setInitialData] = useState(() => {
    const savedTheme = localStorage.getItem("excalidraw-theme") || "dark";
    return {
      appState: {
        theme: savedTheme as "light" | "dark",
      },
    };
  });

  useEffect(() => {
    const init = async () => {
      await dbService.init();
      await loadAllCanvases();
    };
    init();
  }, []);

  const loadAllCanvases = async () => {
    try {
      const canvases = await dbService.getAllDrawings();
      setAllCanvases(canvases.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to load canvases:', error);
    }
  };

  const handleSave = async () => {
    if (!excalidrawAPI.current) {
      console.error('Excalidraw API not available yet');
      return;
    }

    try {
      const elements = excalidrawAPI.current.getSceneElements();
      const appState = excalidrawAPI.current.getAppState();
      const files = excalidrawAPI.current.getFiles();

      const canvasToSave = {
        id: selectedCanvas.id,
        name: fileName,
        elements,
        appState,
        files,
        timestamp: Date.now(),
      };

      await dbService.saveDrawing(canvasToSave);
      setSelectedCanvas(canvasToSave);

      console.log(`✅ Saved "${fileName}"`);
    } catch (error) {
      console.error('❌ Failed to save:', error);
    }
  };

  const handleCreateNew = async () => {
    const untitledCanvases = allCanvases.filter(c => c.name.startsWith('Untitled'));
    const numbers = untitledCanvases
      .map(c => {
        const match = c.name.match(/Untitled\s*(\d+)?/);
        return match ? (match[1] ? parseInt(match[1]) : 1) : 0;
      })
      .filter(n => n > 0);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const newName = `Untitled ${nextNumber}`;
    const newId = newName.toLowerCase().replace(/\s+/g, '-');

    const newCanvas = {
      id: newId,
      name: newName,
      elements: [],
      appState: {
        theme: (localStorage.getItem("excalidraw-theme") || "dark") as "light" | "dark",
      },
      files: {},
      timestamp: Date.now(),
    };

    await dbService.saveDrawing(newCanvas);

    setFileName(newName);
    setSelectedCanvas(newCanvas);
    setInitialData({
      elements: newCanvas.elements,
      appState: newCanvas.appState,
      files: newCanvas.files,
    } as any);
  };

  const handleSelectCanvas = (canvas: any) => {
    setFileName(canvas.name);
    setSelectedCanvas(canvas);
    setInitialData({
      elements: canvas.elements,
      appState: canvas.appState,
      files: canvas.files,
    } as any);
  };

  const handleDelete = async (canvasId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this canvas?')) {
      await dbService.deleteDrawing(canvasId);
      await loadAllCanvases();
    }
  };

  const handleGoHome = async () => {
    setSelectedCanvas(null);
    await loadAllCanvases();
  };

  const handleRename = async (newName: string) => {
    if (!selectedCanvas || !newName.trim()) return;

    try {
      const updatedCanvas = {
        ...selectedCanvas,
        name: newName,
        timestamp: Date.now(),
      };

      await dbService.saveDrawing(updatedCanvas);
      setSelectedCanvas(updatedCanvas);
      setFileName(newName);

      console.log(`✅ Renamed to "${newName}"`);
    } catch (error) {
      console.error('❌ Failed to rename:', error);
    }
  };

  useEffect(() => {
    if (!selectedCanvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleSave();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [selectedCanvas]);

  if (!selectedCanvas) {
    return (
      <div className="canvas-selector">
        <div className="selector-header">
          <h1>Select a Canvas</h1>
          <p>Choose an existing canvas or create a new one</p>
        </div>

        <div className="canvas-grid">
          <div className="canvas-card new-canvas-card" onClick={handleCreateNew}>
            <div className="new-canvas-icon">+</div>
            <div className="canvas-name">New Canvas</div>
          </div>

          {allCanvases.map((canvas) => (
            <div
              key={canvas.id}
              className="canvas-card"
              onClick={() => handleSelectCanvas(canvas)}
            >
              <div className="canvas-preview">
                <svg viewBox="0 0 100 100" className="canvas-icon">
                  <rect x="10" y="10" width="80" height="80" fill="currentColor" opacity="0.1" rx="4" />
                  <path d="M 20 30 L 50 50 L 80 25" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <div className="canvas-info">
                <div className="canvas-name">{canvas.name}</div>
                <div className="canvas-meta">
                  <div className="canvas-timestamp">
                    {new Date(canvas.timestamp).toLocaleDateString()} {new Date(canvas.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <button
                    className="delete-button"
                    onClick={(e) => handleDelete(canvas.id, e)}
                    title="Delete canvas"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="filename-container">
        <button
          className="home-button"
          onClick={handleGoHome}
          title="Back to canvas selector"
        >
          ← Home
        </button>

        {isEditingName ? (
          <input
            type="text"
            className="filename-input"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onBlur={() => {
              setIsEditingName(false);
              handleRename(fileName);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingName(false);
                handleRename(fileName);
              }
            }}
            autoFocus
          />
        ) : (
          <div
            className="filename-display"
            onClick={() => setIsEditingName(true)}
            title="Click to rename"
          >
            {fileName}
          </div>
        )}
      </div>

      <Excalidraw
        excalidrawAPI={(api) => (excalidrawAPI.current = api)}
        initialData={initialData as any}
        onChange={(_elements, appState) => {
          if (appState.theme) {
            localStorage.setItem("excalidraw-theme", appState.theme);
          }
        }}
      />
    </div>
  );
}

export default App;
