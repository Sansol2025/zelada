import { redirect } from "next/navigation";

export default async function IngresoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/api/access/activate?token=${encodeURIComponent(token)}`);
}
