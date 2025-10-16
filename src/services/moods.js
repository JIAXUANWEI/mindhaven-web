import { db } from '../firebase';
import { doc, setDoc, getDocs, collection, query, orderBy, where } from 'firebase/firestore';

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const MOODS = [
  { key: 'awful', emoji: '😞', score: 1, label: 'Awful' },
  { key: 'bad', emoji: '🙁', score: 2, label: 'Bad' },
  { key: 'meh', emoji: '😐', score: 3, label: 'Meh' },
  { key: 'good', emoji: '🙂', score: 4, label: 'Good' },
  { key: 'great', emoji: '😄', score: 5, label: 'Great' },
];

export async function saveMood(uid, { day = dateKey(), moodKey, note = '' }) {
  if (!uid) throw new Error('uid required');
  const ref = doc(db, `users/${uid}/moods/${day}`);
  const mood = MOODS.find(m => m.key === moodKey) || MOODS[2];
  const now = new Date().toISOString();
  await setDoc(ref, { day, moodKey: mood.key, score: mood.score, note, updatedAt: now }, { merge: true });
}

export async function listMoods(uid, { startDay, endDay } = {}) {
  if (!uid) throw new Error('uid required');
  const col = collection(db, `users/${uid}/moods`);
  const clauses = [];
  if (startDay) clauses.push(where('day', '>=', startDay));
  if (endDay) clauses.push(where('day', '<=', endDay));
  const q = query(col, ...clauses, orderBy('day', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export function toCSV(rows) {
  const header = ['day', 'mood', 'score', 'note'];//定义 CSV 文件的第一行表头（列名）
  const lines = [header.join(',')];//用 join(',') 拼成："day,mood,score,note"
  for (const r of rows) {
    const cells = [r.day, r.moodKey, String(r.score), (r.note || '').replace(/\n/g, ' ').replace(/"/g, '""')];//note当中把换行符替换成空格，如果 note 里有引号，要加倍
    lines.push(cells.map(c => /[,"]/.test(c) ? `"${c}"` : c).join(','));//如果单元格中含有 逗号或引号，就必须用双引号包裹起来//map把数组中的每个元素取出来（这里叫 c），然后执行后面的箭头函数表达式。循环执行 4 次，依次处理：第一次：c = "2025-10-13"第二次：c = "happy"第三次：c = "9"第四次：c = "Tired, need rest."
  }
  return lines.join('\n');//把表头和所有行连接成一个完整的文本，用换行符分隔
}

export function download(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });//把文本内容（content）放入 Blob 对象；Blob 就是“二进制大对象”，相当于内存中的一个临时文件
  const url = URL.createObjectURL(blob);//为这个 Blob 生成一个浏览器可访问的临时链接
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);//把创建的 <a> 超链接标签添加到网页的 <body> 里。
  a.click();
  a.remove();//是 DOM API，用来把这个 <a> 元素从页面中移除
  URL.revokeObjectURL(url);//下载完成后撤销临时 URL，释放资源
}


