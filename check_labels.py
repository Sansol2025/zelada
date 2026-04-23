import os
import re

def find_inputs_without_labels(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == "page.tsx" or file.endswith(".tsx"):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Check for inputs or selects
                        inputs = re.findall(r'<(input|select|textarea)', content)
                        if not inputs:
                            continue
                        
                        # Check for labels
                        labels = re.findall(r'<label', content)
                        
                        # Exclude hidden inputs
                        hidden_inputs = re.findall(r'type="hidden"', content)
                        
                        total_visible_inputs = len(inputs) - len(hidden_inputs)
                        
                        if len(labels) < total_visible_inputs:
                             print(f"ISSUE in {path}: {total_visible_inputs} visible inputs found, {len(labels)} labels found.")
                except:
                    pass

if __name__ == "__main__":
    find_inputs_without_labels("app")
