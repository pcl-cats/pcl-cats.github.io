// 站点级设置：名字、导航和对外链接都在这里改。

export const site = {
  name: 'PCL 猫猫',
  description: 'PCL 园区流浪猫的档案和照护日记。',
  // 照护记录的公开文档
  docsUrl: 'https://docs.qq.com/doc/DZU5yckFUcVBhdGRI?u=821fbf89794c4742b66d0f3846aa8891',
  // 用于判断“这个月”的时区
  timeZone: 'Asia/Shanghai',
};

export const nav = [
  { href: '/cats/', label: '猫猫' },
  { href: '/diary/', label: '日记' },
  { href: '/comics/', label: '漫画' },
  { href: '/about/', label: '关于' },
];
