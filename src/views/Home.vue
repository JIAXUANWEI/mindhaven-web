<template>
  <div>
    
   <div class="hero-wrapper">
    <div class="track">
      <!-- 背景 -->
      <div class="background" ref="background"></div>
      <!-- <div class="bg-art-text">stay with us</div> -->
      <!-- 小人 -->
      <div class="runner" ref="runner"></div>
      <!-- 内容 -->
      <div class="hero-text" :class="{ show: showSupport }" >
        <h1 class="fw-bold">Mindhaven</h1>
        <p class="lead" >Get support now</p>
        <router-link to="/professionals"><button class="btn btn-dark">Go</button></router-link>
      </div>
       <!-- 恶魔 图片改天使了但是我懒得换了后面都是demo -->
      <div class="demon" :class="{ show: showDemon }" ref="demon"></div>
      <!-- 恶魔台词气泡 -->
      <div class="speech" :class="{ show: showDemon }" ref="speech">
        <p>{{ demonLine }}</p>
      </div>
    </div>

     
   </div>

    <!-- Listen to Others -->
    <section class="container-fluid bg-dark-gray py-5 text-center">
        <h2 class="mb-4">LISTEN TO OTHERS</h2>
        <div v-if="loadingStories" class="text-center py-5">Loading…</div>
            <div v-else-if="storiesError" class="alert alert-danger">{{ storiesError }}</div>
            <!-- 故事卡片 -->
            <div v-else class="row g-4 justify-content-center px-3">
              <div class="col-md-4" v-for="s in featuredStories" :key="s.id">
                <StoryCard :story="s" />
              </div>
            </div>

            <router-link to="/stories" class="btn btn-light btn-lg mt-4 px-4 py-2">
              View All Stories
            </router-link>
    </section>

    <!-- Learn by Resources -->

        <section class="container-fluid bg-dark-gray py-5 text-center">
        <h2 class="mb-4">LEARN BY RESOURCES</h2>
        <div v-if="loadingResources" class="text-center py-5">Loading…</div>
            <div v-else-if="resourcesError" class="alert alert-danger">{{ resourcesError }}</div>
            <!-- 资源卡片 -->
            <div v-else class="row g-4 justify-content-center px-3">
              <div class="col-md-4" v-for="r in featuredResources" :key="r.id">
                <ResourceCard :resource="r" />
              </div>
            </div>

            <router-link to="/resources" class="btn btn-light btn-lg mt-4 px-4 py-2">
              View All Resources
            </router-link>
    </section>

  

    <!-- Get Support -->
    <section class="container-fluid bg-dark-gray py-5 text-center">
      <h2 class="mb-4">GET SUPPORT FROM PROFESSIONALS</h2>
      <div class="container-sm">
              <router-link to="/professionals" class="btn btn-primary">
                Open Professionals Map
              </router-link>
            
      </div>
    </section>

        <!-- 返回顶部按钮 -->
    <button 
      v-show="showButton" 
      class="btn btn-primary back-to-top" 
      @click="scrollToTop">
      <i class="iconfont icon-arrowup"></i>
    </button>
  </div>
</template>

<script>
import demonUrl from '../assets/demon.png' 
import StoryCard from "../components/StoryCard.vue";
import ResourceCard from "../components/ResourceCard.vue";
import { fetchFeaturedStories } from "../services/stories";
import { fetchFeaturedResources } from "../services/resources";
export default {
  name: "HomeView",
  components: { StoryCard, ResourceCard },
  data() {
    return {
      showSupport: false,
      // 恶魔相关
      showDemon: false,
      demonLine: "",
      showButton: false,
      // 故事相关
      featuredStories: [],
      loadingStories: true,
      storiesError: "",
      // 资源相关
      featuredResources: [],
      loadingResources: true,
      resourcesError: ""
    };
  },

async mounted() {
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
    const ENCOUNTER1 = { start: 0.04, end: 0.23, pos: 0.27 };
    const ENCOUNTER2 = { start: 0.30, end: 0.51, pos: 0.55 };

    // 每次出现要说的话（会按区间进度切换到下一句）
    const demonScript1 = [
    "Do you feel like no one really understands you?",
    "Do you feel lonely?"
    ];
    const demonScript2 = [
    "You don't have to bear those emotions alone.",
    "Try telling us."
  ];
    //scroll to top
    window.addEventListener("scroll", this.handleScroll);
    // document.body.scrollHeight → 页面内容的总高度。
    // window.innerHeight → 浏览器窗口高度。
    // maxScroll = 最大可滚动距离。
    // window.scrollY → 当前已经滚动的像素。
    // progress = 已滚动 / 可滚动总长 → 得到一个 0~1 的比例。
    window.addEventListener("scroll", () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;//内容高度减去窗口高度
      const progress = window.scrollY / maxScroll; // 0 ~ 1

      // 小人横向移动
      const stopProgress = 0.75;
      const trackWidth = window.innerWidth - 100;
      const runnerProgress = Math.min(progress, stopProgress); // 小人只走到0.72
      runner.style.left = `${runnerProgress * trackWidth}px`;

      //小人帧动画（20 帧）
      const totalFrames = 20;
      const frameWidth = 100;
      const frameIndex = Math.floor(progress * totalFrames);
      runner.style.backgroundPosition = `-${frameIndex * frameWidth}px 0`;

      // 背景横向移动
      const bgProgress = Math.min(progress, stopProgress);
      background.style.backgroundPositionX = `${bgProgress * 100}%`;
      // 显示网站名字
      this.showSupport = progress > 0.65 && progress < 0.75;

      // 计算恶魔宽度（用于居中与气泡偏移）
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

    try {
      this.featuredStories = await fetchFeaturedStories({ size: 3 });
      this.storiesError = "";
    } catch (e) {
      console.error(e);
      this.storiesError = "Failed to load stories.";
    } finally {
      this.loadingStories = false;
    }

    // 加载精选资源
    try {
      this.featuredResources = await fetchFeaturedResources({ size: 3 });
      this.resourcesError = "";
    } catch (e) {
      console.error(e);
      this.resourcesError = "Failed to load resources.";
    } finally {
      this.loadingResources = false;
    }
    
  },
  
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  // 返回顶部按钮相关
  methods: {
    handleScroll() {
      this.showButton = window.scrollY > 5000; // 滚动超过 5000px 才显示按钮
    },
    scrollToTop() {
      window.scrollTo({
        top: 4350,           // 纵向滚动到 500px 高度
        behavior: "smooth"  // 平滑滚动
      });
    }
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

.bg-art-text {
  position: absolute;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Pacifico', cursive, 'Comic Sans MS', 'Arial', sans-serif;
  font-size: 5rem;
  color: #fff;
  text-shadow: 4px 4px 16px rgba(0,0,0,0.25), 0 0 32px #ff9800;
  letter-spacing: 4px;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  opacity: 0.7;
}

.runner {
  position: absolute;
  bottom:  clamp(60px, 14vh, 150px);
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
  padding: 16px 22px;
  border-radius: 18px;
  background: linear-gradient(135deg, #9370DB 60%, #fff3e0 100%);
  color: #222;
  font-size: 1.15rem;
  font-family: 'Segoe UI', 'Arial', sans-serif;
  line-height: 1.6;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18), 0 1.5px 0 #fff inset;
  opacity: 0;
  pointer-events: none;
  transition: opacity .3s ease;
  z-index: 3;
  border: 2px solid #fff3e0;
}

/* 三角箭头 */
.speech::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -18px;
  transform: translateX(-50%);
  border-width: 12px 14px 0 14px;
  border-style: solid;
  border-color: #9370DB transparent transparent transparent;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.10));
}

.speech.show {
  opacity: 1;
}

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

.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #4facfe, #00f2fe); /* 蓝色渐变 */
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  opacity: 0.85;
}

/* 悬浮效果 */
.back-to-top:hover {
  transform: scale(1.1);
  opacity: 1;
  box-shadow: 0 6px 16px rgba(0,0,0,0.35);
}

/* 出现/消失的过渡 */
.back-to-top {
  transition: opacity 0.4s, transform 0.3s;
}

/* 温暖深蓝紫背景 - 与背景图完美融合 */
.bg-dark-gray {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
  color: #ffffff;
}

/* 新背景下的卡片样式调整 */
.bg-dark-gray .card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.bg-dark-gray .card-body {
  color: #ffffff;
}

.bg-dark-gray h2,
.bg-dark-gray h5 {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.bg-dark-gray p {
  color: #e8f4fd;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Learn by Resources 可点击区域样式 */
.bg-dark-gray .text-decoration-none {
  transition: all 0.3s ease;
  display: block;
}

.bg-dark-gray .text-decoration-none:hover {
  transform: translateY(-2px);
}

.bg-dark-gray .text-decoration-none:hover h2 {
  color: #4facfe !important;
  text-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}

.bg-dark-gray .text-decoration-none:hover p {
  color: #ffffff !important;
}

.bg-dark-gray .text-decoration-none:hover img {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.bg-dark-gray .text-decoration-none img {
  transition: all 0.3s ease;
}


</style>

