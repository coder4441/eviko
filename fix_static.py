#!/usr/bin/env python3
import os
import subprocess

layout_file = 'src/app/layout.tsx'
dynamic_export = "\nexport const dynamic = 'force-dynamic';\nexport const fetchCache = 'force-no-store';\n"

print(f"✅ {layout_file} ga dynamic rendering qoidalari qo'shilmoqda...")

try:
    with open(layout_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "export const dynamic = 'force-dynamic';" not in content:
        with open(layout_file, 'w', encoding='utf-8') as f:
            f.write(content + dynamic_export)
        print("✅ Qoidalar qo'shildi!")
    else:
        print("✅ Qoidalar allaqachon mavjud.")
except Exception as e:
    print(f"❌ Xatolik: {e}")

print("🗑️  .next cache o'chirilmoqda...")
subprocess.run(['rm', '-rf', '.next'], check=False)

print("🔨 npm run build boshlandi...")
env = os.environ.copy()
env["NEXT_PRIVATE_MINIMAL_MODE"] = "1"
env["NODE_OPTIONS"] = "--max-old-space-size=1024" # Xotira limiti

result = subprocess.run(['npm', 'run', 'build'], env=env, capture_output=False)
if result.returncode == 0:
    print("\n🎉 BUILD MUVAFFAQIYATLI TUGADI!")
else:
    print(f"\n❌ Build xato bilan tugadi (kod: {result.returncode})")
