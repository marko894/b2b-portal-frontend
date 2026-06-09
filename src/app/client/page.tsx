'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/client/catalog'); }, [router]);
  return null;
}
