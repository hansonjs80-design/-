# React + TypeScript + Vite 편집 그리드 앱

엑셀처럼 편집 가능한 그리드 UI와 타이머를 포함한 웹앱입니다.

## 기능

- 셀 편집
- 셀 복사/붙여넣기 (Ctrl/Cmd + C, Ctrl/Cmd + V)
- 행 추가 / 열 추가
- 드롭다운 컬럼 제공 (`상태`: 대기/진행/완료)
- 타이머: 시작 / 정지 / 리셋, 남은시간 표시
- 남은시간이 0초가 되면 브라우저 TTS로 `타이머 종료` 음성 안내
- 그리드/타이머 데이터를 `localStorage`에 자동 저장

## 실행 방법

```bash
npm install
npm run dev
```

기본 개발 서버 주소: `http://localhost:5173`

## 빌드

```bash
npm run build
npm run preview
```
