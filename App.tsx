import { useEffect, useMemo, useState } from 'react';
import './App.css';

type Status = '대기' | '진행' | '완료';
type CellValue = string;
type RowData = CellValue[];

type TimerState = {
  initialSeconds: number;
  remainingSeconds: number;
  running: boolean;
};

const GRID_STORAGE_KEY = 'sheet-grid-v2';
const TIMER_STORAGE_KEY = 'sheet-timer-v2';
const STATUS_OPTIONS: Status[] = ['대기', '진행', '완료'];

const createRows = (rowCount: number, colCount: number): RowData[] =>
  Array.from({ length: rowCount }, () =>
    Array.from({ length: colCount }, (_, c) => (c === 1 ? '대기' : ''))
  );

const toTimerText = (seconds: number) => {
  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
};

export default function App() {
  const [grid, setGrid] = useState<RowData[]>(() => createRows(6, 4));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [timer, setTimer] = useState<TimerState>({
    initialSeconds: 300,
    remainingSeconds: 300,
    running: false,
  });


  useEffect(() => {
    const savedGrid = localStorage.getItem(GRID_STORAGE_KEY);
    if (savedGrid) {
      try {
        const parsed = JSON.parse(savedGrid) as RowData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const maxCol = Math.max(...parsed.map((r) => r.length), 2);
          setGrid(parsed.map((r) => [...r, ...Array.from({ length: maxCol - r.length }, () => '')]));
        }
      } catch {
        // ignore corrupted data
      }
    }

    const savedTimer = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer) as TimerState;
        setTimer({
          initialSeconds: Math.max(0, Number(parsed.initialSeconds) || 300),
          remainingSeconds: Math.max(0, Number(parsed.remainingSeconds) || 300),
          running: Boolean(parsed.running),
        });
      } catch {
        // ignore corrupted data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(GRID_STORAGE_KEY, JSON.stringify(grid));
  }, [grid]);

  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    if (!timer.running || timer.remainingSeconds <= 0) return;

    const id = window.setInterval(() => {
      setTimer((prev) => {
        const next = Math.max(0, prev.remainingSeconds - 1);
        if (next === 0 && prev.running) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance('타이머 종료');
          utterance.lang = 'ko-KR';
          window.speechSynthesis.speak(utterance);
        }

        return {
          ...prev,
          remainingSeconds: next,
          running: next > 0,
        };
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timer.running, timer.remainingSeconds]);

  const columnCount = useMemo(() => (grid[0]?.length ? grid[0].length : 2), [grid]);

  const setCell = (row: number, col: number, value: string) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = value;
      return next;
    });
  };

  const addRow = () => {
    setGrid((prev) => [...prev, Array.from({ length: columnCount }, (_, c) => (c === 1 ? '대기' : ''))]);
  };

  const addColumn = () => {
    setGrid((prev) => prev.map((r) => [...r, '']));
  };

  const handleCopy = async () => {
    if (!selected) return;
    const value = grid[selected.row]?.[selected.col] ?? '';
    await navigator.clipboard.writeText(value);
  };

  const applyPaste = (text: string) => {
    if (!selected) return;
    const rows = text.replace(/\r/g, '').split('\n').filter((line) => line.length > 0);
    const matrix = rows.map((line) => line.split('\t'));

    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      matrix.forEach((line, rIdx) => {
        line.forEach((val, cIdx) => {
          const rr = selected.row + rIdx;
          const cc = selected.col + cIdx;
          if (rr < next.length && cc < columnCount) {
            next[rr][cc] = val;
          }
        });
      });
      return next;
    });
  };

  const handlePaste = async () => {
    if (!selected) return;
    const text = await navigator.clipboard.readText();
    applyPaste(text);
  };

  const handleTablePaste: React.ClipboardEventHandler<HTMLTableElement> = (event) => {
    if (!selected) return;
    event.preventDefault();
    applyPaste(event.clipboardData.getData('text/plain'));
  };

  return (
    <main className="app">
      <h1>React + TypeScript + Vite 그리드</h1>

      <section className="card">
        <div className="toolbar">
          <button onClick={addRow}>행 추가</button>
          <button onClick={addColumn}>열 추가</button>
          <button onClick={handleCopy} disabled={!selected}>선택 셀 복사</button>
          <button onClick={handlePaste} disabled={!selected}>선택 셀 붙여넣기</button>
        </div>
        <div className="table-wrap">
          <table onPaste={handleTablePaste}>
            <thead>
              <tr>
                {Array.from({ length: columnCount }, (_, c) => (
                  <th key={`head-${c}`}>{c === 1 ? '상태' : `열 ${c + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, rIdx) => (
                <tr key={`row-${rIdx}`}>
                  {row.map((cell, cIdx) => {
                    const isStatus = cIdx === 1;
                    const active = selected?.row === rIdx && selected?.col === cIdx;
                    return (
                      <td
                        key={`cell-${rIdx}-${cIdx}`}
                        className={active ? 'selected' : ''}
                        onClick={() => setSelected({ row: rIdx, col: cIdx })}
                      >
                        {isStatus ? (
                          <select
                            value={STATUS_OPTIONS.includes(cell as Status) ? cell : '대기'}
                            onChange={(e) => setCell(rIdx, cIdx, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={cell}
                            onChange={(e) => setCell(rIdx, cIdx, e.target.value)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">셀을 클릭해 선택한 뒤, Ctrl/Cmd + C / Ctrl/Cmd + V 또는 버튼으로 복사/붙여넣기할 수 있습니다.</p>
      </section>

      <section className="card">
        <h2>타이머</h2>
        <div className="timer-row">
          <label>
            초기 시간(초)
            <input
              type="number"
              min={0}
              value={timer.initialSeconds}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value) || 0);
                setTimer((prev) => ({
                  ...prev,
                  initialSeconds: value,
                  remainingSeconds: prev.running ? prev.remainingSeconds : value,
                }));
              }}
            />
          </label>
          <strong>{toTimerText(timer.remainingSeconds)}</strong>
        </div>
        <div className="toolbar">
          <button onClick={() => setTimer((prev) => ({ ...prev, running: true }))} disabled={timer.remainingSeconds <= 0}>
            시작
          </button>
          <button onClick={() => setTimer((prev) => ({ ...prev, running: false }))}>정지</button>
          <button
            onClick={() =>
              setTimer((prev) => ({
                ...prev,
                running: false,
                remainingSeconds: prev.initialSeconds,
              }))
            }
          >
            리셋
          </button>
        </div>
      </section>
    </main>
  );
}
