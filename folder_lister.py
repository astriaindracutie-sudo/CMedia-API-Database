import os

# Exclusions list
EXCLUSIONS = {'package.json', 'README.md', 'yarn.lock', '.gitignore', '.env.example', 'node_modules', '.git'}

def build_tree_lines(root_dir, prefix=''):
    """Recursive helper to build ASCII tree lines."""
    lines = []
    contents = sorted([f for f in os.listdir(root_dir) if f not in EXCLUSIONS])
    for i, name in enumerate(contents):
        full_path = os.path.join(root_dir, name)
        connector = '└── ' if i == len(contents) - 1 else '├── '
        lines.append(prefix + connector + name)
        if os.path.isdir(full_path):
            ext_prefix = '    ' if i == len(contents) - 1 else '│   '
            lines.extend(build_tree_lines(full_path, prefix + ext_prefix))
    return lines

def build_inventory(root_dir):
    """Builds a map of the directory structure, excluding specified files/folders."""
    tree_lines = ['Root'] + build_tree_lines(root_dir)
    tree_str = '\n'.join(tree_lines)
    
    rel_to_full = {}  # relative path -> list of full paths (for duplicates)
    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=True):
        dirnames[:] = [d for d in dirnames if d not in EXCLUSIONS]
        rel_dir = os.path.relpath(dirpath, root_dir)
        if rel_dir == '.': rel_dir = 'root'
        if rel_dir not in rel_to_full:
            rel_to_full[rel_dir] = []
        rel_to_full[rel_dir].append(dirpath)
    return tree_str, rel_to_full

def ask_for_inventory_txt(tree_str):
    """Asks user if they want the inventory txt."""
    choice = input("Want a .txt with the folder/file map (no code)? (y/n): ").strip().lower()
    if choice == 'y':
        with open('directory_inventory.txt', 'w') as f:
            f.write("Directory Inventory (ignored: package.json, README.md, yarn.lock, .gitignore, .env.example, node_modules, .git)\n\n")
            f.write(tree_str)
        print("Saved to directory_inventory.txt")

def get_selected_folder(rel_to_full):
    """Asks for folder, handles duplicates."""
    while True:
        rel_folder = input("Which folder to list files/code from? (e.g., frontend/src): ").strip()
        key = rel_folder if rel_folder else 'root'
        if key in rel_to_full:
            full_paths = rel_to_full[key]
            if len(full_paths) > 1:
                print(f"Multiple matches for '{rel_folder}':")
                for i, path in enumerate(full_paths, 1):
                    print(f"{i}: {path}")
                choice = int(input("Pick one (number): ")) - 1
                return full_paths[choice]
            return full_paths[0]
        print("No match – try again.")

def ascii_tree(folder_path):
    """Builds recursive ASCII tree for the folder."""
    return '\n'.join([os.path.basename(folder_path)] + build_tree_lines(folder_path))

def dump_folder_contents(folder_path, root_dir):
    """Dumps files and code recursively to txt with formatting."""
    rel_folder = os.path.relpath(folder_path, root_dir)
    out_file = f"{rel_folder.replace('/', '_')}_contents.txt" if rel_folder != '.' else "root_contents.txt"
    with open(out_file, 'w') as f:
        # H2 header for folder path
        project_name = os.path.basename(root_dir)
        header_path = os.path.join(project_name, rel_folder) if rel_folder != '.' else project_name
        f.write(f"## {header_path}\n\n")
        # Visual rep (ASCII tree)
        f.write("Visual Structure:\n")
        f.write(ascii_tree(folder_path) + "\n\n")
        # Files with H3 and code, recursive
        for dirpath, dirnames, filenames in os.walk(folder_path):
            dirnames[:] = [d for d in dirnames if d not in EXCLUSIONS]
            for fname in sorted(filenames):
                if fname in EXCLUSIONS:
                    continue
                full_file = os.path.join(dirpath, fname)
                rel_file = os.path.relpath(full_file, folder_path)
                f.write(f"### {rel_file}\n\n")
                with open(full_file, 'r') as code_f:
                    try:
                        code = code_f.read()
                        f.write(f"```\n{code}\n```\n\n")
                    except UnicodeDecodeError:
                        f.write("```\n[Binary or non-UTF file - contents skipped]\n```\n\n")
    print(f"Saved to {out_file}")

# Main flow
root_dir = os.getcwd()
print("Inventorying...")
tree_str, rel_to_full = build_inventory(root_dir)
ask_for_inventory_txt(tree_str)
folder_path = get_selected_folder(rel_to_full)
dump_folder_contents(folder_path, root_dir)
print("Done.")