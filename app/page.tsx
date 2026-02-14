import Sidebar from '@/components/Sidebar';
import MarkdownViewer from '@/components/MarkdownViewer';

export const dynamic = 'force-dynamic';

export default function Home({
  searchParams,
}: {
  searchParams: { file?: string };
}) {
  return (
    <main className="flex h-screen w-screen bg-black text-gray-200 overflow-hidden">
      <Sidebar />
      <MarkdownViewer filePath={searchParams.file || ''} />
    </main>
  );
}
