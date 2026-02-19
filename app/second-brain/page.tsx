import Sidebar from '@/components/Sidebar';
import MarkdownViewer from '@/components/MarkdownViewer';

export const dynamic = 'force-dynamic';

export default async function SecondBrainPage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const params = await searchParams;

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      background: '#050507',
      color: '#ccc',
      overflow: 'hidden',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    }}>
      <Sidebar />

      {/* 主閱讀區 */}
      <main style={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(6,6,10,0.98)',
      }}>
        {params.file ? (
          <MarkdownViewer filePath={params.file} />
        ) : (
          /* 空白歡迎畫面 */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}>
            {/* 發光腦圖示 */}
            <div style={{
              fontSize: 48,
              filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.4))',
              animation: 'sbFloat 4s ease-in-out infinite',
            }}>
              🧠
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 11, fontWeight: 900, letterSpacing: '0.3em',
                color: '#00ff88',
                textShadow: '0 0 12px #00ff8866',
                marginBottom: 10,
              }}>
                SECOND BRAIN
              </div>
              <div style={{ fontSize: 12, color: '#445', letterSpacing: '0.1em' }}>
                選擇左側筆記開始閱讀
              </div>
              <div style={{ fontSize: 11, color: '#334', marginTop: 6, letterSpacing: '0.08em' }}>
                或使用搜尋框快速找到筆記
              </div>
            </div>

            {/* 裝飾線 */}
            <div style={{
              width: 120, height: 1,
              background: 'linear-gradient(90deg, transparent, #00ff8844, transparent)',
              marginTop: 8,
            }} />

            <style>{`
              @keyframes sbFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
            `}</style>
          </div>
        )}
      </main>
    </div>
  );
}
