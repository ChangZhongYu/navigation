import os
import json
from bs4 import BeautifulSoup
import re

# 定义输入和输出文件路径
input_file = 'fixed_bookmarks.html'
output_file = 'data/output.json'

# 生成唯一ID的函数
def generate_id(prefix, parent_id=None):
    if parent_id is None:
        return f"{prefix}{generate_id.counter}"
    else:
        return f"{parent_id}{generate_id.counter}"
    
# 初始化计数器
generate_id.counter = 1

# 解析书签函数
def parse_bookmarks(folder_element, parent_id=None):
    # 重置计数器
    generate_id.counter = 1
    
    # 解析目录结构
    def parse_folder(element, parent_id=None, level=0):
        result = []
        
        # 查找所有直接子元素
        for dt in element.find_all('dt', recursive=False):
            # 检查是否是目录
            h3 = dt.find('h3', recursive=False)
            if h3:
                # 这是一个目录
                folder_name = h3.get_text()
                folder_id = len(result) + 1 if parent_id is None else f"{parent_id}{len(result) + 1}"
                
                # 查找此目录下的dl元素
                dl = dt.find('dl', recursive=False)
                if dl:
                    # 递归解析子目录，增加层级计数
                    subcategories = parse_folder(dl, folder_id, level + 1)
                    
                    # 创建目录对象
                    folder_obj = {
                        "id": int(folder_id) if parent_id is None else folder_id,
                        "name": folder_name,
                        "subcategories": subcategories,
                        "level": level  # 添加层级信息
                    }
                    result.append(folder_obj)
            else:
                # 检查是否是书签链接
                a = dt.find('a', recursive=False)
                if a and parent_id is not None:
                    # 这是一个书签
                    bookmark = {
                        "id": f"{parent_id}{len(result) + 1}",
                        "title": a.get_text(),
                        "url": a.get('href'),
                        "icon": a.get('icon', '')
                    }
                    result.append(bookmark)
        
        return result
    
    # 开始解析
    categories = parse_folder(folder_element)
    
    # 重新组织数据结构
    final_result = []
    for category in categories:
        # 检查是否有子目录
        if "subcategories" in category:
            # 处理子目录中的书签
            subcategories = []
            sites_by_subcategory = {}
            
            for item in category["subcategories"]:
                if "url" in item:
                    # 这是一个书签，需要放到sites列表中
                    parent_cat_id = str(category["id"])
                    if parent_cat_id not in sites_by_subcategory:
                        sites_by_subcategory[parent_cat_id] = []
                    
                    # 确保ID是整数
                    try:
                        item_id = int(item["id"])
                    except ValueError:
                        item_id = item["id"]
                    
                    sites_by_subcategory[parent_cat_id].append({
                        "id": item_id,
                        "title": item["title"],
                        "url": item["url"],
                        "icon": item["icon"]
                    })
                else:
                    # 这是一个子目录
                    subcat_id = item["id"]
                    sites = []
                    sub_subcategories = []
                    
                    # 收集此子目录下的所有书签和三级目录
                    if "subcategories" in item:
                        for subitem in item["subcategories"]:
                            if "url" in subitem:
                                # 这是一个书签
                                try:
                                    subitem_id = int(subitem["id"])
                                except ValueError:
                                    subitem_id = subitem["id"]
                                
                                sites.append({
                                    "id": subitem_id,
                                    "title": subitem["title"],
                                    "url": subitem["url"],
                                    "icon": subitem["icon"]
                                })
                            elif "level" in subitem and subitem["level"] == 2:
                                # 这是一个三级目录
                                third_level_id = subitem["id"]
                                third_level_sites = []
                                
                                # 收集三级目录下的所有书签
                                if "subcategories" in subitem:
                                    for third_item in subitem["subcategories"]:
                                        if "url" in third_item:
                                            try:
                                                third_item_id = int(third_item["id"])
                                            except ValueError:
                                                third_item_id = third_item["id"]
                                            
                                            third_level_sites.append({
                                                "id": third_item_id,
                                                "title": third_item["title"],
                                                "url": third_item["url"],
                                                "icon": third_item["icon"]
                                            })
                                        # 如果有四级目录，也将其作为书签处理
                                        elif "subcategories" in third_item:
                                            for fourth_item in third_item["subcategories"]:
                                                if "url" in fourth_item:
                                                    try:
                                                        fourth_item_id = int(fourth_item["id"])
                                                    except ValueError:
                                                        fourth_item_id = fourth_item["id"]
                                                    
                                                    third_level_sites.append({
                                                        "id": fourth_item_id,
                                                        "title": fourth_item["title"],
                                                        "url": fourth_item["url"],
                                                        "icon": fourth_item["icon"]
                                                    })
                                
                                # 创建三级目录对象
                                sub_subcategories.append({
                                    "id": third_level_id,
                                    "name": subitem["name"],
                                    "sites": third_level_sites
                                })
                    
                    # 创建子目录对象
                    subcategory_obj = {
                        "id": subcat_id,
                        "name": item["name"],
                        "sites": sites
                    }
                    
                    # 如果有三级目录，添加到子目录对象中
                    if sub_subcategories:
                        subcategory_obj["subcategories"] = sub_subcategories
                    
                    subcategories.append(subcategory_obj)
            
            # 创建主目录对象
            final_result.append({
                "id": category["id"],
                "name": category["name"],
                "subcategories": subcategories
            })
    
    return {"categories": final_result}

# 主函数
def main():
    try:
        # 读取HTML文件
        with open(input_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # 使用BeautifulSoup解析HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 找到书签的根元素
        root_dl = soup.find('dl')
        
        if not root_dl:
            print("Error: Could not find the root bookmark element.")
            return
        
        # 解析书签
        bookmarks_data = parse_bookmarks(root_dl)
        
        # 写入JSON文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(bookmarks_data, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully extracted bookmarks to {output_file}")
    
    except Exception as e:
        print(f"Error: {e}")

# 执行主函数
if __name__ == "__main__":
    main()