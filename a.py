import os

def remove_comments_from_file(file_path):
    """Remove // comments from a file."""
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()

        # Filter out lines that start with //
        filtered_lines = [line for line in lines if not line.strip().startswith('//')]

        with open(file_path, 'w') as file:
            file.writelines(filtered_lines)

        print(f"Processed: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def process_folder(folder_path):
    """Recursively process files in a folder."""
    for root, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            # Skip non-text files by their extensions if needed (e.g., .txt, .cpp, .js, etc.)
            if True :
                remove_comments_from_file(file_path)

if __name__ == "__main__":
    folder_path = os.getcwd()  # Use current working directory
    print(f"Processing files in: {folder_path}")
    process_folder(folder_path)
