# AISoul Forge

AISoul Forge 是一个纯本地运行的 AI 灵魂锻造 Skill，用于创建、修复、融合、
演进、试镜和验证 AI 灵魂包。它生成六类运行时源文件，并按照 SOUL-6 开放标准
进行质量自检。

运行期间不会访问网络、上传内容、采集遥测、要求账号登录或自动检查更新。
仓库中的 AISoulHub.io 链接仅用于标准来源和版本引用。

## 能力

- 从用户确认的灵魂蓝图生成六类运行时文件
- 修复现有 AI 灵魂包中的低分维度
- 合并多个 AI 灵魂时识别身份、关系、能力、风格和记忆冲突
- 在不破坏固定设定的情况下生成新版本
- 运行 SOUL-6 确定性检查和合成试镜
- 生成机器可读报告、用户可读报告和本地 ZIP 包

## 六类运行时文件

- `IDENTITY.md`：身份、角色、核心关系和不可打破设定
- `USER.md`：用户位置、称呼、关系距离和隐私边界
- `SOUL.md`：人格、价值观、语言系统、隐藏特质和示例台词
- `AGENTS.md`：场景响应、任务、冲突、高风险和回退协议
- `TOOLS.md`：真实能力、工具权限、高风险确认和安全替代
- `MEMORY.md`：可记忆内容、敏感信息、纠正、遗忘和长期演进

六类文件是职责分离，SOUL-6 是跨文件质量评价，两者不是一一对应关系。

## 使用

将 `skill/forge-ai-soul` 复制或链接到 Agent 宿主的 Skill 目录。运行时仅需要
Node.js 20 或更高版本。

```bash
node skill/forge-ai-soul/scripts/forge.mjs help
node skill/forge-ai-soul/scripts/forge.mjs init ./output/my-soul \
  --name "我的灵魂" --slug my-soul --language zh-CN
node skill/forge-ai-soul/scripts/forge.mjs validate ./output/my-soul --write
```

`init` 只创建明确标注的脚手架。AI Agent 必须根据用户确认的蓝图替换全部模板
标记后，才能声明完成锻造。

## 完整示例

[`examples/lumen`](examples/lumen) 是一个完全合成的原创 AI 灵魂包，包含六类
运行时文件、100/100 的 SOUL-6 标准报告、六组多轮试镜和完整来源说明。测试会
直接把该示例作为正向夹具，防止示例与评分器静默漂移。

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
