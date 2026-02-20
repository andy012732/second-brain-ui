'use client';
import { useEffect, useState } from 'react';

const fmt = (n: number) => n >= 10000
  ? `$${(n / 10000).toFixed(1)}萬`
  : `$${n.toLocaleString()}`;

const pctColor = (pct: number | null) => {
  if (pct === null) return '#888';
  if (pct > 0) return '#00ff88';
  if (pct < 0) return '#ff2244';
  return '#888';
};

const STORE_COLORS: Record<string, string> = {
  新豐: '#4488ff',
  竹北: '#00ff88',
  官網: '#cc44ff',
};

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [onlineList, setOnlineList] = useState<any[]>([]);
  const [editGoals, setEditGoals] = useState(false);
  const [goalInput, setGoalInput] = useState<Record<string, string>>({});
  const [onlineInput, setOnlineInput] = useState('');
  const [onlineDate, setOnlineDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  // 業績日期邏輯（台灣時間 UTC+8）
  // < 20:00 → 顯示昨天（昨日業績保留期）
  // >= 20:00 → 顯示今天
  const getTWDate = (offsetDays = 0) => {
    const now = new Date();
    const tw = new Date(now.getTime() + 8 * 60 * 60 * 1000 + offsetDays * 86400000);
    return tw.toISOString().split('T')[0];
  };
  const getRevenueDate = () => {
    const now = new Date();
    const twHour = (now.getUTCHours() + 8) % 24;
    return twHour < 20 ? getTWDate(-1) : getTWDate(0);
  };
  // 今日快照的狀態判斷
  const getStoreStatus = (store: string, hasData: boolean) => {
    const now = new Date();
    const twHour = (now.getUTCHours() + 8) % 24;
    const twMin = now.getUTCMinutes();
    const totalMin = twHour * 60 + twMin;
    if (twHour < 20) return 'yesterday'; // 保留昨日
    if (!hasData && totalMin < 23 * 60) return 'waiting'; // 等待上傳
    if (!hasData) return 'missing'; // 超過23:00未上傳
    return 'ok';
  };

  // 輪詢狀態
  const [isPolling, setIsPolling] = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  const load = async () => {
    const [r, g, o] = await Promise.all([
      fetch('/api/revenue').then(r => r.json()),
      fetch('/api/revenue/goals').then(r => r.json()),
      fetch(`/api/revenue/online?month=${new Date().toISOString().slice(0,7)}`).then(r => r.json()),
    ]);
    setData(r);
    setGoals(g);
    if (g && g.新豐 !== undefined) setGoalInput({ 新豐: String(g.新豐), 竹北: String(g.竹北), 官網: String(g.官網) });
    setOnlineList(o);
    setLastFetch(new Date().toLocaleTimeString('zh-TW'));
  };

  useEffect(() => { load(); }, []);

  // 21:20 ~ 23:00 每10分鐘自動輪詢
  useEffect(() => {
    const checkAndPoll = () => {
      const now = new Date();
      const hour = now.getHours();
      const min = now.getMinutes();
      const totalMin = hour * 60 + min;
      // 21:20 = 1280, 23:00 = 1380
      if (totalMin >= 1280 && totalMin < 1380) {
        setIsPolling(true);
        load();
      } else {
        setIsPolling(false);
      }
    };
    const interval = setInterval(checkAndPoll, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const saveGoals = async () => {
    setSaving(true);
    await fetch('/api/revenue/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 新豐: Number(goalInput.新豐), 竹北: Number(goalInput.竹北), 官網: Number(goalInput.官網) }),
    });
    await load();
    setEditGoals(false);
    setSaving(false);
  };

  const saveOnline = async () => {
    if (!onlineInput) return;
    setSaving(true);
    await fetch('/api/revenue/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: onlineDate, amount: Number(onlineInput) }),
    });
    await load();
    setOnlineInput('');
    setSaving(false);
  };

  if (!data || !goals) return (
    <div style={{ background: '#0a0a0e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4488ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.2em' }}>
      LOADING...
    </div>
  );

  const stores = ['新豐', '竹北'];
  const onlineTotal = onlineList.reduce((s: number, r: any) => s + r.amount, 0);
  const grandTotal = (data.monthTotal.新豐 || 0) + (data.monthTotal.竹北 || 0) + onlineTotal;

  const monthDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const monthProgress = Math.round((today / monthDays) * 100);

  const payTotal = Object.values(data.monthPayment as Record<string, number>).reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: '#0a0a0e', minHeight: '100vh', overflowY: 'auto', padding: '32px 40px', fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 10, color: '#4488ff', letterSpacing: '0.3em', marginBottom: 8 }}>REVENUE COMMAND</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>業績指揮部</h1>
          <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
            業績日期 · {getRevenueDate()}
            {isPolling && <span style={{ color: '#ffaa00', marginLeft: 8 }}>● 自動輪詢中</span>}
          </div>
          {lastFetch && <div style={{ fontSize: 10, color: '#333', marginTop: 4 }}>最後更新 {lastFetch}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.2em', marginBottom: 4 }}>本月全門市</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#00ff88' }}>{fmt(grandTotal)}</div>
          <button onClick={async () => { setManualLoading(true); await load(); setManualLoading(false); }}
            style={{ marginTop: 8, background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '4px 14px', color: '#888', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em' }}>
            {manualLoading ? '抓取中...' : '⟳ 手動刷新'}
          </button>
        </div>
      </div>

      {/* 今日快照 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#ffaa00', letterSpacing: '0.3em', marginBottom: 14 }}>// TODAY SNAPSHOT</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {['新豐', '竹北', '官網'].map(store => {
            const isOnline = store === '官網';
            const revenueDate = getRevenueDate();
            const todayAmt = isOnline
              ? onlineList.find((r: any) => r.date === revenueDate)?.amount || 0
              : (((new Date().getUTCHours() + 8) % 24) < 20 ? data.yesterdayData[store] : data.todayData[store])?.revenue || 0;
            const hasData = isOnline ? todayAmt > 0 : !!(((new Date().getUTCHours() + 8) % 24) < 20 ? data.yesterdayData[store] : data.todayData[store]);
            const status = isOnline ? (todayAmt > 0 ? 'ok' : 'waiting') : getStoreStatus(store, hasData);
            const cmp = data.comparison[store];
            const pct = isOnline ? null : cmp?.pct ?? null;
            const SC: Record<string, {label: string, color: string, bg: string, border: string}> = {
              yesterday: { label: '📋 昨日業績', color: '#4488ff', bg: 'rgba(68,136,255,0.08)', border: 'rgba(68,136,255,0.2)' },
              waiting:   { label: '⏳ 等待上傳', color: '#ffaa00', bg: 'rgba(255,170,0,0.08)',   border: 'rgba(255,170,0,0.3)' },
              missing:   { label: '⚠ 未上傳',   color: '#ff2244', bg: 'rgba(255,34,68,0.08)',   border: 'rgba(255,34,68,0.3)' },
              ok:        { label: '✓ 已上傳',    color: '#00ff88', bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.2)' },
            };
            const sc = SC[status];
            return (
              <div key={store} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${sc.border}`, borderLeft: `3px solid ${STORE_COLORS[store]}`, borderRadius: 10, padding: '20px 24px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 3, padding: '2px 8px', fontWeight: 700, letterSpacing: '0.1em' }}>{sc.label}</div>
                <div style={{ fontSize: 10, color: STORE_COLORS[store], letterSpacing: '0.2em', marginBottom: 10, fontWeight: 700 }}>{store}門市</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: (status === 'missing' || status === 'waiting') ? '#333' : '#fff' }}>
                  {(status === 'missing' || status === 'waiting') ? '—' : fmt(todayAmt)}
                </div>
                {status === 'yesterday' && <div style={{ marginTop: 4, fontSize: 9, color: '#4488ff88' }}>保留至今日 20:00</div>}
                {pct !== null && status === 'ok' && (
                  <div style={{ marginTop: 8, fontSize: 11, color: pctColor(pct) }}>
                    {pct > 0 ? '▲' : pct < 0 ? '▼' : '—'} {Math.abs(pct)}% vs 前日
                    <span style={{ color: '#555', marginLeft: 8 }}>前日 {fmt(cmp.yesterday)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 本月累積 vs 目標 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#ffaa00', letterSpacing: '0.3em' }}>// MONTHLY PROGRESS</div>
          <button onClick={() => setEditGoals(!editGoals)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '4px 12px', color: '#888', fontSize: 9, cursor: 'pointer', letterSpacing: '0.1em', fontFamily: 'inherit' }}>
            {editGoals ? 'CANCEL' : 'SET GOALS'}
          </button>
        </div>
        {editGoals && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 16 }}>
            {['新豐', '竹北', '官網'].map(s => (
              <div key={s} style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: STORE_COLORS[s], marginBottom: 6, letterSpacing: '0.1em' }}>{s} 月目標</div>
                <input value={goalInput[s]} onChange={e => setGoalInput({ ...goalInput, [s]: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '6px 10px', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
              </div>
            ))}
            <button onClick={saveGoals} disabled={saving} style={{ alignSelf: 'flex-end', background: '#4488ff', border: 'none', borderRadius: 4, padding: '8px 20px', color: '#fff', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em' }}>
              {saving ? '...' : 'SAVE'}
            </button>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[...stores, '官網'].map(store => {
            const actual = store === '官網' ? onlineTotal : (data.monthTotal[store] || 0);
            const goal = goals[store] || 1;
            const pct = Math.min(100, Math.round((actual / goal) * 100));
            const color = STORE_COLORS[store];
            return (
              <div key={store} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color, fontWeight: 700 }}>{store}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>{fmt(actual)} / {fmt(goal)} <span style={{ color: pct >= 100 ? '#00ff88' : pct >= monthProgress ? '#ffaa00' : '#ff2244', fontWeight: 700 }}>{pct}%</span></span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  <div style={{ position: 'absolute', top: 0, left: `${monthProgress}%`, height: '100%', width: 1, background: 'rgba(255,170,0,0.6)' }} title="月進度" />
                </div>
                <div style={{ fontSize: 9, color: '#444', marginTop: 6 }}>月進度 {monthProgress}% · 目標進度 {pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 付款方式 + 缺報 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>

        {/* 付款方式分佈 */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontSize: 10, color: '#ffaa00', letterSpacing: '0.3em', marginBottom: 16 }}>// PAYMENT MIX (本月)</div>
          {payTotal === 0 ? <div style={{ color: '#444', fontSize: 12 }}>尚無資料</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(data.monthPayment as Record<string, number>).map(([method, amount]) => {
                const pct = Math.round((amount / payTotal) * 100);
                const colors: Record<string, string> = { 現金: '#00ff88', 刷卡: '#4488ff', LINEPAY: '#00ccff', 匯款: '#ffaa00' };
                return (
                  <div key={method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                      <span style={{ color: colors[method] }}>{method}</span>
                      <span style={{ color: '#888' }}>{fmt(amount)} <span style={{ color: '#ccc' }}>{pct}%</span></span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[method], borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 缺報警示 */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontSize: 10, color: '#ffaa00', letterSpacing: '0.3em', marginBottom: 16 }}>// MISSING REPORTS</div>
          {data.missingDates.length === 0 ? (
            <div style={{ color: '#00ff88', fontSize: 12 }}>✓ 本月無缺報</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {data.missingDates.slice(-10).reverse().map((m: any) => (
                <div key={m.date} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '6px 10px', background: 'rgba(255,34,68,0.05)', border: '1px solid rgba(255,34,68,0.15)', borderRadius: 4 }}>
                  <span style={{ color: '#ff2244' }}>{m.date}</span>
                  <span style={{ color: '#ff6666' }}>{m.stores.join('、')} 未上傳</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 官網業績手動輸入 */}
      <div style={{ background: 'rgba(204,68,255,0.05)', border: '1px solid rgba(204,68,255,0.2)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ fontSize: 10, color: '#cc44ff', letterSpacing: '0.3em', marginBottom: 16 }}>// ONLINE REVENUE INPUT</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>日期</div>
            <input type="date" value={onlineDate} onChange={e => setOnlineDate(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '8px 12px', color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>金額</div>
            <input type="number" value={onlineInput} onChange={e => setOnlineInput(e.target.value)} placeholder="輸入官網當日業績"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '8px 12px', color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <button onClick={saveOnline} disabled={saving || !onlineInput}
            style={{ background: '#cc44ff', border: 'none', borderRadius: 4, padding: '8px 20px', color: '#fff', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em', opacity: !onlineInput ? 0.4 : 1 }}>
            {saving ? '...' : 'SAVE'}
          </button>
        </div>
        {onlineList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {onlineList.slice(-5).reverse().map((r: any) => (
              <div key={r.date} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
                <span>{r.date}</span>
                <span style={{ color: '#cc44ff' }}>{fmt(r.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
