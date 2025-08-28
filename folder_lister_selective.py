import os
import fnmatch

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

def ascii_tree(folder_path, selected_subdirs=None, include_root_files=False):
    """Builds ASCII tree, optionally filtering subdirs or root files."""
    lines = [os.path.basename(folder_path)]
    if include_root_files or selected_subdirs:
        contents = sorted([f for f in os.listdir(folder_path) if f not in EXCLUSIONS])
        for i, name in enumerate(contents):
            full_path = os.path.join(folder_path, name)
            if os.path.isdir(full_path) and (selected_subdirs is None or name in selected_subdirs):
                connector = '└── ' if i == len(contents) - 1 else '├── '
                lines.append(connector + name)
                ext_prefix = '    ' if i == len(contents) - 1 else '│   '
                lines.extend([ext_prefix + line for line in build_tree_lines(full_path, '')])
            elif os.path.isfile(full_path) and include_root_files:
                connector = '└── ' if i == len(contents) - 1 else '├── '
                lines.append(connector + name)
    return '\n'.join(lines)

def get_files_to_dump(folder_path, mode, subdirs=None, file_patterns=None):
    """Gets list of (rel_path, full_path) for files based on mode."""
    files_to_dump = []
    if mode == 1:  # All files in root + specific subdirs
        for fname in sorted(os.listdir(folder_path)):
            full_file = os.path.join(folder_path, fname)
            if os.path.isfile(full_file) and fname not in EXCLUSIONS:
                files_to_dump.append((fname, full_file))
        for dirpath, dirnames, filenames in os.walk(folder_path):
            dirnames[:] = [d for d in dirnames if d not in EXCLUSIONS]
            if subdirs and os.path.basename(dirpath) not in subdirs:
                continue
            for fname in sorted(filenames):
                if fname in EXCLUSIONS:
                    continue
                full_file = os.path.join(dirpath, fname)
                rel_file = os.path.relpath(full_file, folder_path)
                files_to_dump.append((rel_file, full_file))
    elif mode == 2:  # Only subdirs' files
        for dirpath, dirnames, filenames in os.walk(folder_path):
            dirnames[:] = [d for d in dirnames if d not in EXCLUSIONS]
            if dirpath == folder_path:  # Skip root
                continue
            if subdirs and os.path.basename(dirpath) not in subdirs:
                continue
            for fname in sorted(filenames):
                if fname in EXCLUSIONS:
                    continue
                full_file = os.path.join(dirpath, fname)
                rel_file = os.path.relpath(full_file, folder_path)
                files_to_dump.append((rel_file, full_file))
    elif mode == 3:  # Specific files in specific folders
        for folder in subdirs or ['.']:
            folder_path_full = folder_path if folder == '.' else os.path.join(folder_path, folder)
            if not os.path.isdir(folder_path_full):
                continue
            for fname in sorted(os.listdir(folder_path_full)):
                if fname in EXCLUSIONS:
                    continue
                if file_patterns and not any(fnmatch.fnmatch(fname, pat) for pat in file_patterns):
                    continue
                full_file = os.path.join(folder_path_full, fname)
                if os.path.isfile(full_file):
                    rel_file = fname if folder == '.' else os.path.join(folder, fname)
                    files_to_dump.append((rel_file, full_file))
    return files_to_dump

def dump_folder_contents(folder_path, root_dir):
    """Dumps files and code to txt based on user-selected mode."""
    rel_folder = os.path.relpath(folder_path, root_dir)
    out_file = f"{rel_folder.replace('/', '_')}_contents.txt" if rel_folder != '.' else "root_contents.txt"
    
    print("\nChoose mode:")
    print("1: All files in folder + specific subfolders")
    print("2: Only subfolders' files (skip folder's direct files)")
    print("3: Specific files in specific folders")
    mode = int(input("Enter mode (1-3): "))
    
    subdirs = None
    file_patterns = None
    include_root_files = (mode == 1)
    
    if mode in (1, 2):
        subdirs_input = input("Enter subfolder names (comma-separated, or empty for all): ").strip()
        subdirs = [s.strip() for s in subdirs_input.split(',')] if subdirs_input else None
    elif mode == 3:
        subdirs_input = input("Enter folder names (comma-separated, use '.' for root folder): ").strip()
        subdirs = [s.strip() for s in subdirs_input.split(',')] if subdirs_input else ['.']
        patterns_input = input("Enter file names/patterns (comma-separated, e.g., index.js,*.py): ").strip()
        file_patterns = [p.strip() for p in patterns_input.split(',')] if patterns_input else []
    
    with open(out_file, 'w') as f:
        # H2 header for folder path
        project_name = os.path.basename(root_dir)
        header_path = os.path.join(project_name, rel_folder) if rel_folder != '.' else project_name
        f.write(f"## {header_path}\n\n")
        # Visual rep (ASCII tree)
        f.write("Visual Structure:\n")
        f.write(ascii_tree(folder_path, subdirs, include_root_files) + "\n\n")
        # Files with H3 and code
        for rel_file, full_file in get_files_to_dump(folder_path, mode, subdirs, file_patterns):
            f.write(f"### {rel_file}\n\n")
            try:
                with open(full_file, 'r') as code_f:
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