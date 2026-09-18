import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getStagePromotion } from './studentUtils';

const FIRESTORE_BATCH_LIMIT = 500;

export interface PromoteStudentsResult {
  promoted: number;
  archived: number;
  skipped: number;
}

export async function promoteAllActiveStudents(): Promise<PromoteStudentsResult> {
  const q = query(
    collection(db, 'students'),
    where('status', 'in', ['Active', 'active', ''])
  );
  const snapshot = await getDocs(q);

  let promoted = 0;
  let archived = 0;
  let skipped = 0;
  let batch = writeBatch(db);
  let operationsInBatch = 0;

  const flushBatch = async () => {
    if (operationsInBatch === 0) return;
    await batch.commit();
    batch = writeBatch(db);
    operationsInBatch = 0;
  };

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const promotion = getStagePromotion(data.stage || '');

    if (promotion.action === 'skip') {
      skipped += 1;
      continue;
    }

    const studentRef = doc(db, 'students', docSnap.id);

    if (promotion.action === 'archive') {
      batch.update(studentRef, {
        status: 'Archived',
        deletedAt: serverTimestamp(),
        promotionNote: 'تخرج بعد سادسة ابتدائي — ترقية العام الجديد',
      });
      archived += 1;
    } else {
      batch.update(studentRef, {
        stage: promotion.nextStage,
        lastPromotedAt: serverTimestamp(),
      });
      promoted += 1;
    }

    operationsInBatch += 1;
    if (operationsInBatch >= FIRESTORE_BATCH_LIMIT) {
      await flushBatch();
    }
  }

  await flushBatch();

  return { promoted, archived, skipped };
}
