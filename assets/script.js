// 全局变量
let navigationData = [];
let currentCategory = null;
let currentSubcategory = null;

// DOM元素
const categoryList = document.getElementById('category-list');
const subcategoryTabs = document.getElementById('subcategory-tabs');
const sitesContainer = document.getElementById('sites-container');
const breadcrumb = document.getElementById('breadcrumb');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const searchResultsContainer = document.getElementById('search-results-container');

// 初始化函数
async function init() {
    // 设置页面加载状态
    document.title = '加载中... | 网址导航';
    try {
        // 从本地JSON文件加载数据
        const response = await fetch('data/output.json');
        const data = await response.json();
        navigationData = data.categories;
        
        // 渲染一级分类
        renderCategories();
        
        // 判断当前是否在搜索页面
        const isSearchPage = window.location.pathname.includes('search.html');
        
        if (isSearchPage) {
            // 如果是搜索页面，设置返回首页和清空搜索按钮的事件
            setupSearchPageListeners();
            
            // 从URL获取搜索参数并执行搜索
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            
            if (query) {
                // 设置搜索框的值
                searchInput.value = query;
                // 执行搜索
                performSearch();
            }
        } else {
            // 如果不是搜索页面，渲染所有二级分类
            renderAllSubcategories();
            
            // 检查URL中是否有锚点，如果有则滚动到对应位置
            if (window.location.hash) {
                const categoryId = window.location.hash.substring(1);
                const categoryElement = document.getElementById(`category-${categoryId}`);
                if (categoryElement) {
                    categoryElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (navigationData.length > 0) {
                // 如果没有锚点，默认选中第一个分类
                highlightCategory(navigationData[0]);
            }
        }
        
        // 设置搜索事件监听
        setupSearchListeners();
        
        // 设置侧边栏切换按钮事件监听
        setupSidebarToggle();
        
        // 更新页面标题，移除加载状态
        document.title = '网址导航';
    } catch (error) {
        console.error('加载数据失败:', error);
        if (sitesContainer) {
            sitesContainer.innerHTML = `<div class="error-message">加载数据失败，请检查网络连接或刷新页面重试。</div>`;
        }
    }
}

// 渲染一级分类列表
function renderCategories() {
    categoryList.innerHTML = '';
    
    navigationData.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.name;
        li.dataset.id = category.id;
        
        // 修改点击事件，使用锚点跳转到对应的二级菜单位置
        li.addEventListener('click', () => {
            // 高亮显示当前选中的一级分类
            highlightCategory(category);
            
            // 使用锚点跳转到对应的二级菜单位置
            const categoryElement = document.getElementById(`category-${category.id}`);
            if (categoryElement) {
                categoryElement.scrollIntoView({ behavior: 'smooth' });
            }
            
            // 更新URL中的锚点，但不刷新页面
            history.pushState(null, null, `#${category.id}`);
        });
        
        categoryList.appendChild(li);
    });
}

// 高亮显示当前选中的一级分类
function highlightCategory(category) {
    // 更新当前选中的分类
    currentCategory = category;
    
    // 更新UI状态
    const categoryItems = categoryList.querySelectorAll('li');
    categoryItems.forEach(item => {
        if (parseInt(item.dataset.id) === category.id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // 更新面包屑
    updateBreadcrumb();
    
    // 隐藏搜索结果
    searchResults.style.display = 'none';
}

// 渲染所有二级分类
function renderAllSubcategories() {
    // 清空主内容区域
    sitesContainer.innerHTML = '';
    subcategoryTabs.innerHTML = '';
    
    // 遍历所有一级分类
    navigationData.forEach(category => {
        // 创建一级分类标题
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-section';
        categoryTitle.id = `category-${category.id}`;
        
        const titleHeader = document.createElement('h2');
        titleHeader.textContent = category.name;
        categoryTitle.appendChild(titleHeader);
        
        sitesContainer.appendChild(categoryTitle);
        
        // 处理二级分类
        let processedSubcategories = [...(category.subcategories || [])];
        
        if (category.sites && category.sites.length > 0) {
            // 如果一级目录下有网址，创建一个名为"未归档"的二级分类
            const unfiledSubcategory = {
                id: `${category.id}-unfiled`,
                name: "未归档",
                sites: category.sites
            };
            
            // 将未归档分类添加到二级分类列表的开头
            processedSubcategories.unshift(unfiledSubcategory);
        }
        
        // 为当前分类创建二级分类标签区域
        const subcategoryTabsContainer = document.createElement('div');
        subcategoryTabsContainer.className = 'subcategory-tabs-container';
        subcategoryTabsContainer.id = `subcategory-tabs-${category.id}`;
        categoryTitle.appendChild(subcategoryTabsContainer);
        
        // 为当前分类创建网站容器
        const categoryContentContainer = document.createElement('div');
        categoryContentContainer.className = 'category-content';
        categoryContentContainer.id = `category-content-${category.id}`;
        sitesContainer.appendChild(categoryContentContainer);
        
        // 渲染当前分类的二级分类
        renderSubcategoriesForCategory(processedSubcategories, subcategoryTabsContainer, categoryContentContainer);
    });
    
    // 隐藏搜索结果
    searchResults.style.display = 'none';
}

// 为特定分类渲染二级分类
function renderSubcategoriesForCategory(subcategories, tabsContainer, contentContainer) {
    if (!subcategories || subcategories.length === 0) {
        contentContainer.innerHTML = '<div class="empty-message">该分类下暂无内容</div>';
        return;
    }
    
    // 渲染二级分类标签
    subcategories.forEach((subcategory, index) => {
        const tab = document.createElement('div');
        tab.className = 'subcategory-tab';
        if (index === 0) tab.classList.add('active');
        tab.textContent = subcategory.name;
        tab.dataset.id = subcategory.id;
        tab.addEventListener('click', () => {
            // 移除所有标签的活动状态
            tabsContainer.querySelectorAll('.subcategory-tab').forEach(t => t.classList.remove('active'));
            // 添加当前标签的活动状态
            tab.classList.add('active');
            // 渲染该二级分类下的网站
            renderSitesForCategory(subcategory.sites, contentContainer);
        });
        tabsContainer.appendChild(tab);
    });
    
    // 默认显示第一个二级分类的内容
    if (subcategories.length > 0) {
        renderSitesForCategory(subcategories[0].sites, contentContainer);
    }
}

// 为特定分类渲染网站
function renderSitesForCategory(sites, container) {
    container.innerHTML = '';
    
    if (!sites || sites.length === 0) {
        container.innerHTML = '<div class="empty-message">该分类下暂无网站</div>';
        return;
    }
    
    const sitesGrid = document.createElement('div');
    sitesGrid.className = 'sites-grid';
    container.appendChild(sitesGrid);
    
    sites.forEach(site => {
        const card = createSiteCard(site);
        sitesGrid.appendChild(card);
    });
}

// 渲染二级分类标签
function renderSubcategories(subcategories) {
    subcategoryTabs.innerHTML = '';
    
    subcategories.forEach(subcategory => {
        const tab = document.createElement('div');
        tab.className = 'subcategory-tab';
        tab.textContent = subcategory.name;
        tab.dataset.id = subcategory.id;
        tab.addEventListener('click', () => selectSubcategory(subcategory));
        subcategoryTabs.appendChild(tab);
    });
}

// 选择二级分类
function selectSubcategory(subcategory) {
    // 更新当前选中的二级分类
    currentSubcategory = subcategory;
    
    // 更新UI状态
    const subcategoryItems = subcategoryTabs.querySelectorAll('.subcategory-tab');
    subcategoryItems.forEach(item => {
        if (parseInt(item.dataset.id) === subcategory.id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // 更新面包屑
    updateBreadcrumb();
    
    // 渲染网站列表
    renderSites(subcategory.sites);
}

// 渲染网站卡片
function renderSites(sites) {
    sitesContainer.innerHTML = '';
    
    if (!sites || sites.length === 0) {
        sitesContainer.innerHTML = '<div class="empty-message">该分类下暂无网站</div>';
        return;
    }
    
    sites.forEach(site => {
        const card = createSiteCard(site);
        sitesContainer.appendChild(card);
    });
}

// 创建网站卡片
function createSiteCard(site) {
    const card = document.createElement('div');
    card.className = 'site-card';
    card.addEventListener('click', () => window.open(site.url, '_blank'));
    
    // 创建图标
    const img = document.createElement('img');
    img.src = site.icon;
    img.alt = site.title;
    img.onerror = function() {
        // 图标加载失败时使用默认图标
        this.src = 'https://www.google.com/s2/favicons?domain=' + new URL(site.url).hostname;
    };
    
    // 创建标题
    const title = document.createElement('h3');
    title.textContent = site.title;
    
    // 添加到卡片
    card.appendChild(img);
    card.appendChild(title);
    
    return card;
}

// 更新面包屑导航
function updateBreadcrumb() {
    breadcrumb.innerHTML = '<span>首页</span>';
    
    if (currentCategory) {
        const categorySpan = document.createElement('span');
        categorySpan.textContent = currentCategory.name;
        breadcrumb.appendChild(categorySpan);
    }
    
    if (currentSubcategory) {
        const subcategorySpan = document.createElement('span');
        subcategorySpan.textContent = currentSubcategory.name;
        breadcrumb.appendChild(subcategorySpan);
    }
}

// 设置搜索功能
function setupSearchListeners() {
    // 点击搜索按钮
    searchBtn.addEventListener('click', performSearch);
    
    // 按回车键搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 实时搜索（输入时触发搜索）
    searchInput.addEventListener('input', () => {
        // 如果输入框为空，隐藏搜索结果
        if (searchInput.value.trim() === '') {
            searchResults.style.display = 'none';
            // 判断当前是否在搜索页面
            const isSearchPage = window.location.pathname.includes('search.html');
            if (isSearchPage) {
                // 如果在搜索页面，重定向到首页
                window.location.href = 'index.html';
                return;
            }
            return;
        }
        performSearch();
    });
    
    // 点击其他区域时，如果搜索框为空，隐藏搜索结果
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && 
            e.target !== searchInput && 
            e.target !== searchBtn && 
            !searchBtn.contains(e.target) && 
            searchInput.value.trim() === '') {
            searchResults.style.display = 'none';
        }
    });
}

// 执行搜索
function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query === '') {
        // 如果搜索框为空，隐藏搜索结果
        searchResults.style.display = 'none';
        return;
    }
    
    // 判断当前是否在搜索页面
    const isSearchPage = window.location.pathname.includes('search.html');
    
    if (!isSearchPage) {
        // 如果不在搜索页面，跳转到搜索页面并传递搜索参数
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        return;
    }
    
    // 搜索结果
    const results = [];
    
    // 遍历所有分类和网站
    navigationData.forEach(category => {
        // 搜索一级目录下的直接网址
        if (category.sites && category.sites.length > 0) {
            category.sites.forEach(site => {
                if (site.title.toLowerCase().includes(query) || 
                    (site.url && site.url.toLowerCase().includes(query)) ||
                    (site.description && site.description.toLowerCase().includes(query))) {
                    // 添加分类和子分类信息到搜索结果
                    results.push({
                        ...site,
                        categoryName: category.name,
                        subcategoryName: "未归档"
                    });
                }
            });
        }
        
        // 搜索二级目录下的网址
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                if (subcategory.sites && subcategory.sites.length > 0) {
                    subcategory.sites.forEach(site => {
                        if (site.title.toLowerCase().includes(query) || 
                            (site.url && site.url.toLowerCase().includes(query)) ||
                            (site.description && site.description.toLowerCase().includes(query))) {
                            // 添加分类和子分类信息到搜索结果
                            results.push({
                                ...site,
                                categoryName: category.name,
                                subcategoryName: subcategory.name
                            });
                        }
                    });
                }
            });
        }
    });
    
    // 显示搜索结果
    displaySearchResults(results, query);
}

// 显示搜索结果
function displaySearchResults(results, query) {
    searchResultsContainer.innerHTML = '';
    searchResults.style.display = 'block';
    
    // 更新搜索结果标题
    const searchResultsTitle = document.getElementById('search-results-title') || searchResults.querySelector('h2');
    searchResultsTitle.textContent = `搜索结果: ${query} (${results.length})`;
    
    if (results.length === 0) {
        searchResultsContainer.innerHTML = `<div class="empty-message">未找到与 "${query}" 相关的网站</div>`;
        return;
    }
    
    // 判断当前是否在搜索页面
    const isSearchPage = window.location.pathname.includes('search.html');
    
    // 在非搜索页面时，添加清空搜索按钮
    if (!isSearchPage) {
        const clearSearchBtn = document.createElement('button');
        clearSearchBtn.className = 'clear-search-btn';
        clearSearchBtn.innerHTML = '<i class="fas fa-times"></i> 清空搜索';
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchResults.style.display = 'none';
            // 如果当前有选中的分类，则显示该分类的内容
            if (currentCategory) {
                if (currentSubcategory) {
                    selectSubcategory(currentSubcategory);
                } else if (currentCategory.subcategories && currentCategory.subcategories.length > 0) {
                    selectSubcategory(currentCategory.subcategories[0]);
                }
            }
        });
        searchResultsContainer.appendChild(clearSearchBtn);
    }
    
    // 创建搜索结果网格容器
    // 确保searchResultsContainer已经有sites-container类
    searchResultsContainer.classList.add('sites-container');
    
    // 创建网格布局容器，与主页的网站展示保持一致
    const sitesGrid = document.createElement('div');
    sitesGrid.className = 'sites-grid';
    searchResultsContainer.appendChild(sitesGrid);
    
    // 按分类对结果进行排序
    results.sort((a, b) => {
        if (a.categoryName === b.categoryName) {
            return a.subcategoryName.localeCompare(b.subcategoryName);
        }
        return a.categoryName.localeCompare(b.categoryName);
    });
    
    // 显示搜索结果
    results.forEach(site => {
        // 创建卡片容器
        const card = document.createElement('div');
        card.className = 'site-card';
        
        // 创建图标
        const img = document.createElement('img');
        img.src = site.icon;
        img.alt = site.title;
        img.onerror = function() {
            // 图标加载失败时使用默认图标
            this.src = 'https://www.google.com/s2/favicons?domain=' + new URL(site.url).hostname;
        };
        
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = site.title;
        
        // 添加分类信息
        const categoryInfo = document.createElement('div');
        categoryInfo.className = 'category-info';
        categoryInfo.textContent = `${site.categoryName} > ${site.subcategoryName}`;
        
        // 添加到卡片
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(categoryInfo);
        
        // 添加点击事件，点击卡片时跳转到对应网站
        card.addEventListener('click', () => {
            window.open(site.url, '_blank');
        });
        
        // 将卡片添加到网格容器中，而不是直接添加到searchResultsContainer
        sitesGrid.appendChild(card);
    });
}

// 设置搜索页面的事件监听
function setupSearchPageListeners() {
    // 返回首页按钮
    const backToHomeBtn = document.getElementById('back-to-home');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // 清空搜索按钮
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            // 重定向到首页
            window.location.href = 'index.html';
        });
    }
}

// 设置侧边栏切换按钮事件监听
function setupSidebarToggle() {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
        // 检查本地存储中是否有保存的侧边栏状态
        const sidebarState = localStorage.getItem('sidebarState');
        if (sidebarState === 'collapsed') {
            sidebar.classList.add('collapsed');
        }
        
        toggleBtn.addEventListener('click', () => {
            // 切换侧边栏的收缩状态
            sidebar.classList.toggle('collapsed');
            
            // 保存当前状态到本地存储
            if (sidebar.classList.contains('collapsed')) {
                localStorage.setItem('sidebarState', 'collapsed');
            } else {
                localStorage.setItem('sidebarState', 'expanded');
            }
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
