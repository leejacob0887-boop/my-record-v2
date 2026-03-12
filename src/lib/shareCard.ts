export type ShareCardData = {
  type: 'diary' | 'moment' | 'idea';
  title: string;
  content: string;
  date: string;
  isDark: boolean;
};

const TYPE_META = {
  diary:  { emoji: '📖', label: '일기' },
  moment: { emoji: '⚡', label: '메모' },
  idea:   { emoji: '💡', label: '아이디어' },
};

const COLORS = {
  diary: {
    light: ['#EEF2FF', '#C7D2FE'] as [string, string],
    dark:  ['#1E1B4B', '#312E81'] as [string, string],
    text:  { light: '#1E40AF', dark: '#E0E7FF' },
    sub:   { light: '#6366F1', dark: '#A5B4FC' },
  },
  moment: {
    light: ['#F0F9FF', '#BAE6FD'] as [string, string],
    dark:  ['#0C1A2E', '#082F49'] as [string, string],
    text:  { light: '#0369A1', dark: '#E0F2FE' },
    sub:   { light: '#0EA5E9', dark: '#7DD3FC' },
  },
  idea: {
    light: ['#FEFCE8', '#FEF08A'] as [string, string],
    dark:  ['#1C1917', '#292524'] as [string, string],
    text:  { light: '#92400E', dark: '#FEF9C3' },
    sub:   { light: '#D97706', dark: '#FDE68A' },
  },
};

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  let line = '';
  let lineCount = 0;
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i];
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      if (lineCount === maxLines - 1) {
        while (ctx.measureText(line + '…').width > maxWidth && line.length > 0) {
          line = line.slice(0, -1);
        }
        ctx.fillText(line + '…', x, startY + lineCount * lineHeight);
        return startY + (lineCount + 1) * lineHeight;
      }
      ctx.fillText(line, x, startY + lineCount * lineHeight);
      line = text[i];
      lineCount++;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, startY + lineCount * lineHeight);
  return startY + (lineCount + 1) * lineHeight;
}

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const W = 900, H = 560, PAD = 56;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const scheme = COLORS[data.type];
  const isDark = data.isDark;
  const FONT = '-apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

  // 1. 배경 그라디언트
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, isDark ? scheme.dark[0] : scheme.light[0]);
  grad.addColorStop(1, isDark ? scheme.dark[1] : scheme.light[1]);
  roundRectPath(ctx, 0, 0, W, H, 32);
  ctx.fillStyle = grad;
  ctx.fill();

  const textColor = isDark ? scheme.text.dark : scheme.text.light;
  const subColor  = isDark ? scheme.sub.dark  : scheme.sub.light;
  const divColor  = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)';
  const meta = TYPE_META[data.type];

  // 2. 타입 이모지
  ctx.font = `48px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.fillText(meta.emoji, PAD, PAD + 48);

  // 3. 타입 라벨
  ctx.font = `500 15px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.fillText(meta.label, PAD + 64, PAD + 36);

  // 4. 날짜
  ctx.font = `400 13px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.fillText(data.date, PAD + 64, PAD + 56);

  // 5. 앱 이름 (우측 상단)
  ctx.font = `600 14px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.textAlign = 'right';
  ctx.fillText('나의 기록', W - PAD, PAD + 36);
  ctx.textAlign = 'left';

  // 6. 제목
  ctx.font = `bold 30px ${FONT}`;
  ctx.fillStyle = textColor;
  wrapText(ctx, data.title, PAD, PAD + 124, W - PAD * 2, 44, 2);

  // 7. 내용 미리보기
  ctx.font = `400 18px ${FONT}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.52)';
  wrapText(ctx, data.content, PAD, PAD + 196, W - PAD * 2, 32, 3);

  // 8. 구분선
  ctx.strokeStyle = divColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, H - 88);
  ctx.lineTo(W - PAD, H - 88);
  ctx.stroke();

  // 9. 앱 서명
  ctx.font = `400 13px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.fillText('나의 기록 · my-record', PAD, H - 52);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('canvas toBlob failed')),
      'image/png',
    );
  });
}

export async function shareCard(data: ShareCardData): Promise<void> {
  const blob = await generateShareCard(data);
  const file = new File([blob], 'my-record-card.png', { type: 'image/png' });

  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare?.({ files: [file] })
  ) {
    await navigator.share({ files: [file], title: data.title });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-record-card.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
