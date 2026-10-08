"""Check the hand-edited content files without extra dependencies."""

from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
cats_dir = root / "content/cats"
diary_dir = root / "content/diary"
comics_dir = root / "content/comics"


def read(path):
    raw = path.read_text(encoding="utf-8")
    assert raw.startswith("---\n") and "\n---\n" in raw[4:], path
    return raw.split("---", 2)[1], raw


def field(header, name):
    match = re.search(rf"^{name}:\s*(.+)$", header, re.M)
    return match.group(1).strip("'\" ") if match else None


def list_field(header, name):
    match = re.search(rf"^{name}:\n((?:- .+\n)+)", header, re.M)
    return re.findall(r"^- (.+)$", match.group(1), re.M) if match else []


cats = sorted(cats_dir.glob("*.md"))
diary = sorted(diary_dir.glob("*.md"))
comics = sorted(comics_dir.glob("*.md"))
ids = set()
for path in cats:
    header, _ = read(path)
    cat_id = field(header, "id")
    assert cat_id == path.stem and cat_id not in ids, path
    assert field(header, "name") and field(header, "photo"), path
    ids.add(cat_id)

milestones = 0
for path in cats + diary + comics + [root / "content/about.md", root / "content/guide.md"]:
    header, raw = read(path)
    for image in re.findall(r"/images/[\w./-]+", raw):
        assert (root / "public" / image.lstrip("/")).is_file(), (path, image)
    if path in cats:
        for related in re.findall(r"^- cat: (\S+)$", header, re.M):
            assert related in ids, (path, related)
    if path in diary:
        assert field(header, "date") == path.stem and field(header, "title"), path
        assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", path.stem), path
        for cat_id in list_field(header, "cats"):
            assert cat_id in ids, (path, cat_id)
        milestones += field(header, "milestone") == "true"

assert cats and diary and comics
huahua, _ = read(cats_dir / "huahua.md")
jintiao, _ = read(cats_dir / "jintiao.md")
assert set(re.findall(r"^- cat: (\S+)$", huahua, re.M)) == {"aoliao", "xuebing", "xianbei"}
assert field(jintiao, "sex") == "公猫"
print(f"内容检查通过：{len(cats)} 只猫、{len(diary)} 篇日记、{milestones} 条大事记、{len(comics)} 期漫画。")
