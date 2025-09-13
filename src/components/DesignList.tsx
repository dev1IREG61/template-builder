// DesignList.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getDesigns, deleteDesign, duplicateDesign } from "../utils/storage";

// ---------- Styled Components ----------
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Header = styled.div`
  background: #0879a1;
  color: white;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h2 {
    margin: 0;
    color: #333;
    font-size: 1.8rem;
    font-weight: 600;
  }
`;

const NewDesignButton = styled(Link)`
  background: #0879a1;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
  }

  &::before {
    content: "+";
    font-size: 20px;
    font-weight: bold;
  }
`;

const DesignGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const DesignCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e1e5e9;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .preview-placeholder {
    color: #666;
    font-size: 48px;
    opacity: 0.3;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: 15px;
`;

const DesignTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  word-break: break-word;
  line-height: 1.3;
`;

const DesignMeta = styled.div`
  color: #666;
  font-size: 12px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${DesignCard}:hover & {
    opacity: 1;
  }

  button,
  a {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    color: #666;
    backdrop-filter: blur(4px);

    &:hover {
      background: rgba(255, 255, 255, 1);
      color: #333;
    }
  }

  .edit-btn {
    &:hover {
      background-color: #667eea;
      color: white;
    }
  }

  .delete-btn {
    &:hover {
      background-color: #e53e3e;
      color: white;
    }
  }

  .duplicate-btn {
    &:hover {
      background-color: #38a169;
      color: white;
    }
  }
`;

const CardFooter = styled.div`
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .primary-action {
    background-color: #667eea;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      background-color: #5a67d8;
    }
  }

  .secondary-actions {
    display: flex;
    gap: 8px;

    button {
      background: none;
      border: none;
      color: #666;
      font-size: 12px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 3px;
      transition: all 0.3s ease;

      &:hover {
        background: #e8e8e8;
        color: #333;
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #666;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #333;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 30px;
    line-height: 1.6;
  }
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
  max-width: 400px;
  width: 90%;

  h3 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.3rem;
  }

  p {
    color: #666;
    margin-bottom: 25px;
    line-height: 1.5;
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

    &.delete {
      background: #e53e3e;
      color: white;

      &:hover {
        background: #c53030;
      }
    }
  }
`;

// ---------- Component ----------
const DesignList: React.FC = () => {
  const [designs, setDesigns] = useState<{ [key: string]: any }>({});
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    designName: string;
  }>({ show: false, designName: "" });

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = () => {
    const savedDesigns = getDesigns();
    setDesigns(savedDesigns);
  };

  const handleDelete = (designName: string) => {
    setDeleteModal({ show: true, designName });
  };

  const handleDuplicate = (designName: string) => {
    try {
      duplicateDesign(designName);
      loadDesigns();
      alert("Design duplicated successfully!");
    } catch (error) {
      alert("Failed to duplicate design: " + (error as Error).message);
    }
  };

  const confirmDelete = () => {
    deleteDesign(deleteModal.designName);
    loadDesigns();
    setDeleteModal({ show: false, designName: "" });
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreviewImage = (design: any): string => {
    try {
      if (design?.design?.body?.rows) {
        for (const row of design.design.body.rows) {
          if (row.columns) {
            for (const column of row.columns) {
              if (column.contents) {
                for (const content of column.contents) {
                  if (content.type === "image" && content.values?.src?.url) {
                    return content.values.src.url;
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Could not extract preview image", error);
    }
    return "";
  };

  const designList = Object.entries(designs);

  return (
    <Container>
      <Header>
        <h1>Email Template Dashboard</h1>
        <p>Create, manage, and export beautiful email templates</p>
      </Header>

      <Content>
        <TopBar>
          <h2>My Designs ({designList.length})</h2>
          <NewDesignButton to="/dashboard/design/new">
            Create New Design
          </NewDesignButton>
        </TopBar>

        {designList.length === 0 ? (
          <EmptyState>
            <div className="empty-icon">📧</div>
            <h3>No designs yet</h3>
            <p>
              Start creating beautiful email templates by clicking the button
              above.
              <br />
              Your designs will appear here once saved.
            </p>
            <NewDesignButton to="/dashboard/design/new">
              Create Your First Design
            </NewDesignButton>
          </EmptyState>
        ) : (
          <DesignGrid>
            {designList.map(([name, design]) => {
              const previewImage = getPreviewImage(design);

              return (
                <DesignCard key={name}>
                  <PreviewContainer>
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={name}
                        className="preview-image"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="preview-placeholder">📧</div>
                    )}

                    <ActionButtons>
                      <Link
                        to={`/dashboard/design/${encodeURIComponent(name)}`}
                        className="edit-btn"
                        title="Edit"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleDuplicate(name)}
                        className="duplicate-btn"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDelete(name)}
                        className="delete-btn"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </ActionButtons>
                  </PreviewContainer>

                  <CardContent>
                    <DesignTitle>{name}</DesignTitle>
                    <DesignMeta>
                      <span>
                        📅 {formatDate(design.updatedAt || design.createdAt)}
                      </span>
                    </DesignMeta>
                  </CardContent>

                  <CardFooter>
                    <Link
                      to={`/dashboard/design/${encodeURIComponent(name)}`}
                      className="primary-action"
                    >
                      Edit
                    </Link>
                    <div className="secondary-actions">
                      <button onClick={() => handleDuplicate(name)}>
                        Duplicate
                      </button>
                    </div>
                  </CardFooter>
                </DesignCard>
              );
            })}
          </DesignGrid>
        )}
      </Content>

      {deleteModal.show && (
        <Modal>
          <ModalContent>
            <h3>Delete Design</h3>
            <p>
              Are you sure you want to delete "
              <strong>{deleteModal.designName}</strong>"? This action cannot be
              undone.
            </p>
            <div className="modal-buttons">
              <button
                className="cancel"
                onClick={() => setDeleteModal({ show: false, designName: "" })}
              >
                Cancel
              </button>
              <button className="delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default DesignList;
