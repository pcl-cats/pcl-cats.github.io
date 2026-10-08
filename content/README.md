# 内容维护说明

网站内容以文本文件为主，图片放在 `public/images/`。原始 Word 文档保留在项目根目录，作为核对来源，已写入 `.gitignore`，不要上传到公开仓库；后续日常更新直接修改这里的 Markdown 文件。

| 内容 | 位置 | 维护方式 |
| --- | --- | --- |
| 猫咪档案 | `content/cats/` | 每只猫一个文件；`id` 和文件名保持稳定 |
| 日记 | `content/diary/` | 每天一个 `YYYY-MM-DD.md` 文件，同一天多件事写在一起 |
| 大事记 | 日记的 `milestone: true` | 在对应日记里标记，不另写一份正文 |
| 漫画 | `content/comics/` | 每期一个文件，图片按阅读顺序列出 |
| 关于和相处提示 | `content/about.md`、`content/guide.md` | 公开文字不写维护者真实姓名 |

猫咪档案的常用字段是 `name`、`photo`、`status`、`appearance`、`birthMonth`、`sex`、`sterilized` 和 `relations`。不知道的信息直接省略，不要猜测。`relations` 的 `cat` 填对方档案的 `id`。档案状态依据原文整理，并非实时状态。

日记至少填写 `date` 和 `title`；涉及已建档猫咪时，可在 `cats` 中填写档案 `id`。需要在时间轴展示时，加 `milestone: true`。有适合做卡片封面的照片时填写 `cover`。正文使用普通 Markdown，可以继续插入图片。

首次整理从 Word 提取了 38 份猫咪档案、101 篇按日期合并的日记和 8 期漫画。图片仅导出了 38 张档案照、11 张漫画图和 15 张日记照片。原文中的账单、检查单、伤口特写和可辨认的人像没有批量加入网站资源。照片已缩放为 WebP，减少移动端加载量。

来源中花花的亲子关系、金条的性别按后续确认修正：花花的三个儿子是雪饼、奥利奥、仙贝；金条是小公猫。猫咪编号没有作为数据 ID 使用。AI 生成的关系图只供参考，未转成网站关系数据。

检查内容文件和图片路径：`python3 scripts/check_content.py`。
