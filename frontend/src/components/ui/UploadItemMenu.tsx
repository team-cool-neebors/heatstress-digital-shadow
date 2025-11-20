import React, { useState } from "react";
import styles from "../../styles/ui/UploadItemMenu.module.css";
import Button from "./Button";

type MenuUploadItemProps = {
  label: string;
  accept?: string;
  categories?: string[];
  onUpload: (file: File, category: string) => void;
};

export default function MenuUploadItem({
  label,
  accept = ".geojson,.tif,.qgz",
  categories = ["Wind Map", "PET Map", "Weather Map"],
  onUpload,
}: MenuUploadItemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedCategory) {
      alert("Please select a category before choosing a file.");
      e.target.value = "";
      return;
    }

    const allowedExts = accept.split(",").map(ext => ext.trim().toLowerCase());
    const isValid = allowedExts.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      alert(`Please upload a valid file (${accept})`);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    if (!selectedCategory || !selectedFile) {
      alert("Please select a category and choose a file first.");
      return;
    }

    onUpload(selectedFile, selectedCategory);
    setSelectedFile(null);
  };

  return (
    <div className={styles.menuItem}>
      <div className={styles.menuItemLabel}>{label}</div>

      <div className={styles.menuUploadRowHorizontal}>
        <select
          className={styles.menuSelect}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Map</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          id="fileUpload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={styles.hiddenFileInput}
          disabled={!selectedCategory}
        />

        <label
          htmlFor="fileUpload"
          className={`${styles.customFileButton} ${!selectedCategory ? styles.disabledButton : ""}`}
        >
          Choose File
        </label>
      </div>

      {selectedFile && (
        <div className={styles.menuFileInfoRow}>
          <span className={styles.menuFileName}>{selectedFile.name}</span>
          <Button
            label="Upload"
            onClick={handleUploadClick}
            disabled={!selectedCategory || !selectedFile}
          />
        </div>
      )}
    </div>
  );
}
