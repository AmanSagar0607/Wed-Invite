import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteRenderer } from "@/components/invite-renderer";
import { getPublishedInvite } from "@/lib/invites";
import { getThemeById } from "@/lib/themes";

export const dynamic = "force-dynamic";

type InvitePageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string | string[] }> };

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const invite = await getPublishedInvite(slug);
    if (!invite) return { title: "Invitation not found" };
    const names = `${invite.couple.bride} & ${invite.couple.groom}`;
    const description = `${invite.couple.tagline} — join us on ${invite.weddingDate}.`;
    return {
      title: names,
      description,
      openGraph: { title: names, description, type: "website", images: invite.heroImage ? [{ url: invite.heroImage }] : undefined },
      twitter: { card: "summary_large_image", title: names, description, images: invite.heroImage ? [invite.heroImage] : undefined },
    };
  } catch {
    return { title: "Invitation unavailable" };
  }
}

export default async function PublicInvitePage({ params, searchParams }: InvitePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = Array.isArray(query.preview) ? query.preview[0] : query.preview;
  try {
    const invite = await getPublishedInvite(slug);
    if (!invite) notFound();
    return <InviteRenderer invite={preview ? { ...invite, theme: getThemeById(preview) } : invite} initialNow={Date.now()} />;
  } catch {
    notFound();
  }
}
