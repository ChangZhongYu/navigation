import re

def fix_html_tags(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 修复 </p> 标签错位
    # 查找模式：<p>后面跟着任何内容，然后是换行，然后是缩进和</p>
    pattern_p = r'(<p>.*?)(\n\s*)(</p>)'
    content = re.sub(pattern_p, r'\1\3\2', content)
    
    # 修复行首的 </dt> 标签错位
    # 查找模式：<dt>后面跟着任何内容，然后是换行，然后是缩进和</dt>作为行首
    pattern_dt = r'(<dt>.*?)(\n\s*)(</dt>)'
    content = re.sub(pattern_dt, r'\1\3\2', content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"处理完成！结果已保存到 {output_file}")

if __name__ == "__main__":
    input_file = "c:/project/navigation/bookmarks_content.html"
    output_file = "c:/project/navigation/fixed_bookmarks.html"
    fix_html_tags(input_file, output_file)