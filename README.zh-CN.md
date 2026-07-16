<p align="right">
  <a href="./README.md">English</a> · <strong>简体中文</strong>
</p>

# 造化（Zaohua）· AISoul Forge

AISoul Forge 是一个纯本地运行的 AI 灵魂锻造 Skill，用于创建、修复、融合、
演进、试镜和验证 AI 灵魂包。它生成六类运行时源文件，并按照 SOUL-6 开放标准
进行质量自检。

运行期间不会访问网络、上传内容、采集遥测、要求账号登录或自动检查更新。
仓库中的 AISoulHub.io 链接仅用于标准来源和版本引用。

## 当前版本

首个公开版本为 **v0.1.0 · 造化（Zaohua）**。代号取自《鵩鸟赋》“天地为炉兮，
造化为工”，既代表创造与演化，也呼应本项目在本地锻造 AI 灵魂的定位。

## 能力

- 从用户确认的灵魂蓝图生成六类运行时文件
- 修复现有 AI 灵魂包中的低分维度
- 合并多个 AI 灵魂时识别身份、关系、能力、风格和记忆冲突
- 在不破坏固定设定的情况下生成新版本
- 运行 SOUL-6 确定性检查和合成试镜
- 自动生成包含身份、使用方式、SOUL-6 与试镜结果的中英文包 README
- 生成机器可读报告、用户可读报告和本地 ZIP 包

## 安装 Skill

将 `skill/forge-ai-soul` 复制或链接到 AI Agent 宿主使用的 Skill 目录。Skill
采用标准 `SKILL.md` 结构，并在 `agents/openai.yaml` 中提供 Codex 界面元数据。

唯一的运行时前置条件是 Node.js 20 或更高版本。

## 本地 CLI

在仓库根目录运行：

```bash
node skill/forge-ai-soul/scripts/forge.mjs help
node skill/forge-ai-soul/scripts/forge.mjs init ./output/my-soul \
  --name "我的灵魂" --slug my-soul --language zh-CN
node skill/forge-ai-soul/scripts/forge.mjs validate ./output/my-soul --write
node skill/forge-ai-soul/scripts/forge.mjs audition-init ./output/my-soul
node skill/forge-ai-soul/scripts/forge.mjs audition-evaluate ./output/my-soul
node skill/forge-ai-soul/scripts/forge.mjs pack ./output/my-soul
```

`init` 只创建明确标注的脚手架。AI Agent 必须根据用户确认的灵魂蓝图替换全部
模板标记后，才能声明完成锻造。

## 包内容

AI 灵魂包包含六类运行时文件：

- `IDENTITY.md`：身份、角色、核心关系和不可打破设定
- `USER.md`：用户位置、称呼、关系距离和隐私边界
- `SOUL.md`：人格、价值观、语言系统、隐藏特质和示例台词
- `AGENTS.md`：场景响应、任务、冲突、高风险和回退协议
- `TOOLS.md`：真实能力、工具权限、高风险确认和安全替代
- `MEMORY.md`：可记忆内容、敏感信息、纠正、遗忘和长期演进

六类文件是职责分离，SOUL-6 是跨文件质量评价，两者不是一一对应关系。

质量与来源产物和运行时指令严格分离：

- `README.md`
- `manifest.json`
- `soul6-report.json`
- `quality-check.md`
- `forge-report.md`
- `auditions/`

试镜记录只属于合成质量验证，不是人格设定、运行时指令、记忆、真实用户对话或
真实经历。

每个生成包还包含面向使用者的 `README.md`，集中展示 AI 灵魂说明、接入方式、
SOUL-6 结果、合成试镜样例与来源信息。它会随初始化、测评、试镜和打包自动刷新，
但不属于运行时指令、人格设定或记忆，宿主不得自动加载。

## 完整示例

[`examples/lumen`](examples/lumen) 是一个完全合成的原创 AI 灵魂包，包含六类
运行时文件、默认 README、100/100 的 SOUL-6 标准报告、六组多轮试镜和完整
来源说明。测试会直接把该示例作为正向夹具，防止示例与评分器静默漂移。

## 范围边界

本项目不负责真人或公众人物蒸馏，也不允许欺骗性真人冒充。相关需求应使用专门
的人物蒸馏 Skill。来自真人、角色或其他作品的灵感必须转化为原创 AI 灵魂，并在
`manifest.json` 中记录来源和授权状态。

## 许可证与来源

- 代码和 Skill：MIT
- SOUL-6 规范：CC BY 4.0
- 生成内容：由使用者决定授权，但仍受输入素材权利约束
- SOUL-6 来源：[AISoulHub.io](https://aisoulhub.io/about/review-metrics#soul6)

本地 SOUL-6 结果属于自检，不代表 AISoulHub.io 已审核、认证、推荐或发布该内容。

## 开发与验证

```bash
npm test
npm run check
npm run build:skill
```

项目刻意不引入运行时 npm 依赖。
