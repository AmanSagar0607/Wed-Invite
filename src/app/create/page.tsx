import { InviteBuilder } from "@/components/invite-builder";

type CreatePageProps = { searchParams: Promise<{ theme?: string | string[] }> };

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const params = await searchParams;
  const theme = Array.isArray(params.theme) ? params.theme[0] : params.theme;
  return <InviteBuilder initialThemeId={theme} />;
}
