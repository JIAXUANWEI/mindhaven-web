<template>
  <div class="container py-2" style="margin-top:80px">

    <div v-if="!user" class="alert alert-warning">Please log in to track your mood.</div>

    <div v-else class="card p-3 mb-4">
      <div class="d-flex align-items-center flex-wrap gap-2 mb-3 offset-2">
        <strong class="me-2" style="font-size: 22px; color: #382c80;">Today i am</strong>
        <!-- 动态绑定类名：如果该按钮是选中的（即当前按钮的 key 等于表单中保存的 key），则添加 active 类让它高亮 -->
        <button v-for="m in MOODS" :key="m.key" class="btn-outline-primary" style="border-color: #382c80;"
                :class="{active: m.key===form.moodKey}" @click="form.moodKey=m.key">
          <span style="font-size:22px">{{ m.emoji }}</span>
          <span class="ms-1">{{ m.label }}</span>
        </button>
      </div>
      <textarea v-model="form.note" class="form-control mb-3" rows="3" placeholder="Short journal (optional)"></textarea>
      <div class="d-flex gap-2">
        <button class="btn btn-success" @click="saveToday" :disabled="saving">Save Today</button>
        <span v-if="savedMsg" class="text-success">{{ savedMsg }}</span>
      </div>
    </div>

    <div class="card p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2 text-black">
        <h5 class="m-0">Last 30 days record</h5>
        <div class="d-flex gap-2 ">
          <button class="btn btn-outline-light btn-sm text-black" @click="exportCSV">Export CSV</button>
          <button class="btn btn-outline-light btn-sm text-black" @click="exportPDF">Export PDF</button>
          <button class="btn btn-outline-light btn-sm text-black" @click="sendEmail">Send Email</button>
        </div>
      </div>
    </div>

    <div class="card p-3 text-black">
      <div v-if="rows.length===0" class="text-muted">No entries yet.</div>
      <ul class="list-group">
        <li v-for="r in rows" :key="r.day" class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ r.day }}</strong>
            <span class="ms-2" style="font-size:20px">{{ emojiOf(r.moodKey) }}</span>
            <span class="ms-2 text-muted">{{ r.note }}</span>
          </div>
          <span class="badge bg-secondary">{{ r.score }}</span>
        </li>
      </ul>
    </div>

    <!-- No modal needed: email uses logged-in address and fixed subject -->
  </div>
  
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, projectId } from '../firebase';
import { MOODS, saveMood, listMoods, dateKey, toCSV, download } from '../services/moods';

const user = ref(null);

const form = reactive({ moodKey: 'meh', note: '' });
const rows = ref([]);
const saving = ref(false);
const savedMsg = ref('');
const emailSending = ref(false);

let unsubscribeAuth = null;
onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
    user.value = u;
    if (u) await refresh();
  });
});
onBeforeUnmount(() => { if (unsubscribeAuth) unsubscribeAuth(); });

function emojiOf(key) {
  const m = MOODS.find(x => x.key === key); return m ? m.emoji : '😐';
}

async function refresh() {
  if (!user.value) return;
  const end = new Date();
  const start = new Date(); start.setDate(end.getDate() - 29);
  const data = await listMoods(user.value.uid, { startDay: dateKey(start), endDay: dateKey(end) });
  rows.value = data;
}

async function saveToday() {
  if (!user.value) return;
  saving.value = true; savedMsg.value = '';
  try {
    await saveMood(user.value.uid, { moodKey: form.moodKey, note: form.note, day: dateKey(new Date()) });
    savedMsg.value = 'Saved!';
    refresh();
  } finally {
    saving.value = false; setTimeout(() => savedMsg.value = '', 1500);
  }
}


function exportCSV() {
  const csv = toCSV(rows.value);//把数据数组转换成一个 CSV 格式的字符串
  download(`moods-${dateKey(new Date())}.csv`, csv, 'text/csv');//`moods-${dateKey(new Date())}.csv`这是一个模板字符串，最终会生成一个文件名
}

function exportPDF() {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Mood Export</title>
    <style>body{font-family:Arial;padding:20px} h2{margin:0 0 10px} table{border-collapse:collapse;width:100%} td,th{border:1px solid #ddd;padding:6px}</style>
  </head><body>
  <h2>Mood Export</h2>
  <p>Date: ${new Date().toLocaleString()}</p>
  <table><thead><tr><th>Day</th><th>Mood</th><th>Score</th><th>Note</th></tr></thead>
  <tbody>
  ${rows.value.map(r => `<tr><td>${r.day}</td><td>${emojiOf(r.moodKey)} ${r.moodKey}</td><td>${r.score}</td><td>${(r.note || '').replace(/</g, '&lt;')}</td></tr>`).join('')}
  </tbody></table>
  </body></html>`;
  const w = window.open('', '_blank'); w.document.write(html); w.document.close(); w.focus(); w.print();
}

async function sendEmail() {
  if (!user.value) return alert('Please login first');
  emailSending.value = true;
  try {
    const token = await auth.currentUser.getIdToken();
    const resp = await fetch(`https://us-central1-${projectId}.cloudfunctions.net/sendMoodExportHttp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rows: rows.value })
    });
    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status}: ${errBody}`);
    }
    const data = await resp.json();
    if (!data?.ok) throw new Error('Send failed');
    alert('Email sent to your account address.');
  } catch (e) {
    console.error(e);
    alert('Failed to send email: ' + e.message);
  } finally { emailSending.value = false; }
}
</script>

<style scoped>
.card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color:#fff }
.btn-outline-primary.active { background:#d39219; color:#fff ; border: #d39219;}
.list-group-item{ background: rgba(0,0,0,0.1); color:#fff }

/* custom modal to avoid Bootstrap stacking context issues inside nested views */
.mh-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
}
.mh-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: calc(100% - 40px);
  background: #fff;
  color: #222;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  padding: 16px;
  z-index: 2001;
}
</style>
