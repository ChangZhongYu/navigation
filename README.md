# 网址导航项目

## 项目结构

```
/
├── assets/         # 静态资源文件
│   ├── styles.css  # CSS样式文件
│   └── script.js   # JavaScript脚本文件
├── data/           # 数据文件
│   └── output.json # 导航数据JSON文件
├── scripts/        # 数据处理脚本
│   ├── extract_bookmarks.py # 书签提取脚本
│   └── fix_html_tags.py     # HTML标签修复脚本
├── index.html      # 主页面
└── README.md       # 项目说明文件
```

## 使用方法

1. 使用`scripts/fix_html_tags.py`修复HTML标签
2. 使用`scripts/extract_bookmarks.py`从修复后的HTML文件中提取书签数据到`data/output.json`
3. 打开`index.html`查看导航页面

## 功能说明

- 支持一级和二级分类导航
- 支持搜索功能
- 响应式设计，适配不同设备