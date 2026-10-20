# 林间小筑 · 个人博客

一个**零依赖、零构建**的静态个人博客：纯 HTML + CSS + JavaScript，双击 `index.html` 就能看，上传到任何静态托管就能上线。

- 深浅色主题（记忆选择、跟随系统）
- 响应式布局（手机单列 / 桌面双栏 + 文章目录）
- 首页标签筛选 + 即时搜索
- 文章页阅读进度、自动目录、阅读时长、代码复制
- RSS、sitemap、robots、自定义 404
- 无外部字体、无 CDN、无第三方脚本，国内加载也很快

---

## 一、目录结构

```
blog/
├── index.html                  # 首页（Hero + 精选 + 文章列表）
├── about.html                  # 关于页
├── 404.html                    # 自定义 404
├── rss.xml                     # RSS 订阅源
├── sitemap.xml                 # 站点地图
├── robots.txt                  # 爬虫规则
├── assets/
│   ├── css/style.css           # 全站样式（含深浅色变量）
│   ├── js/main.js              # 全站脚本
│   └── favicon.svg             # 站点图标
└── posts/                      # 文章目录
    ├── hello-blog.html
    ├── modern-css-layout.html
    ├── reading-walden.html
    └── deploy-static-blog.html
```

---

## 二、本地预览

直接双击 `index.html` 也能看，但**建议起一个本地服务器**（更接近线上环境，相对路径、404 都能验证）：

```bash
# 任选一种，在 blog 目录下执行
python -m http.server 8080          # 然后打开 http://localhost:8080
npx serve .                         # 需要 Node.js
php -S localhost:8080               # 需要 PHP
```

> Windows 上如果 `python` 不在 PATH，可以试 `py -m http.server 8080`。

---

## 三、把它改成你自己的

### 1. 站点信息（5 分钟）

| 要改的地方 | 位置 |
| --- | --- |
| 站点名「林间小筑」 | 所有 HTML 的 `<title>`、`.brand` 文字、页脚 |
| 作者名「林知远」 | `<meta name="author">`、关于页、页脚版权 |
| 简介文案 | 首页 `.hero-lead`、`<meta name="description">` |
| 邮箱 / GitHub | `about.html` 的「联系我」与侧栏社交图标 |
| 头像 | `index.html` 里的内联 `<svg>`（或换成 `<img>`） |
| 域名 | `rss.xml`、`sitemap.xml`、`robots.txt` 里的 `https://example.com` |

配色集中在 `assets/css/style.css` 顶部的 `:root` 与 `html[data-theme="dark"]` 两组变量里，改 `--accent` 就能换掉整站主色。

### 2. 新增一篇文章（约 5 分钟）

1. 复制 `posts/hello-blog.html`，改名为 `posts/你的文章名.html`（用英文、短横线，例如 `my-first-post.html`）。
2. 改这几处：`<title>`、`<meta name="description">`、面包屑、`<h1>`、`.post-meta` 里的日期/分类、`<article>` 正文、文末标签、上下篇链接。
3. 在 `index.html` 里复制一张 `<li class="card" ...>` 卡片，改封面配色类（`cover-warm` / `cover-forest` / `cover-dusk` / `cover-sand`）、日期、标题、摘要、`data-tags`（空格分隔，用于筛选）和 `data-search`（用于搜索）。
4. 顺手补一下：`rss.xml` 加一个 `<item>`、`sitemap.xml` 加一个 `<url>`。
5. 如果新标签不在筛选栏里，在 `index.html` 的 `.filters` 里加一颗 `<button class="chip" data-filter="新标签">`。

> 正文里需要代码块时，这样写（`main.js` 会自动加上语言标签和复制按钮）：
> ```html
> <div class="code-block">
>   <div class="code-head"><span>js</span></div>
>   <pre><code class="language-js">console.log('hi')</code></pre>
> </div>
> ```
> HTML 特殊字符记得转义：`<` → `&lt;`，`>` → `&gt;`，`&` → `&amp;`。

### 3. 修改后的自检

- 首页卡片能点进文章，文章页「返回首页」能回来
- 浏览器窗口拉到手机宽度：菜单可展开、卡片变单列
- 切深色模式后刷新，仍是深色
- 打开 `/sitemap.xml`、`/rss.xml` 没有报错

---

## 四、部署到公网（四种免费方案）

本站是纯静态文件，**没有构建步骤**，所以任何静态托管都能直接用。
核心原则：把 `blog/` 目录里的内容原样上传，保持目录结构不变。

### 方案 A：GitHub Pages（推荐，免费稳定）

适合用 Git 管理代码的人。免费、自带 HTTPS、可绑域名。

**第 1 步：创建仓库**

在 GitHub 新建仓库，名字二选一：

- `你的用户名.github.io` → 访问地址是 `https://你的用户名.github.io/`（用户站，根路径）
- 其它名字（如 `blog`）→ 访问地址是 `https://你的用户名.github.io/blog/`（项目站，子路径）

**第 2 步：推送代码**

```bash
cd blog
git init
git add .
git commit -m "init: my blog"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

**第 3 步：开启 Pages**

仓库 → **Settings → Pages** → Source 选 `Deploy from a branch` → 分支 `main`、目录 `/ (root)` → **Save**。
等 1～2 分钟，页面顶部会显示访问地址。

> ✅ 本站所有链接都是相对路径，所以**项目站的子路径也能直接工作**，不需要改代码，也不需要配 `base`。
> ❌ 如果你把链接改成 `/assets/...` 这种以斜杠开头的绝对路径，项目站就会样式全丢——这是最常见的翻车点。

**更新文章**：改完文件 `git add . && git commit -m "post: xxx" && git push`，Pages 会在 1 分钟内自动重建。

### 方案 B：Netlify（最快，拖拽上线）

**最快路径**：打开 <https://app.netlify.com/drop>，把整个 `blog` 文件夹拖进去，几秒后得到 `https://随机名.netlify.app`。

- 改名：**Site configuration → Change site name**
- 绑域名：**Domain management → Add a domain**，按提示加 CNAME
- 长期维护：**Add new site → Import an existing project**，连 GitHub 仓库，之后每次 push 自动发布

Build command 留空，Publish directory 填 `/`（或 `.`）。

### 方案 C：Vercel（命令行一条命令）

```bash
npm i -g vercel
cd blog
vercel                # 首次会引导登录、创建项目
vercel --prod         # 发布到正式域名
```

没有构建步骤，所以 **Build Command 留空、Output Directory 填 `.`**。
默认域名形如 `https://项目名.vercel.app`，可在 Project → Settings → Domains 绑自定义域名。

### 方案 D：Cloudflare Pages（国内访问通常更稳）

1. 登录 <https://dash.cloudflare.com> → **Workers & Pages → Create → Pages → Connect to Git**
2. 选仓库；框架预设 **None**，构建命令留空，输出目录 `/`
3. **Save and Deploy**，得到 `https://项目名.pages.dev`

不想连 Git 也可以直接上传：

```bash
npm i -g wrangler
wrangler pages deploy . --project-name=my-blog
```

### 方案 E（可选）：自己的服务器 / 对象存储

有 VPS 的话，Nginx 静态托管十分钟搞定：

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/blog;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }
    error_page 404 /404.html;

    # 静态资源长缓存，HTML 不缓存，改完立即生效
    location ~* \.(css|js|svg|png|jpg|webp|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    location ~* \.html$ {
        add_header Cache-Control "no-cache";
    }
}
```

上传：`scp -r blog/* user@服务器:/var/www/blog/`，然后 `sudo nginx -t && sudo systemctl reload nginx`。
HTTPS 用 `sudo certbot --nginx -d example.com` 一条命令签发。

对象存储（阿里云 OSS / 腾讯云 COS / 七牛）也能托管静态站：开启「静态网站托管」，把默认首页设为 `index.html`、错误页设为 `404.html`，上传整个目录即可。国内访问快，但要备案。

### 绑定自定义域名

四个平台的流程几乎一致：

1. 平台后台添加域名 → 它给你一条 DNS 记录（一般是 `CNAME` 指向平台地址）
2. 去域名商 DNS 面板加上这条记录
3. 等待生效（几分钟到几小时），平台自动签发 HTTPS 证书
4. 建议同时把 `www` 和裸域都加上，并在平台里设置 301 跳转到主域名

---

## 五、常见问题

**Q：打开页面只有文字，没有样式？**
样式没加载。检查 `assets/css/style.css` 是否上传、路径大小写是否一致（Linux 服务器区分大小写），以及是否误用了以 `/` 开头的绝对路径。

**Q：部署到 `用户名.github.io/blog/` 后图片/样式 404？**
同上：本项目用相对路径，正常不会出问题；一旦你手改成绝对路径就会 404。文章页在 `posts/` 下，引用资源要用 `../assets/...`。

**Q：访问不存在的地址没有 404 页？**
GitHub Pages 只对用户站/项目站根目录的 `404.html` 生效；Netlify、Cloudflare Pages 默认支持。其它平台需要在后台配置错误页。

**Q：改完推送了，页面还是旧的？**
浏览器缓存。强制刷新（Ctrl+F5），或等 CDN 缓存过期（通常几分钟）。可在平台后台手动触发一次重新部署。

**Q：RSS 阅读器里没内容？**
确认 `rss.xml` 里的 `<link>` 和每篇的 `<link>` 都是完整网址（带 `https://`），而不是相对路径。RSS 必须是绝对 URL。

**Q：国内访问慢 / 打不开？**
GitHub Pages 在国内不稳定，可换 Cloudflare Pages，或用自己的服务器 + 国内 CDN（需备案）。纯静态站也可以直接放对象存储。

**Q：以后文章多了，手写 HTML 太累？**
到二十篇左右再考虑迁到静态站点生成器（Astro / Hugo / Eleventy），把文章改成 Markdown。
现在这个阶段，手写的可控性和加载速度反而更好。

---

## 六、可选：GitHub Actions 自动发布（当前用不上）

如果以后改用仓库的 `main` 分支直接发布，可以不用 Pages 的默认构建。这份工作流适合放在「源文件在 `main`、产物发布到 `gh-pages`」的场景：

```yaml
# .github/workflows/deploy.yml
name: Deploy blog
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Publish to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

然后在 **Settings → Pages** 里把 Source 改成 `gh-pages` 分支。

---

## 七、许可

站点代码可自由使用、修改、商用；示例文章文字仅作演示，发布前请替换为你自己的内容。
