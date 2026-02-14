import Sidebar from '@/components/Sidebar';
import MarkdownViewer from '@/components/MarkdownViewer';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex h-screen w-screen bg-black text-gray-200 overflow-hidden">
      <Sidebar />
      <MarkdownViewer filePath={params.file || ''} />
    </main>
  );
}
