# 宝石消除游戏 (Brick Crush Game)

一个基于HTML5 Canvas的三消类宝石消除游戏，具有丰富的视觉效果和道具系统。

## 🎮 游戏特色

- **经典三消玩法**：交换相邻宝石，消除3个或更多相同颜色的宝石
- **道具系统**：包含炸弹💣、闪电⚡、彩虹🌈三种强力道具
- **视觉效果**：粒子特效、爆炸动画、连击提示
- **音效系统**：背景音乐和丰富的游戏音效
- **响应式设计**：适配不同屏幕尺寸

## 🚀 在线体验

[点击这里在线游玩](https://superxsy.github.io/brickcrushgame/)

## 🛠️ 本地运行

1. 克隆仓库：
```bash
git clone https://github.com/superxsy/brickcrushgame.git
cd brickcrushgame
```

2. 启动本地服务器：
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx serve .
```

3. 在浏览器中访问 `http://localhost:8000`

## 🎯 游戏玩法

### 基本操作
- **鼠标点击**：选择宝石
- **拖拽**：交换相邻宝石位置
- **消除**：连接3个或更多相同颜色的宝石

### 道具系统
- **炸弹💣**：消除3x3区域内的所有宝石
- **闪电⚡**：消除整行和整列的宝石
- **彩虹🌈**：消除所有相同颜色的宝石

### 获得道具
- 消除4个宝石：50%概率获得炸弹
- 消除5个或更多宝石：随机获得一个道具

## 📁 项目结构

```
brickcrushgame/
├── index.html      # 游戏主页面
├── style.css       # 样式文件
├── script.js       # 游戏逻辑
├── favicon.ico     # 网站图标
└── README.md       # 项目说明
```

## 🔧 技术栈

- **HTML5 Canvas**：游戏渲染
- **CSS3**：样式和动画
- **JavaScript ES6+**：游戏逻辑
- **Web Audio API**：音效系统

## 📝 更新日志

### v1.0.0
- ✅ 基础三消游戏机制
- ✅ 道具系统（炸弹、闪电、彩虹）
- ✅ 粒子特效和动画
- ✅ 音效系统
- ✅ 响应式设计

## 🤝 贡献

欢迎提交Issue和Pull Request来改进游戏！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

[@superxsy](https://github.com/superxsy)

---

⭐ 如果你喜欢这个项目，请给它一个星标！