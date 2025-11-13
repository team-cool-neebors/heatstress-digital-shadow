import styles from "../../styles/ui/UploadItemMenu.module.css";

type MenuUploadItemProps = {
  label: string;
  accept?: string;
  onFileSelect: (file: File) => void;
};

export default function MenuUploadItem({
  label,
  accept=".geojson,.tif,.qgz",
  onFileSelect,
}: MenuUploadItemProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExts = accept.split(",").map(ext => ext.trim().toLowerCase());
    const isValid = allowedExts.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      alert(`Please upload a valid file type (${accept})`);
      e.target.value = "";
      return;
    }

    onFileSelect(file);
  };

   return (
    <div className={styles.menuItem}>
      <label className={styles.menuItemLabel} htmlFor="fileUpload">
        {label}
      </label>
      <input
        id="fileUpload"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className={styles.menuFileInput}
      />
    </div>
  );
}
