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
    <div className="flex flex-col h-screen w-screen bg-black text-gray-200 overflow-hidden">
      <header className="h-16 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-4">
        <h1 className="font-bold text-lg">德谷拉指揮中心</h1>
        <nav>
          <ul className="flex items-center space-x-4">
            <li><a href="/" className="text-[#64b5f6] hover:text-[#90caf9] transition-colors">Second Brain</a></li>
            <li><a href="/kanban" className="text-[#64b5f6] hover:text-[#90caf9] transition-colors">Kanban</a></li>
          </ul>
        </nav>
      </header>
      <main className="flex flex-1 h-full">
        <Sidebar />
        <MarkdownViewer filePath={params.file || ''} />
      </main>
    </div>
  );
}
