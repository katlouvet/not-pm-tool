import { notFound } from "next/navigation";
import { compileEmailData, defaultEmailCopy } from "@/lib/email-data";
import { requireTeam } from "@/lib/auth";
import { EmailPreview } from "./email-preview";

export const dynamic = "force-dynamic";

export default async function EmailPreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await requireTeam();
  const { projectId } = await params;

  const data = await compileEmailData(projectId);
  if (!data) notFound();

  const initialCopy = defaultEmailCopy(data);

  return <EmailPreview projectId={projectId} data={data} initialCopy={initialCopy} />;
}
