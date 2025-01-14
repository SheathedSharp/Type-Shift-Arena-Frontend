<!--
 * @Author: SheathedSharp z404878860@163.com
 * @Date: 2024-10-27 17:59:31
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-01-14 17:23:56
-->
<div align="center">
  
# Type Shi(f)t Arena 

<div>
  <a href="README.MD">
    <img src="https://img.shields.io/badge/English-README-blue.svg?style=for-the-badge" height="22px" />
  </a>
  <a href="README_CN.MD">
    <img src="https://img.shields.io/badge/中文-说明文档-red.svg?style=for-the-badge" height="22px" />
  </a>
</div>

<div style="margin-top: 5px">
  <a href="CONTRIBUTING.MD">
    <img src="https://img.shields.io/badge/English-Contributing-green.svg?style=for-the-badge" height="22px" />
  </a>
  <a href="CONTRIBUTING_CN.MD">
    <img src="https://img.shields.io/badge/中文-贡献指南-yellow.svg?style=for-the-badge" height="22px" />
  </a>
</div>

---

</div>

Type Shi(f)t Arena 是一个小型又友好的竞技打字项目，将实时游戏玩法与有趣的机制相结合。它包括使用 Vue.js 构建的前端和由 Spring Boot 驱动的后端，填充当前WEB网页市面上好的练习打字平台的空缺，为好友友好切磋，或爱好者提供无缝、强大的用户体验。**本仓库是项目的前端部分。** 后端仓库在[这里](https://github.com/SheathedSharp/Type-Shift-Arena-Backend)

## 🎮 主要特性 (前端)
- **实时游戏**: 动态匹配系统和多种游戏模式，包括休闲和排位赛，并提供实时性能追踪
- **打字练习**: 泡泡射击练习模式，具有渐进式难度关卡和实时性能分析
- **用户界面**: 现代化、响应式设计，采用玻璃态UI，流畅动画，并针对长时间游戏优化的暗色模式
- **多语言支持**: 完整的国际化支持，支持多种语言（目前支持中文和英文），具有可扩展的语言系统

## 🛠️ 技术栈 (前端)
- **框架**: Vue 3 (组合式 API)
- **工具**: Vite 构建工具, WebSocket 实时功能, Element Plus UI组件库, Font Awesome 图标
- **设计**: 响应式、基于组件的UI设计，自定义动画

## 界面预览

![snapshot](./public/img/login.png)
![snapshot](./public/img/friend.png)
![snapshot](./public/img/profile.png)
![snapshot](./public/img/gameroom.png)
![snapshot](./public/img/gamelobby.png)
![snapshot](./public/img/typePractice.png)
![snapshot](./public/img/createRoomDialog.png)
![snapshot](./public/img/gameResultDialog.png)
![snapshot](./public/img/setting.png)
![snapshot](./public/img/matchMakeLobby.png)

## 运行应用

1. 切换到项目根目录
```bash
cd /path/to/project/root
```
2. 安装依赖
```bash
npm install
```
3. 运行应用
```bash
npm run dev
```
