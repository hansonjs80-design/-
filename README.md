# React + TypeScript + Vite 스프레드시트 예제

엑셀처럼 편집 가능한 그리드(AG Grid)와 타이머를 포함한 웹앱입니다.

## 기능

- 셀 편집
- 셀 복사/붙여넣기(Ctrl/Cmd + C, Ctrl/Cmd + V)
- 행 추가 / 열 추가
- 드롭다운 컬럼 제공 (`상태`: 대기/진행/완료)
- 타이머(시작/정지/리셋, 남은시간 표시)
- 남은시간 0초 도달 시 브라우저 TTS로 `타이머 종료` 음성 안내
- 그리드 데이터 및 타이머 상태를 `localStorage`에 자동 저장

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 Vite 개발 서버 주소(기본 `http://localhost:5173`)로 접속합니다.

## 빌드

```bash
npm run build
npm run preview
```

