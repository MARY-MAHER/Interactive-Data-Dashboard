import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { auth, db } from '../lib/firebase';

export interface UserCredentialsProfile {
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserCredentialsProfile | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_CREDENTIALS = 'users_credentials';

function normalizeEmailForDocId(email: string): string {
  return email.trim().toLowerCase();
}

function mapProfileFromDoc(data: Record<string, unknown>, fallbackLabel: string): UserCredentialsProfile {
  const rawName = data.name ?? data.displayName ?? data.fullName;
  const name =
    typeof rawName === 'string' && rawName.trim()
      ? rawName.trim()
      : fallbackLabel;
  const rawRole = data.role;
  const role = typeof rawRole === 'string' ? rawRole.trim() : '';
  return { name, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserCredentialsProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => profile?.role === 'admin', [profile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.email) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const emailId = normalizeEmailForDocId(firebaseUser.email);

      try {
        const credSnap = await getDoc(doc(db, USERS_CREDENTIALS, emailId));

        if (!credSnap.exists()) {
          toast.error('عفواً، هذا الحساب غير مصرح له بالدخول');
          await firebaseSignOut(auth);
          setUser(null);
          setProfile(null);
          return;
        }

        const mapped = mapProfileFromDoc(credSnap.data() as Record<string, unknown>, emailId.split('@')[0] || 'مستخدم');
        setUser(firebaseUser);
        setProfile(mapped);
      } catch (error) {
        console.error('users_credentials fetch error:', error);
        toast.error('تعذر التحقق من بيانات الحساب. حاول مرة أخرى.');
        await firebaseSignOut(auth);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign-in failed';
      throw new Error(message);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign-up failed';
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign-out failed';
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, profile, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
