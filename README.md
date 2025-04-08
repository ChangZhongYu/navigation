# 个人网址导航系统

![版本](https://img.shields.io/badge/版本-1.0.0-blue.svg)
![许可证](https://img.shields.io/badge/许可证-MIT-green.svg)

一个美观、实用的个人网址导航系统，帮助您高效管理和访问常用网站。支持多级分类、搜索功能和响应式设计，让您的网络冲浪更加高效。

## ✨ 功能特点

- **多级分类导航**：支持一级、二级分类结构，清晰组织您的网站收藏
- **强大搜索功能**：快速查找已收录的网站，提高访问效率
- **响应式设计**：完美适配桌面端、平板和移动设备
- **毛玻璃特效**：现代化UI设计，侧边栏采用毛玻璃效果
- **自定义图标**：支持网站图标显示，提升视觉识别度
- **书签导入**：从浏览器导出的书签HTML文件中提取数据

## 🔧 技术实现

- **前端**：原生HTML、CSS和JavaScript实现，无需框架依赖
- **样式**：使用CSS变量和Flexbox布局，实现响应式设计
- **数据存储**：JSON格式存储网站数据，便于扩展和修改
- **数据处理**：Python脚本处理书签数据，生成标准化JSON

## 📁 项目结构

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

## 🚀 安装与使用

### 从浏览器书签导入

1. 从浏览器导出书签为HTML文件，命名为`bookmarks_content.html`特别注意的是，要从F12中复制出的源码才是完整的网页，才包含head和body标签，才能被extract_bookmarks.py正确提取数据。
2. 使用标签修复脚本处理HTML文件：
   ```bash
   python scripts/fix_html_tags.py
   ```
3. 使用书签提取脚本生成JSON数据（输出的数据需要把标签栏一级删除，将其子标签subcategories提级为categories，数据显示才正常）：
   ```bash
   python scripts/extract_bookmarks.py
   ```
4. 启动本地服务器查看导航页面：
   ```bash
   python -m http.server 8000
   ```
5. 在浏览器中访问 [http://localhost:8000](http://localhost:8000)

### 手动添加网站

您也可以直接编辑`data/output.json`文件，按照以下格式添加网站：

```json
{
  "categories": [
    {
      "id": 1,
      "name": "分类名称",
      "subcategories": [
        {
          "id": "11",
          "name": "子分类名称",
          "sites": [
            {
              "id": 111,
              "title": "网站名称",
              "url": "https://example.com",
              "icon": "图标数据或URL"
            }
          ]
        }
      ]
    }
  ]
}
```

## 📱 界面预览

- **桌面端**：宽屏显示，左侧固定导航栏，右侧网站卡片网格布局
- **平板端**：可折叠导航栏，适中网格布局
- **移动端**：折叠导航栏，单列网站卡片布局

## 🔄 自定义与扩展

### 修改主题颜色

编辑`assets/styles.css`文件中的CSS变量：

```css
:root {
    --primary-color: #3a6186;
    --secondary-color: #89253e;
    /* 其他颜色变量 */
}
```

### 添加新功能

项目使用模块化设计，您可以轻松扩展新功能：

1. 在`assets/script.js`中添加新的功能模块
2. 在`assets/styles.css`中添加相应的样式
3. 在`index.html`中添加必要的HTML结构

## 🤝 贡献指南

欢迎贡献代码或提出建议！请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

## 📄 许可证

本项目采用MIT许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有任何问题或建议，请通过以下方式联系我：

- 电子邮件：zhongyu.smile@gmail.com
- GitHub Issues：[提交问题](https://github.com/ChangZhongYu/navigation/issues)

---

**享受高效的网络导航体验！**