import styles from "../../styles/ui/Menu.module.css";
import type { QgisLayerId } from "../../features/wms-overlay/lib/qgisLayers";

type Props = {
    label: string;
    checked: boolean;
    onToggle: (checked: boolean) => void;
    value: QgisLayerId | "";     // allow empty value
    onChange: (val: QgisLayerId | "") => void;
    options: ReadonlyArray<{ id: QgisLayerId; label: string }>;
};

export default function OverlayMenuItem({
    label,
    checked,
    onToggle,
    value,
    onChange,
    options,
}: Props) {
    return (
        <div className={styles.menuItem}>
            <label className={styles.menuItemLabel}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onToggle(e.target.checked)}
                />
                {label}
            </label>

            {checked && (
                <div className={styles.overlayItemDropdown}>
                    <label className={styles.labelDropdownOverlay}>
                        Overlay layer
                    </label>

                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value as QgisLayerId | "")}
                        className={styles.dropdownMenu}
                    >
                        {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
