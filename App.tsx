import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css';

type GridRow = Record<string, string>;

type TimerState = {
  initialSeconds: number;
  remainingSeconds: number;
  running: boolean;
};

const GRID_STORAGE_KEY = 'spreadsheet-grid-data-v1';
const TIMER_STORAGE_KEY = 'spreadsheet-timer-data-v1';

const createColumn = (index: number): ColDef<GridRow> => {
  const field = `col_${index}`;
  return {
    headerName: index === 1 ? '상태' : `열 ${index}`,
    field,
    editable: true,
    cellEditor: index === 1 ? 'agSelectCellEditor' : undefined,
    cellEditorParams:
      index === 1
        ? {
            values: ['대기', '진행', '완료'],
          }
        : undefined,
  };
};

const ensureShape = (rows: GridRow[], columnCount: number): GridRow[] =>
  rows.map((row) => {
    const next: GridRow = { ...row };
    for (let i = 0; i < columnCount; i += 1) {
      const key = `col_${i}`;
      if (typeof next[key] !== 'string') {
        next[key] = '';
      }
    }
    return next;
  });

const defaultRows = (rowCount = 5, columnCount = 3): GridRow[] =>
  Array.from({ length: rowCount }, () => {
    const row: GridRow = {};
    for (let i = 0; i < columnCount; i += 1) {
      row[`col_${i}`] = i === 1 ? '대기' : '';
    }
    return row;
  });

export default function App() {
  const [columnCount, setColumnCount] = useState(3);
  const [rowData, setRowData] = useState<GridRow[]>(() => defaultRows());
  const [timer, setTimer] = useState<TimerState>({
    initialSeconds: 300,
    remainingSeconds: 300,
    running: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(GRID_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as { columnCount: number; rowData: GridRow[] };
      const loadedColumnCount = Math.max(2, parsed.columnCount ?? 3);
      setColumnCount(loadedColumnCount);
      setRowData(ensureShape(parsed.rowData ?? defaultRows(), loadedColumnCount));
    } catch {
      setColumnCount(3);
      setRowData(defaultRows());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      GRID_STORAGE_KEY,
      JSON.stringify({
        columnCount,
        rowData,
      })
    );
  }, [columnCount, rowData]);

  useEffect(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as TimerState;
      setTimer({
        initialSeconds: Math.max(0, parsed.initialSeconds ?? 300),
        remainingSeconds: Math.max(0, parsed.remainingSeconds ?? 300),
        running: Boolean(parsed.running),
      });
    } catch {
      setTimer({ initialSeconds: 300, remainingSeconds: 300, running: false });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    if (!timer.running || timer.remainingSeconds <= 0) return;

    const id = window.setInterval(() => {
      setTimer((prev) => {
        const next = Math.max(prev.remainingSeconds - 1, 0);
        if (next === 0 && prev.running) {
          window.speechSynthesis.cancel();
          const message = new SpeechSynthesisUtterance('타이머 종료');
          message.lang = 'ko-KR';
          window.speechSynthesis.speak(message);
        }
        return {
          ...prev,
          remainingSeconds: next,
          running: next > 0,
        };
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [timer.running, timer.remainingSeconds]);

  const columnDefs = useMemo(() => {
    const cols: ColDef<GridRow>[] = [];
    for (let i = 0; i < columnCount; i += 1) {
      cols.push(createColumn(i));
    }
    return cols;
  }, [columnCount]);

  const addRow = () => {
    setRowData((prev) => {
      const row: GridRow = {};
      for (let i = 0; i < columnCount; i += 1) {
        row[`col_${i}`] = i === 1 ? '대기' : '';
      }
      return [...prev, row];
    });
  };

  const addColumn = () => {
    setColumnCount((prev) => {
      const next = prev + 1;
      setRowData((rows) =>
        rows.map((row) => ({
          ...row,
          [`col_${next - 1}`]: '',
        }))
      );
      return next;
    });
  };

  const format = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <main className="app">
      <h1>React + TS + Vite 편집 그리드</h1>

      <section className="panel">
        <div className="toolbar">
          <button onClick={addRow}>행 추가</button>
          <button onClick={addColumn}>열 추가</button>
        </div>
        <div className="ag-theme-alpine grid-wrap">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            stopEditingWhenCellsLoseFocus
            enableRangeSelection
            onCellValueChanged={({ data, rowIndex }) => {
              if (rowIndex == null) return;
              setRowData((prev) => {
                const next = [...prev];
                next[rowIndex] = data;
                return next;
              });
            }}
          />
        </div>
        <p className="hint">복사/붙여넣기는 셀 선택 후 Ctrl/Cmd + C, Ctrl/Cmd + V를 사용하세요.</p>
      </section>

      <section className="panel">
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
          <strong>{format(timer.remainingSeconds)}</strong>
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
