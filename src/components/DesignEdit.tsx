// DesignEdit.tsx
import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmailEditor, { EditorRef } from "react-email-editor";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  saveDesign,
  getDesigns,
  deleteDesign,
  getDesign,
} from "../utils/storage";

const defaultDesign = {
  body: {
    id: "body",
    rows: [
      {
        id: "row_1",
        cells: [1],
        columns: [
          {
            contents: [],
            values: {},
          },
        ],
        values: {},
      },
    ],
    values: {
      backgroundColor: "#ffffff",
      contentWidth: "600px",
      contentAlign: "center",
      fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
      textColor: "#000000",
      linkColor: "#0000ee",
    },
  },
  schemaVersion: 16,
};

// ---------- Styled Components ----------
const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
`;

const Bar = styled.div`
  flex: none;
  background: #0879a1;
  color: #fff;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-height: 60px;

  h1 {
    flex: 1;
    font-size: 20px;
    margin: 0;
    font-weight: 600;
  }

  .button-group {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  button {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    background-color: rgba(255, 255, 255, 0.2);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    &.primary {
      background-color: #fff;
      color: #667eea;
      border: none;

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }

  a {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }
  }
`;

// const SidebarToggleButton = styled.button<{ isActive: boolean }>`
//   padding: 8px 16px;
//   margin-top: 3px;
//   margin-bottom: 3px;
//   font-size: 14px;
//   font-weight: 500;
//   background-color: ${({ isActive }) =>
//     isActive ? "#667eea" : "rgba(255, 255, 255, 0.2)"};
//   color: ${({ isActive }) => (isActive ? "#fff" : "rgba(255, 255, 255, 0.8)")};
//   border: 1px solid rgba(255, 255, 255, 0.3);
//   border-radius: 6px;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   margin-left: 8px;

//   &:hover {
//     background-color: ${({ isActive }) =>
//       isActive ? "#5a67d8" : "rgba(255, 255, 255, 0.3)"};
//     transform: translateY(-1px);
//   }

//   &:focus {
//     outline: none;
//     box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.5);
//   }
// `;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const OverlayText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  min-width: 400px;

  h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 20px;
  }

  input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 16px;
    margin-bottom: 20px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }

  .modal-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &.cancel {
      background: #f5f5f5;
      color: #666;

      &:hover {
        background: #e8e8e8;
      }
    }

    &.save {
      background: #667eea;
      color: white;

      &:hover {
        background: #5a67d8;
      }
    }
  }
`;

// ---------- Component ----------
const DesignEdit: React.FC = () => {
  const emailEditorRef = useRef<EditorRef | null>(null);
  const isLoadingRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  const savedListenerRef = useRef<((...args: any[]) => void) | null>(null);
  const navigate = useNavigate();
  const { designId } = useParams();

  // ---------- Constants ----------

  // Unique auto-save key per design
  const AUTO_SAVE_KEY = designId
    ? `unlayer_auto_save_${designId}`
    : "unlayer_auto_save_new";

  const [isExporting, setIsExporting] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [designName, setDesignName] = useState("");
  const [currentDesignName, setCurrentDesignName] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  // const [dockPosition, setDockPosition] = useState<"left" | "right">("left");

  // Validate and sanitize design data
  const validateDesign = (design: any): any => {
    if (!design || typeof design !== "object") {
      console.warn("Invalid design data, creating default structure");
      return defaultDesign; // <-- use defaultDesign
    }

    if (!design.body) design.body = defaultDesign.body;
    if (!Array.isArray(design.body.rows))
      design.body.rows = defaultDesign.body.rows;
    if (!design.body.values || typeof design.body.values !== "object")
      design.body.values = defaultDesign.body.values;
    if (!design.schemaVersion)
      design.schemaVersion = defaultDesign.schemaVersion;

    return design;
  };

  // Auto-save to temporary storage
  const autoSave = () => {
    if (!isEditorReady) return;

    const editor = emailEditorRef.current?.editor as any;
    if (!editor) return;

    try {
      editor.saveDesign((design: any) => {
        try {
          if (design && typeof design === "object") {
            localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(design));
          }
        } catch (err) {
          console.error("Auto-save failed", err);
        }
      });
    } catch (err) {
      console.warn("Auto-save failed", err);
    }
  };

  // Debounced auto-save
  const scheduleAutoSave = () => {
    if (isLoadingRef.current || !isEditorReady) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      autoSave();
      debounceTimerRef.current = null;
    }, 400);
  };

  // Called when the editor is ready
  const handleEditorReady = () => {
    console.log("Editor ready, loading design...");
    const editor = (emailEditorRef.current?.editor as any) || null;
    if (!editor) {
      console.error("Editor not available");
      return;
    }

    setIsEditorReady(true);

    const handler = () => {
      scheduleAutoSave();
    };
    savedListenerRef.current = handler;

    try {
      editor.addEventListener("design:updated", handler);
      editor.addEventListener("editor:change", handler);
    } catch (e) {
      console.warn("Could not attach editor event listeners", e);
    }

    isLoadingRef.current = true;

    // Add a small delay to ensure editor is fully ready
    setTimeout(() => {
      try {
        if (designId && designId !== "new") {
          console.log("Loading existing design:", designId);
          // Load existing design using the proper getDesign function
          const designData = getDesign(designId);

          if (designData) {
            console.log("Design data found:", designData);
            const validatedDesign = validateDesign(designData);
            setCurrentDesignName(designId);

            editor.loadDesign(validatedDesign);
          } else {
            console.warn("Design not found, trying auto-save fallback");
            // Fallback to auto-save if designId invalid
            const autoSaved = localStorage.getItem(AUTO_SAVE_KEY);
            if (autoSaved) {
              try {
                const parsedDesign = JSON.parse(autoSaved);
                const validatedDesign = validateDesign(parsedDesign);
                editor.loadDesign(validatedDesign);
              } catch (err) {
                console.error("Failed to parse auto-saved design", err);
              }
            }
          }
        } else {
          console.log("Creating new design or loading auto-save");
          // Load auto-saved design if available
          const autoSaved = localStorage.getItem(AUTO_SAVE_KEY);
          if (autoSaved) {
            try {
              const parsedDesign = JSON.parse(autoSaved);
              const validatedDesign = validateDesign(parsedDesign);
              editor.loadDesign(validatedDesign);
            } catch (err) {
              console.error("Failed to load auto-saved design", err);
              // Load default template
              editor.loadDesign(validateDesign(null));
            }
          } else {
            // Load default template
            editor.loadDesign(validateDesign(null));
          }
        }
      } catch (error) {
        console.error("Error loading design:", error);
        // Load default template as fallback
        try {
          editor.loadDesign(validateDesign(null));
        } catch (fallbackError) {
          console.error("Failed to load default template:", fallbackError);
        }
      }

      setTimeout(() => {
        isLoadingRef.current = false;
        console.log("Design loading completed");
      }, 1000);
    }, 500);
  };

  // Save design with name
  const handleSaveDesign = () => {
    if (!designName.trim()) return;

    const editor = emailEditorRef.current?.editor as any;
    if (!editor) return;

    editor.saveDesign((design: any) => {
      try {
        const validatedDesign = validateDesign(design);
        saveDesign(designName.trim(), validatedDesign);
        setCurrentDesignName(designName.trim());
        setShowSaveModal(false);
        setDesignName("");
        // Clear auto-save after successful save
        localStorage.removeItem(AUTO_SAVE_KEY);
        alert("Design saved successfully!");
      } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save design. Please try again.");
      }
    });
  };

  // Start new design
  const startNewDesign = () => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    navigate("/dashboard/design/new");
    window.location.reload(); // Force fresh start
  };

  // Export HTML
  const exportHtml = () => {
    if (!isEditorReady) return;

    emailEditorRef.current?.editor?.exportHtml((data: any) => {
      const { html } = data;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentDesignName || "design"}.html`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Export PDF
  const exportPdf = () => {
    if (!isEditorReady) return;

    setOverlayText("Saving PDF...");
    setIsExporting(true);

    emailEditorRef.current?.editor?.exportHtml(async (data: any) => {
      try {
        const { html } = data;

        const temp = document.createElement("div");
        temp.innerHTML = html;

        const imgs = temp.querySelectorAll("img");
        imgs.forEach((img) => {
          img.setAttribute("crossorigin", "anonymous");
        });

        document.body.appendChild(temp);

        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvas = await html2canvas(temp, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("design.pdf");
        document.body.removeChild(temp);
      } catch (error) {
        console.error("PDF export failed:", error);
        alert("Failed to export PDF. Please try again.");
      } finally {
        setIsExporting(false);
      }
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      if (savedListenerRef.current) {
        try {
          const editor = emailEditorRef.current?.editor as any;
          if (editor) {
            editor.removeEventListener(
              "design:updated",
              savedListenerRef.current
            );
            editor.removeEventListener(
              "editor:change",
              savedListenerRef.current
            );
          }
        } catch (e) {
          console.warn("Could not remove event listeners", e);
        }
      }
    };
  }, []);

  return (
    <Container>
      <Bar>
        <h1>
          {currentDesignName
            ? `Editing: ${currentDesignName}`
            : "Email Template Builder"}
        </h1>
        <div className="button-group">
          <Link to="/dashboard">← Dashboard</Link>
          <button onClick={startNewDesign}>New Design</button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="primary"
            disabled={!isEditorReady}
          >
            Save Design
          </button>
          <button onClick={exportHtml} disabled={!isEditorReady}>
            Export HTML
          </button>
          <button onClick={exportPdf} disabled={!isEditorReady}>
            Export PDF
          </button>
        </div>
      </Bar>

      {/* <div className="absolute top-4 right-4 z-50 flex gap-2 ">
        {dockPosition === "left" && (
          <SidebarToggleButton
            isActive={true} // Active color because left is currently docked
            onClick={() => setDockPosition("right")}
          >
            Sidebar Right
          </SidebarToggleButton>
        )}

        {dockPosition === "right" && (
          <SidebarToggleButton
            isActive={true} // Active color because right is currently docked
            onClick={() => setDockPosition("left")}
          >
            Sidebar Left
          </SidebarToggleButton>
        )}
      </div> */}

      {/* Email Editor */}

      <EmailEditor
        ref={emailEditorRef}
        onLoad={handleEditorReady}
        options={{
          projectId: 12345,
          appearance: {
            theme: "modern_light",
          },
        }}
        style={{ width: "100%", height: "100%" }}
      />

      {isExporting && (
        <Overlay>
          <Spinner />
          <OverlayText>{overlayText}</OverlayText>
        </Overlay>
      )}

      {showSaveModal && (
        <Modal>
          <ModalContent>
            <h3>Save Design</h3>
            <input
              type="text"
              placeholder="Enter design name..."
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSaveDesign()}
              autoFocus
            />
            <div className="modal-buttons">
              <button
                className="cancel"
                onClick={() => {
                  setShowSaveModal(false);
                  setDesignName("");
                }}
              >
                Cancel
              </button>
              <button
                className="save"
                onClick={handleSaveDesign}
                disabled={!designName.trim()}
              >
                Save Design
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default DesignEdit;
