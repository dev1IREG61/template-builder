// utils/storage.ts
const STORAGE_KEY = "email_template_designs";
const AUTO_SAVE_KEY = "unlayer_auto_save_v1";

export interface DesignData {
  design: any;
  createdAt: number;
  updatedAt: number;
  name: string;
  lastAutoSave?: number;
}

// Validate and sanitize design data
export const validateDesign = (design: any): any => {
  if (!design || typeof design !== "object") {
    console.warn("Invalid design data, creating default structure");
    return {
      body: {
        id: "body",
        rows: [],
        values: {
          backgroundColor: "#ffffff",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: "no-repeat",
            center: true,
          },
          contentWidth: "600px",
          contentAlign: "center",
          fontFamily: {
            label: "Arial",
            value: "arial,helvetica,sans-serif",
          },
          textColor: "#000000",
          linkColor: "#0000ee",
        },
      },
      schemaVersion: 16,
    };
  }

  // Ensure basic structure exists
  if (!design.body) {
    design.body = {
      id: "body",
      rows: [],
      values: {
        backgroundColor: "#ffffff",
        contentWidth: "600px",
        contentAlign: "center",
        fontFamily: {
          label: "Arial",
          value: "arial,helvetica,sans-serif",
        },
        textColor: "#000000",
        linkColor: "#0000ee",
      },
    };
  }

  // Ensure rows is an array
  if (!Array.isArray(design.body.rows)) {
    design.body.rows = [];
  }

  // Ensure values object exists
  if (!design.body.values || typeof design.body.values !== "object") {
    design.body.values = {
      backgroundColor: "#ffffff",
      contentWidth: "600px",
      contentAlign: "center",
      fontFamily: {
        label: "Arial",
        value: "arial,helvetica,sans-serif",
      },
      textColor: "#000000",
      linkColor: "#0000ee",
    };
  }

  // Ensure schemaVersion
  if (!design.schemaVersion) {
    design.schemaVersion = 16;
  }

  return design;
};

export const saveDesign = (name: string, design: any): void => {
  try {
    const designs = getDesigns();
    const now = Date.now();
    const validatedDesign = validateDesign(design);

    designs[name] = {
      design: validatedDesign,
      name,
      createdAt: designs[name]?.createdAt || now,
      updatedAt: now,
      lastAutoSave: now,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    console.log(`Design "${name}" saved successfully`);
  } catch (error) {
    console.error("Failed to save design:", error);
    throw new Error("Failed to save design. Storage might be full.");
  }
};

export const getDesigns = (): { [key: string]: DesignData } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const designs = JSON.parse(stored);

    // Migrate old designs without metadata
    Object.keys(designs).forEach((key) => {
      if (!designs[key].createdAt) {
        designs[key] = {
          design: validateDesign(designs[key]),
          name: key,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      } else {
        // Validate existing designs
        designs[key].design = validateDesign(designs[key].design);
      }
    });

    return designs;
  } catch (error) {
    console.error("Failed to load designs:", error);
    return {};
  }
};

export const getDesign = (name: string): any => {
  try {
    const designs = getDesigns();
    const designData = designs[name];
    if (designData && designData.design) {
      return validateDesign(designData.design);
    }
    return null;
  } catch (error) {
    console.error("Failed to load design:", error);
    return null;
  }
};

export const deleteDesign = (name: string): void => {
  try {
    const designs = getDesigns();
    delete designs[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch (error) {
    console.error("Failed to delete design:", error);
    throw new Error("Failed to delete design.");
  }
};

export const designExists = (name: string): boolean => {
  const designs = getDesigns();
  return name in designs;
};

export const renameDesign = (oldName: string, newName: string): void => {
  try {
    if (designExists(newName)) {
      throw new Error("Design with this name already exists");
    }

    const designs = getDesigns();
    if (!designs[oldName]) {
      throw new Error("Original design not found");
    }

    designs[newName] = {
      ...designs[oldName],
      name: newName,
      updatedAt: Date.now(),
    };

    delete designs[oldName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch (error) {
    console.error("Failed to rename design:", error);
    throw new Error("Failed to rename design.");
  }
};

// Auto-save functionality
export const saveAutoSave = (design: any): void => {
  try {
    const validatedDesign = validateDesign(design);
    localStorage.setItem(
      AUTO_SAVE_KEY,
      JSON.stringify({
        design: validatedDesign,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to auto-save:", error);
  }
};

export const getAutoSave = (): any => {
  try {
    const stored = localStorage.getItem(AUTO_SAVE_KEY);
    if (!stored) return null;

    const autoSaveData = JSON.parse(stored);
    if (autoSaveData && autoSaveData.design) {
      return validateDesign(autoSaveData.design);
    }
    return null;
  } catch (error) {
    console.error("Failed to load auto-save:", error);
    return null;
  }
};

export const clearAutoSave = (): void => {
  try {
    localStorage.removeItem(AUTO_SAVE_KEY);
  } catch (error) {
    console.error("Failed to clear auto-save:", error);
  }
};

export const exportDesigns = (): string => {
  try {
    const designs = getDesigns();
    return JSON.stringify(designs, null, 2);
  } catch (error) {
    console.error("Failed to export designs:", error);
    throw new Error("Failed to export designs.");
  }
};

export const importDesigns = (jsonData: string): void => {
  try {
    const importedDesigns = JSON.parse(jsonData);
    const existingDesigns = getDesigns();

    // Merge imported designs with existing ones
    const mergedDesigns = { ...existingDesigns };

    Object.keys(importedDesigns).forEach((key) => {
      let designName = key;
      let counter = 1;

      // Handle name conflicts
      while (mergedDesigns[designName]) {
        designName = `${key} (${counter})`;
        counter++;
      }

      mergedDesigns[designName] = {
        ...importedDesigns[key],
        name: designName,
        updatedAt: Date.now(),
        design: validateDesign(importedDesigns[key].design),
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedDesigns));
  } catch (error) {
    console.error("Failed to import designs:", error);
    throw new Error("Failed to import designs. Invalid file format.");
  }
};

export const getStorageUsage = (): {
  used: number;
  available: number;
  percentage: number;
} => {
  try {
    const designs = JSON.stringify(getDesigns());
    const used = new Blob([designs]).size;
    const available = 5 * 1024 * 1024; // Approximate localStorage limit (5MB)
    const percentage = Math.round((used / available) * 100);

    return { used, available, percentage };
  } catch (error) {
    return { used: 0, available: 0, percentage: 0 };
  }
};

export const duplicateDesign = (
  originalName: string,
  newName?: string
): void => {
  try {
    const designs = getDesigns();
    const originalDesign = designs[originalName];

    if (!originalDesign) {
      throw new Error("Original design not found");
    }

    let duplicateName = newName || `${originalName} (Copy)`;
    let counter = 1;

    // Handle name conflicts
    while (designExists(duplicateName)) {
      duplicateName = newName
        ? `${newName} (${counter})`
        : `${originalName} (Copy ${counter})`;
      counter++;
    }

    const now = Date.now();
    designs[duplicateName] = {
      ...originalDesign,
      name: duplicateName,
      createdAt: now,
      updatedAt: now,
      design: validateDesign(originalDesign.design),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch (error) {
    console.error("Failed to duplicate design:", error);
    throw new Error("Failed to duplicate design.");
  }
};

export const clearAllDesigns = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTO_SAVE_KEY);
  } catch (error) {
    console.error("Failed to clear designs:", error);
    throw new Error("Failed to clear all designs.");
  }
};

export const getDesignCount = (): number => {
  try {
    const designs = getDesigns();
    return Object.keys(designs).length;
  } catch (error) {
    return 0;
  }
};

export const searchDesigns = (query: string): { [key: string]: DesignData } => {
  try {
    const designs = getDesigns();
    const filtered: { [key: string]: DesignData } = {};

    const searchTerm = query.toLowerCase();

    Object.keys(designs).forEach((key) => {
      if (key.toLowerCase().includes(searchTerm)) {
        filtered[key] = designs[key];
      }
    });

    return filtered;
  } catch (error) {
    console.error("Failed to search designs:", error);
    return {};
  }
};
