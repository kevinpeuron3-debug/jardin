import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Plot, Planting, Harvest, GardenTask } from '../types/garden';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Configure persistence
try {
  setPersistence(auth, browserLocalPersistence);
} catch {
  // Ignore in environments where indexedDB/local is restricted
}

// 1. Connection Validation as mandated by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firebase Firestore connection verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Verify configuration and network.');
    }
  }
}
testConnection();

// 2. Strict Error Handling conforming to Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Auth Helpers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };

// 4. Reactive Listeners (Subscription pattern)

export function subscribePlots(userId: string, onUpdate: (plots: Plot[]) => void) {
  const plotsRef = collection(db, 'plots');
  const q = query(plotsRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const list: Plot[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Plot);
    });
    // Sort by name or createdAt
    list.sort((a, b) => a.name.localeCompare(b.name));
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'plots');
  });
}

export function subscribePlantings(userId: string, onUpdate: (plantings: Planting[]) => void) {
  const plantingsRef = collection(db, 'plantings');
  const q = query(plantingsRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const list: Planting[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Planting);
    });
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'plantings');
  });
}

export function subscribeHarvests(userId: string, onUpdate: (harvests: Harvest[]) => void) {
  const harvestsRef = collection(db, 'harvests');
  const q = query(harvestsRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const list: Harvest[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Harvest);
    });
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'harvests');
  });
}

export function subscribeGardenTasks(userId: string, onUpdate: (tasks: GardenTask[]) => void) {
  const tasksRef = collection(db, 'gardenTasks');
  const q = query(tasksRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const list: GardenTask[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as GardenTask);
    });
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'gardenTasks');
  });
}

// 5. CRUD Operations

// --- Plots ---
export async function savePlot(plot: Plot): Promise<void> {
  const path = `plots/${plot.id}`;
  try {
    await setDoc(doc(db, 'plots', plot.id), plot, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removePlot(plotId: string): Promise<void> {
  const path = `plots/${plotId}`;
  try {
    await deleteDoc(doc(db, 'plots', plotId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Plantings ---
export async function savePlanting(planting: Planting): Promise<void> {
  const path = `plantings/${planting.id}`;
  try {
    await setDoc(doc(db, 'plantings', planting.id), planting, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updatePlantingStatus(plantingId: string, status: Planting['status']): Promise<void> {
  const path = `plantings/${plantingId}`;
  try {
    await updateDoc(doc(db, 'plantings', plantingId), {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function recordWatering(plantingId: string): Promise<void> {
  const path = `plantings/${plantingId}`;
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, 'plantings', plantingId), {
      lastWatered: now,
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removePlanting(plantingId: string): Promise<void> {
  const path = `plantings/${plantingId}`;
  try {
    await deleteDoc(doc(db, 'plantings', plantingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Harvests ---
export async function saveHarvest(harvest: Harvest): Promise<void> {
  const path = `harvests/${harvest.id}`;
  try {
    await setDoc(doc(db, 'harvests', harvest.id), harvest, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeHarvest(harvestId: string): Promise<void> {
  const path = `harvests/${harvestId}`;
  try {
    await deleteDoc(doc(db, 'harvests', harvestId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Garden Tasks ---
export async function saveGardenTask(task: GardenTask): Promise<void> {
  const path = `gardenTasks/${task.id}`;
  try {
    await setDoc(doc(db, 'gardenTasks', task.id), task, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleGardenTask(task: GardenTask): Promise<void> {
  const path = `gardenTasks/${task.id}`;
  const nextCompleted = !task.completed;
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, 'gardenTasks', task.id), {
      completed: nextCompleted,
      completedAt: nextCompleted ? now : '',
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeGardenTask(taskId: string): Promise<void> {
  const path = `gardenTasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'gardenTasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
