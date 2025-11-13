import styles from "../../styles/ui/Menu.module.css";

type MenuItemProps = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  toggleable?: boolean;
};

export default function MenuItem({
  label,
  checked = false,
  onChange,
  toggleable = true,
}: MenuItemProps) {
  return (
    <div className={styles.menuItem}>
      <label className={styles.menuItemLabel}>
        {toggleable && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
          />
        )}
        {label}
      </label>
    </div>
  );
}