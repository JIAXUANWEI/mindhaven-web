<template>
  <div>
    
   <div class="hero-wrapper">
    <div class="track">
      <!-- 背景 -->
      <div class="background" ref="background"></div>
      <!-- 小人 -->
      <div class="runner" ref="runner"></div>
      <!-- 内容 -->
      <div class="hero-text" :class="{ show: showSupport }">
        <h1 class="fw-bold">Mindhaven</h1>
        <p class="lead" >Get support now</p>
        <button class="btn btn-dark">Go</button>
      </div>
       <!-- 恶魔（固定在跑道上的一个位置） -->
      <div class="demon" :class="{ show: showDemon }" ref="demon"></div>
      <!-- 恶魔台词气泡 -->
      <div class="speech" :class="{ show: showDemon }" ref="speech">
        <p>{{ demonLine }}</p>
      </div>
    </div>

     
   </div>

    <!-- Listen to Others -->
    <section class="container-fluid bg-light py-5 text-center">
        <h2 class="mb-4">LISTEN TO OTHERS</h2>
        <div class="row g-0" >
          <div class="col-md-4" v-for="n in 3" :key="n">
            <div class="card h-100 shadow-sm">
              <img src="https://via.placeholder.com/150" class="card-img-top rounded-circle p-3" />
              <div class="card-body">
                <p class="card-text">Story preview text here...</p>
              </div>
            </div>
          </div>
        </div>
    </section>

    <!-- Learn by Resources -->
    <section class="container-fluid py-5 d-flex align-items-center">
      <img src="https://via.placeholder.com/250x150" class="img-fluid me-4" />
      <div>
        <h2>LEARN BY RESOURCES</h2>
        <p>Explore resources about mental health, wellbeing, and relationships.</p>
      </div>
    </section>

    <!-- Get Support -->
    <section class="container-fluid bg-light py-5 text-center">
        <h2 class="mb-4">GET SUPPORT FROM PROFESSIONALS</h2>
        <div class="row g-4">
          <div class="col-md-4" v-for="(support, i) in supports" :key="i">
            <div class="card h-100 shadow-sm p-3">
              <img src="https://via.placeholder.com/150" class="card-img-top rounded-circle" />
              <div class="card-body">
                <h5>{{ support.title }}</h5>
                <button class="btn btn-dark">{{ support.button }}</button>
              </div>
            </div>
          </div>
        </div>
    </section>
  </div>
</template>

<script>
import demonUrl from '../assets/demon.png' 
export default {
  name: "HomeView",
  data() {
    return {
      supports: [
        { title: "Crisis Hotlines", button: "CRISIS HOTLINES" },
        { title: "Local Services", button: "LOCAL SERVICES" },
        { title: "Online Counselling", button: "ONLINE COUNSELLING" }
      ],
      showSupport: false,
      // 恶魔相关
      showDemon: false,
      demonLine: "",
    };
  },

mounted() {
    const runner = this.$refs.runner;
    const background = this.$refs.background;
  const demon = this.$refs.demon;
       if (demon) {
      demon.style.backgroundImage   = `url(${demonUrl})`;
      demon.style.backgroundSize    = 'contain';
      demon.style.backgroundRepeat  = 'no-repeat';
      demon.style.backgroundPosition= 'center';
    }
  const speech = this.$refs.speech;

   // 两次出现的时间窗口（进度区间）与位置（相对跑道宽度 0~1）。时间区间只是告诉“出现多久”，pos 决定“出现在哪里”
  const ENCOUNTER1 = { start: 0.06, end: 0.20, pos: 0.25 };
  const ENCOUNTER2 = { start: 0.35, end: 0.48, pos: 0.53 };

  // 每次出现要说的话（会按区间进度切换到下一句）
  const demonScript1 = [
    "Do you feel like no one really understands you?",
    "Do you feel lonely?"
  ];
  const demonScript2 = [
    "You don't have to bear those emotions alone.",
    "Try telling us."
  ];
// document.body.scrollHeight → 页面内容的总高度。
// window.innerHeight → 浏览器窗口高度。
// maxScroll = 最大可滚动距离。
// window.scrollY → 当前已经滚动的像素。
// progress = 已滚动 / 可滚动总长 → 得到一个 0~1 的比例。
    window.addEventListener("scroll", () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;//内容高度减去窗口高度
      const progress = window.scrollY / maxScroll; // 0 ~ 1

      // 🏃 小人横向移动
      const stopProgress = 0.72;
  const trackWidth = window.innerWidth - 100;
  const runnerProgress = Math.min(progress, stopProgress); // 小人只走到0.72
  runner.style.left = `${runnerProgress * trackWidth}px`;

      // 🎞️ 小人帧动画（20 帧）
      const totalFrames = 20;
      const frameWidth = 100;
      const frameIndex = Math.floor(progress * totalFrames);
      runner.style.backgroundPosition = `-${frameIndex * frameWidth}px 0`;

      // 背景横向移动
      const bgProgress = Math.min(progress, stopProgress);
      background.style.backgroundPositionX = `${bgProgress * 100}%`;
      // 显示网站名字
      this.showSupport = progress > 0.65;

// 5.1 计算恶魔宽度（用于居中与气泡偏移）
    const demonW = demon?.offsetWidth || 120;
    // 工具函数
    const inWin = (p, w) => p >= w.start && p < w.end;// 判断当前进度是否在恶魔出现的区间内
    const localT = (p, w) => (p - w.start) / (w.end - w.start); // 0~1
      const pickLine = (t, lines) => lines[Math.min(lines.length - 1, Math.floor(t * lines.length))];
      //t * lines.length → 根据进度算出应该在哪一句。Math.floor() → 向下取整，得到当前台词索引。Math.min() → 防止越界（最后一句保持）。

    let show = false;// 是否显示恶魔
    let leftPx = null; // 恶魔的水平坐标
    let line = "";// 当前显示的台词

    if (inWin(progress, ENCOUNTER1)) {
      const t = localT(progress, ENCOUNTER1);//恶魔在第一次出现区间内的进度 0~1
      show = true;
      leftPx = ENCOUNTER1.pos * (window.innerWidth - demonW);
      line = pickLine(t, demonScript1);
    } else if (inWin(progress, ENCOUNTER2)) {
      const t = localT(progress, ENCOUNTER2);
      show = true;
      leftPx = ENCOUNTER2.pos * (window.innerWidth - demonW);
      line = pickLine(t, demonScript2);
    }

    if (demon) {
      // 固定在“地面”线上，水平位置按当前出现段设置
      if (leftPx !== null) demon.style.left = `${leftPx}px`;
      // 通过 opacity 实现淡入淡出
      demon.style.opacity = show ? "1" : "0";
    }
    if (speech && demon) {
      // 气泡居中在恶魔上方
      if (leftPx !== null) {
        // 恶魔的中心点
        const demonCenter = leftPx + demonW / 2;
        speech.style.left = `${demonCenter}px`;
      }
      // 气泡底部紧贴恶魔顶部
      const demonBottom = parseFloat(getComputedStyle(demon).bottom) || 0;
      const demonHeight = demon.offsetHeight || 120;
      // 气泡底部 = 恶魔底部 + 恶魔高度 + 间距
      speech.style.bottom = `calc(${demonBottom}px + ${demonHeight + 12}px)`;
      this.showDemon = show;
      if (show) this.demonLine = line;
    }
  });
}
};
      




</script>

<style scoped>
.hero-wrapper {
  height: 700vh; /* 根据需要调整 */
  position: relative;
}

.track {
  position: sticky; /* 固定在视口 */
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: url('../assets/background.jpg') no-repeat;
  background-size: 300% 100%; /* 3段拼在一起时，宽度 = 3倍 */
  background-position-x: 0%;
  z-index: 0;
}

.runner {
  position: absolute;
  bottom:  clamp(100px, 95vh, 125px);
  left: 0;
  width: 100px;
  height: 100px;
  background: url('../assets/runner-sprite.png') no-repeat;
  background-size: 2000px 100px; /* 20 帧精灵图 */
  z-index: 1;
}

.demon {
  position: absolute;
  bottom: clamp(200px, 90vh, 300px); 
  width: 180px;
  height: 180px;
  z-index: 2;
  opacity: 0;
  transition: opacity .4s ease;
}

/* 台词气泡 */
.speech {
  position: absolute;
  bottom: calc(clamp(70px, 85vh, 100px) + 110px);
  transform: translateX(-50%);
  max-width: min(60ch, 42vw);
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(0,0,0,.7);
  color: #fff;
  line-height: 1.5;
  opacity: 0;
  pointer-events: none;
  transition: opacity .3s ease;
  z-index: 3;
}
.speech.show{opacity:1}

.hero-text {
  position: absolute;
  top: 30%;
  right: 10%;   /* 改成靠右 */
  text-align: right;
  color: white;
  opacity: 0;
  transition: opacity 1s ease;
}
.hero-text.show {
  opacity: 1;
}

.hero-text .lead {
  opacity: 0;
  transition: opacity 1s ease;
}
.hero-text .lead.show {
  opacity: 1;
}
</style>

