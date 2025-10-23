"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default trading pair
    router.push("/trade/BTC_USDT?type=spot");
  }, [router]);

  return null;
}
