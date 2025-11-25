import styles from "../../styles/ui/Menu.module.css";

type MenuItemProps = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  toggleable?: boolean;
  children?: React.ReactNode;
};

export default function MenuItem({
  label,
  checked = false,
  onChange,
  toggleable = true,
  children,
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
      {children && (
        <div className={styles.subItem}>
          {children}
        </div>
      )}
    </div>
  );
}