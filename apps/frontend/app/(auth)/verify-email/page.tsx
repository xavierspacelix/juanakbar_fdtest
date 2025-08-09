"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { verifyEmail } from "@/services/auth.service";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then((res) => {
          if (res.success) {
            toast.success("Email berhasil diverifikasi");
            router.push("/login");
          } else {
            toast.error(res.message);
          }
        })
        .catch(() => toast.error("Terjadi kesalahan"))
        .finally(() => setLoading(false));
    }
  }, [token, router]);

  if (loading) return <p className="text-center mt-10">Verifying...</p>;
  return null;
}
