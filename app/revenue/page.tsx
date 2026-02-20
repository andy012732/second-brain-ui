'use client';
import { useEffect, useState } from 'react';

const fmt = (n: number) => `$${n.toLocaleString()}`;

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

// ─── SVG 折線圖元件 ───────────────────────────────────────
function DailyChart({ dailyMap, monthDays, monthStr, goals }: {
  dailyMap: Record<string, any>;
  monthDays: number;
  monthStr: string;
  goals: Record<string, number>;
}) {
  const W = 700, H = 160, PAD = { t: 16, r: 16, b: 28, l: 52 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  // 建立每日合計（新豐+竹北）和各門市
  const days = Array.from({ length: monthDays }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    const date = `${monthStr}-${d}`;
    const xf = dailyMap[date]?.['新豐']?.revenue || dailyMap[date]?.['新豐'] || 0;
    const zb = dailyMap[date]?.['竹北']?.revenue || dailyMap[date]?.['竹北'] || 0;
    return { day: i + 1, date, 新豐: xf, 竹北: zb, total: xf + zb };
  });

  const goalDaily = ((goals['新豐'] || 0) + (goals['竹北'] || 0)) / monthDays;
  const maxVal = Math.max(...days.map(d => d.total), goalDaily * 1.2, 1);

  const xPos = (day: number) => PAD.l + ((day - 1) / (monthDays - 1)) * cW;
  const yPos = (val: number) => PAD.t + cH - (val / maxVal) * cH;

  const makePolyline = (vals: number[]) =>
    vals.map((v, i) => `${xPos(i + 1)},${yPos(v)}`).join(' ');

  // 累積線
  let cumXF = 0, cumZB = 0;
  const cumDays = days.map(d => {
    cumXF += d.新豐; cumZB += d.竹北;
    return { day: d.day, cum: cumXF + cumZB };
  });
  const goalCum = days.map((_, i) => goalDaily * (i + 1));
  const maxCum = Math.max(...cumDays.map(d => d.cum), goalCum[goalCum.length - 1] * 1.1, 1);
  const yCum = (val: number) => PAD.t + cH - (val / maxCum) * cH;

  const today = new Date().getDate();
  const todayHasData = days.slice(0, today).some(d => d.total > 0);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, color: '#ffaa00', letterSpacing: '0.3em', marginBottom: 14 }}>// DAILY REVENUE CHART</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* 每日業績折線圖 */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 9, color: '#555', marginBottom: 10, letterSpacing: '0.15em' }}>每日業績（新豐 + 竹北）</div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
            {/* 格線 */}
            {[0.25, 0.5, 0.75, 1].map(r => (
              <line key={r} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + cH * (1 - r)} y2={PAD.t + cH * (1 - r)}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {/* Y軸標籤 */}
            {[0.5, 1].map(r => (
              <text key={r} x={PAD.l - 4} y={PAD.t + cH * (1 - r) + 4} textAnchor="end"
                fill="#444" fontSize="9">{Math.round(maxVal * r / 1000)}k</text>
            ))}
            {/* 目標均線（橘色虛線） */}
            <line x1={PAD.l} x2={W - PAD.r} y1={yPos(goalDaily)} y2={yPos(goalDaily)}
              stroke="#ffaa0066" strokeWidth="1" strokeDasharray="4,3" />
            <text x={W - PAD.r + 2} y={yPos(goalDaily) + 4} fill="#ffaa00" fontSize="8">目標</text>
            {/* 新豐線（藍） */}
            {days.some(d => d.新豐 > 0) && (
              <polyline points={makePolyline(days.map(d => d.新豐))}
                fill="none" stroke="#4488ff" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8" />
            )}
            {/* 竹北線（綠） */}
            {days.some(d => d.竹北 > 0) && (
              <polyline points={makePolyline(days.map(d => d.竹北))}
                fill="none" stroke="#00ff88" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8" />
            )}
            {/* 今天垂直線 */}
            {today <= monthDays && (
              <line x1={xPos(today)} x2={xPos(today)} y1={PAD.t} y2={PAD.t + cH}
                stroke="rgba(255,170,0,0.4)" strokeWidth="1" strokeDasharray="3,3" />
            )}
            {/* 資料點（每5天一個x軸標） */}
            {days.filter(d => d.day % 5 === 0 || d.day === 1 || d.day === monthDays).map(d => (
              <text key={d.day} x={xPos(d.day)} y={H - 4} textAnchor="middle" fill="#333" fontSize="8">{d.day}</text>
            ))}
          </svg>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 9, color: '#555' }}>
            <span style={{ color: '#4488ff' }}>▬ 新豐</span>
            <span style={{ color: '#00ff88' }}>▬ 竹北</span>
            <span style={{ color: '#ffaa0088' }}>- - 目標均線</span>
          </div>
        </div>

        {/* 累積進度追蹤線 */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 9, color: '#555', marginBottom: 10, letterSpacing: '0.15em' }}>累積業績 vs 理想進度</div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
            {[0.25, 0.5, 0.75, 1].map(r => (
              <line key={r} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + cH * (1 - r)} y2={PAD.t + cH * (1 - r)}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {[0.5, 1].map(r => (
              <text key={r} x={PAD.l - 4} y={PAD.t + cH * (1 - r) + 4} textAnchor="end"
                fill="#444" fontSize="9">{Math.round(maxCum * r / 10000)}萬</text>
            ))}
            {/* 理想進度線（橘色） */}
            <polyline
              points={goalCum.map((v, i) => `${xPos(i + 1)},${yCum(v)}`).join(' ')}
              fill="none" stroke="#ffaa00" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6" />
            {/* 實際累積線 */}
            <polyline
              points={cumDays.filter(d => d.cum > 0).map(d => `${xPos(d.day)},${yCum(d.cum)}`).join(' ')}
              fill="none" stroke="#00ff88" strokeWidth="2" strokeLinejoin="round" />
            {/* 填色（累積線下方） */}
            {cumDays.some(d => d.cum > 0) && (
              <polygon
                points={[
                  `${xPos(1)},${PAD.t + cH}`,
                  ...cumDays.filter(d => d.cum > 0).map(d => `${xPos(d.day)},${yCum(d.cum)}`),
                  `${xPos(cumDays.filter(d => d.cum > 0).slice(-1)[0]?.day || 1)},${PAD.t + cH}`,
                ].join(' ')}
                fill="url(#cumGrad)" opacity="0.15" />
            )}
            <defs>
              <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
              </linearGradient>
            </defs>
            {today <= monthDays && (
              <line x1={xPos(today)} x2={xPos(today)} y1={PAD.t} y2={PAD.t + cH}
                stroke="rgba(255,170,0,0.4)" strokeWidth="1" strokeDasharray="3,3" />
            )}
            {days.filter(d => d.day % 5 === 0 || d.day === 1 || d.day === monthDays).map(d => (
              <text key={d.day} x={xPos(d.day)} y={H - 4} textAnchor="middle" fill="#333" fontSize="8">{d.day}</text>
            ))}
          </svg>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 9, color: '#555' }}>
            <span style={{ color: '#00ff88' }}>▬ 實際累積</span>
            <span style={{ color: '#ffaa0088' }}>- - 理想進度</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [onlineList, setOnlineList] = useState<any[]>([]);
  const [editGoals, setEditGoals] = useState(false);
  const [goalInput, setGoalInput] = useState<Record<string, string>>({});
  const [onlineInput, setOnlineInput] = useState('');
  const [onlineDate, setOnlineDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  // 歷史查詢
  const [historyDate, setHistoryDate] = useState('');
  const [historyMonth, setHistoryMonth] = useState('');
  const [historyMode, setHistoryMode] = useState<'date'|'month'>('date');
  const [historyResult, setHistoryResult] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

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
  const getStoreStatus = (store: string, hasData: boolean) => {
    const now = new Date();
    const twHour = (now.getUTCHours() + 8) % 24;
    const twMin = now.getUTCMinutes();
    const totalMin = twHour * 60 + twMin;
    if (twHour < 20) return 'yesterday';
    if (!hasData && totalMin < 23 * 60) return 'waiting';
    if (!hasData) return 'missing';
    return 'ok';
  };

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

  useEffect(() => {
    const checkAndPoll = () => {
      const now = new Date();
      const totalMin = now.getHours() * 60 + now.getMinutes();
      if (totalMin >= 1280 && totalMin < 1380) { setIsPolling(true); load(); }
      else setIsPolling(false);
    };
    const interval = setInterval(checkAndPoll, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const saveGoals = async () => {
    setSaving(true);
    await fetch('/api/revenue/goals', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 新豐: Number(goalInput.新豐), 竹北: Number(goalInput.竹北), 官網: Number(goalInput.官網) }),
    });
    await load(); setEditGoals(false); setSaving(false);
  };

  const saveOnline = async () => {
    if (!onlineInput) return;
    setSaving(true);
    await fetch('/api/revenue/online', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: onlineDate, amount: Number(onlineInput) }),
    });
    await load(); setOnlineInput(''); setSaving(false);
  };

  const queryHistory = async () => {
    setHistoryLoading(true); setHistoryResult(null);
    try {
      if (historyMode === 'date') {
        if (data && data.dailyMap[historyDate] !== undefined) {
          setHistoryResult({ mode: 'date', date: historyDate, stores: data.dailyMap[historyDate] });
        } else {
          const res = await fetch(`/api/revenue/history?date=${historyDate}`).then(r => r.json());
          setHistoryResult({ mode: 'date', date: historyDate, stores: res.dailyMap?.[historyDate] || null });
        }
      } else {
        const res = await fetch(`/api/revenue/history?month=${historyMonth}`).then(r => r.json());
        setHistoryResult({ mode: 'month', month: historyMonth, dailyMap: res.dailyMap, monthTotal: res.monthTotal });
      }
    } finally { setHistoryLoading(false); }
  };

  if (!data || !goals) return (
    <div style={{ background: '#0a0a0e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4488ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.2em' }}>
      LOADING...
    </div>
  );

  const stores = ['新豐', '竹北'];
  const onlineTotal = onlineList.reduce((s: number, r: any) => s + r.amount, 0);
  const grandTotal = (data.monthTotal.新豐 || 0) + (data.monthTotal.竹北 || 0) + onlineTotal;

  const now = new Date();
  const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const todayDay = now.getDate();
  const monthProgress = Math.round((todayDay / monthDays) * 100);
  const monthStr = now.toISOString().slice(0, 7);

  const payTotal = Object.values(data.monthPayment as Record<string, number>).reduce((a, b) => a + b, 0);

  // 目標達成預測日計算
  const calcETA = (store: string) => {
    const actual = store === '官網' ? onlineTotal : (data.monthTotal[store] || 0);
    const goal = goals[store] || 1;
    if (actual >= goal) return '已達標 🎉';
    const daysElapsed = todayDay;
    if (daysElapsed === 0 || actual === 0) return '資料不足';
    const dailyAvg = actual / daysElapsed;
    const remaining = goal - actual;
    const daysNeeded = Math.ceil(remaining / dailyAvg);
    const eta = new Date(now.getTime() + daysNeeded * 86400000);
    const etaDay = eta.getDate();
    const etaMonth = eta.getMonth() + 1;
    if (etaMonth > now.getMonth() + 1) return `預計下月達標`;
    return `預計 ${etaMonth}/${etaDay} 達標`;
  };

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
            const twHour = (new Date().getUTCHours() + 8) % 24;
            const storeData = twHour < 20 ? data.yesterdayData[store] : data.todayData[store];
            const todayAmt = isOnline
              ? onlineList.find((r: any) => r.date === revenueDate)?.amount || 0
              : storeData?.revenue || 0;
            const hasData = isOnline ? todayAmt > 0 : !!storeData;
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

      {/* 圖表區 */}
      <DailyChart dailyMap={data.dailyMap} monthDays={monthDays} monthStr={monthStr} goals={goals} />

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
            const eta = calcETA(store);
            return (
              <div key={store} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color, fontWeight: 700 }}>{store}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>
                    {fmt(actual)} / {fmt(goal)}{' '}
                    <span style={{ color: pct >= 100 ? '#00ff88' : pct >= monthProgress ? '#ffaa00' : '#ff2244', fontWeight: 700 }}>{pct}%</span>
                    <span style={{ color: '#444', marginLeft: 12, fontSize: 9 }}>{eta}</span>
                  </span>
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

      {/* 歷史業績查詢 */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: '#ffaa00', letterSpacing: '0.3em', marginBottom: 16 }}>// HISTORY LOOKUP</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['date','month'] as const).map(m => (
            <button key={m} onClick={() => { setHistoryMode(m); setHistoryResult(null); }}
              style={{ background: historyMode === m ? '#ffaa00' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,170,0,0.3)', borderRadius: 4, padding: '4px 14px', color: historyMode === m ? '#000' : '#888', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, letterSpacing: '0.1em' }}>
              {m === 'date' ? '單日查詢' : '整月查詢'}
            </button>
          ))}
        </div>

        {/* 快速日期捷徑 */}
        {historyMode === 'date' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 9, color: '#444', alignSelf: 'center' }}>快速：</span>
            {[
              { label: '昨天', offset: -1 },
              { label: '前天', offset: -2 },
              { label: '3天前', offset: -3 },
              { label: '上週同日', offset: -7 },
              { label: '14天前', offset: -14 },
            ].map(({ label, offset }) => (
              <button key={label} onClick={() => setHistoryDate(getTWDate(offset))}
                style={{ background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)', borderRadius: 3, padding: '3px 10px', color: '#ffaa00', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
                {label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          {historyMode === 'date' ? (
            <div>
              <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>查詢日期</div>
              <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '8px 12px', color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' }} />
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>查詢月份</div>
              <input type="month" value={historyMonth} onChange={e => setHistoryMonth(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '8px 12px', color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' }} />
            </div>
          )}
          <button onClick={queryHistory} disabled={historyLoading || (historyMode === 'date' ? !historyDate : !historyMonth)}
            style={{ background: '#ffaa00', border: 'none', borderRadius: 4, padding: '8px 20px', color: '#000', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em', fontWeight: 700, opacity: (historyMode === 'date' ? !historyDate : !historyMonth) ? 0.4 : 1 }}>
            {historyLoading ? '查詢中...' : 'SEARCH'}
          </button>
        </div>

        {historyResult?.mode === 'date' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 10 }}>{historyResult.date} 業績明細</div>
            {historyResult.stores === null ? (
              <div style={{ color: '#ff2244', fontSize: 12 }}>⚠ 此日期無資料（未上傳）</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {['新豐', '竹北'].map(store => {
                  const d = historyResult.stores[store];
                  if (!d) return (
                    <div key={store} style={{ background: 'rgba(255,34,68,0.05)', border: '1px solid rgba(255,34,68,0.15)', borderRadius: 8, padding: '14px 18px' }}>
                      <div style={{ fontSize: 10, color: STORE_COLORS[store], marginBottom: 6, fontWeight: 700 }}>{store}</div>
                      <div style={{ color: '#ff2244', fontSize: 11 }}>未上傳</div>
                    </div>
                  );
                  const rev = typeof d === 'object' ? d.revenue : d;
                  const cash = typeof d === 'object' ? d.現金 : 0;
                  const card = typeof d === 'object' ? d.刷卡 : 0;
                  const line = typeof d === 'object' ? d.LINEPAY : 0;
                  const wire = typeof d === 'object' ? d.匯款 : 0;
                  const exp = typeof d === 'object' ? d.其他支出 : 0;
                  return (
                    <div key={store} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${STORE_COLORS[store]}`, borderRadius: 8, padding: '14px 18px' }}>
                      <div style={{ fontSize: 10, color: STORE_COLORS[store], marginBottom: 8, fontWeight: 700 }}>{store}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>{fmt(rev)}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#666', flexWrap: 'wrap' }}>
                        {cash > 0 && <span>現金 <span style={{ color: '#00ff88' }}>{fmt(cash)}</span></span>}
                        {card > 0 && <span>刷卡 <span style={{ color: '#4488ff' }}>{fmt(card)}</span></span>}
                        {line > 0 && <span>LINEPAY <span style={{ color: '#00ccff' }}>{fmt(line)}</span></span>}
                        {wire > 0 && <span>匯款 <span style={{ color: '#ffaa00' }}>{fmt(wire)}</span></span>}
                      </div>
                      {exp > 0 && <div style={{ fontSize: 10, color: '#ff6666', marginTop: 6 }}>其他支出 -{fmt(exp)}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {historyResult?.mode === 'month' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              {['新豐','竹北'].map(store => (
                <div key={store} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${STORE_COLORS[store]}`, borderRadius: 8, padding: '12px 18px', flex: 1 }}>
                  <div style={{ fontSize: 9, color: STORE_COLORS[store], marginBottom: 4, fontWeight: 700 }}>{store} {historyResult.month} 月總計</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{fmt(historyResult.monthTotal[store] || 0)}</div>
                </div>
              ))}
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(historyResult.dailyMap as Record<string, any>).sort(([a],[b]) => b.localeCompare(a)).map(([date, storesData]) => (
                <div key={date} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 11 }}>
                  <span style={{ color: '#555' }}>{date}</span>
                  {['新豐','竹北'].map(store => {
                    const d = (storesData as any)[store];
                    const rev = d ? (typeof d === 'object' ? d.revenue : d) : 0;
                    return <span key={store} style={{ color: rev > 0 ? STORE_COLORS[store] : '#333' }}>{rev > 0 ? fmt(rev) : '—'}</span>;
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
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
