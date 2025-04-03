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
    try {
        // 从本地JSON文件加载数据
        const response = await fetch('data/output copy.json');
        const data = await response.json();
        navigationData = data.categories;
        
        // 渲染一级分类
        renderCategories();
        
        // 默认选中第一个分类
        if (navigationData.length > 0) {
            selectCategory(navigationData[0]);
        }
        
        // 设置搜索事件监听
        setupSearchListeners();
    } catch (error) {
        console.error('加载数据失败:', error);
        sitesContainer.innerHTML = `<div class="error-message">加载数据失败，请检查网络连接或刷新页面重试。</div>`;
    }
}

// 渲染一级分类列表
function renderCategories() {
    categoryList.innerHTML = '';
    
    navigationData.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.name;
        li.dataset.id = category.id;
        li.addEventListener('click', () => selectCategory(category));
        categoryList.appendChild(li);
    });
}

// 选择一级分类
function selectCategory(category) {
    // 更新当前选中的分类
    currentCategory = category;
    currentSubcategory = null;
    
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
    
    // 检查一级目录是否直接包含网址
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
    
    // 渲染二级分类
    renderSubcategories(processedSubcategories);
    
    // 默认选中第一个二级分类
    if (processedSubcategories.length > 0) {
        selectSubcategory(processedSubcategories[0]);
    } else {
        // 如果没有二级分类，清空网站列表
        sitesContainer.innerHTML = '<div class="empty-message">该分类下暂无内容</div>';
    }
    
    // 隐藏搜索结果
    searchResults.style.display = 'none';
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
    const searchResultsTitle = searchResults.querySelector('h2');
    searchResultsTitle.textContent = `搜索结果: ${query} (${results.length})`;
    
    if (results.length === 0) {
        searchResultsContainer.innerHTML = `<div class="empty-message">未找到与 "${query}" 相关的网站</div>`;
        return;
    }
    
    // 添加清空搜索按钮
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
    
    // 创建搜索结果网格容器
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'sites-container';
    searchResultsContainer.appendChild(resultsGrid);
    
    // 按分类对结果进行排序
    results.sort((a, b) => {
        if (a.categoryName === b.categoryName) {
            return a.subcategoryName.localeCompare(b.subcategoryName);
        }
        return a.categoryName.localeCompare(b.categoryName);
    });
    
    // 显示搜索结果
    results.forEach(site => {
        const card = createSiteCard(site);
        
        // 添加分类信息
        const categoryInfo = document.createElement('div');
        categoryInfo.className = 'category-info';
        categoryInfo.textContent = `${site.categoryName} > ${site.subcategoryName}`;
        card.appendChild(categoryInfo);
        
        // 添加点击事件，点击卡片时跳转到对应网站
        card.addEventListener('click', () => {
            window.open(site.url, '_blank');
        });
        
        resultsGrid.appendChild(card);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);