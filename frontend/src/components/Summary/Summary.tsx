import styles from './Summary.module.css';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

interface Props {
  totalRecords: number;
  importedCount: number;
  skippedCount: number;
}

export default function Summary({ totalRecords, importedCount, skippedCount }: Props) {
  return (
    <div className={`${styles.grid} animate-fade-in`}>
      <div className={`${styles.card} ${styles.total}`}>
        <div className={styles.cardIcon}><FileText size={20} /></div>
        <div className={styles.cardContent}>
          <span className={styles.cardValue}>{totalRecords}</span>
          <span className={styles.cardLabel}>Total Records</span>
        </div>
      </div>

      <div className={`${styles.card} ${styles.success}`}>
        <div className={styles.cardIcon}><CheckCircle2 size={20} /></div>
        <div className={styles.cardContent}>
          <span className={styles.cardValue}>{importedCount}</span>
          <span className={styles.cardLabel}>Successfully Imported</span>
        </div>
      </div>

      <div className={`${styles.card} ${styles.skipped}`}>
        <div className={styles.cardIcon}><XCircle size={20} /></div>
        <div className={styles.cardContent}>
          <span className={styles.cardValue}>{skippedCount}</span>
          <span className={styles.cardLabel}>Skipped Records</span>
        </div>
      </div>
    </div>
  );
}
