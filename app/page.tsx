'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log('session:', session, status);
  
  useEffect(() => {
    if (status === 'authenticated') {
      if (!session?.user?.approved) return;

      if (session.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/user');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>;
  }

  if (status === 'authenticated' && !session?.user?.approved) {
    return (
      <div className="p-6">
        <h1 className="text font-bold mb-4">Access Denied</h1>
        <p>Your account is not approved yet. Please contact support.</p>
      </div>
    );
  }

  return null; // or a loader or blank screen
}
