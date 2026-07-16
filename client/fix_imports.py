import os, glob, re

for folder in ['src/components', 'src/pages']:
    for filepath in glob.glob(folder + '/*.jsx'):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace './api' with '../api'
        content = re.sub(r"from '(\./api)'", r"from '../api'", content)
        content = re.sub(r'from "(\./api)"', r'from "../api"', content)
        content = re.sub(r"from '(\./api\.js)'", r"from '../api.js'", content)
        content = re.sub(r'from "(\./api\.js)"', r'from "../api.js"', content)
        
        # Replace './index.css' with '../index.css'
        content = content.replace("'./index.css'", "'../index.css'")
        content = content.replace('"./index.css"', '"../index.css"')
        
        with open(filepath, 'w') as f:
            f.write(content)

print("Imports fixed.")
