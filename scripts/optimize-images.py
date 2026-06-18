import os, json, sys
from PIL import Image

IMG_DIR = r"E:\scan-mini-app\public\images"
PRODUCTS_FILE = r"E:\scan-mini-app\src\data\products.json"
MAX_SIZE = 800  # max width/height for mobile

def optimize_image(filepath):
    """Convert to WebP, resize to max 800px. Returns new filename."""
    name, ext = os.path.splitext(filepath)
    webp_path = name + ".webp"

    # Skip if already optimized
    if ext.lower() == ".webp":
        return os.path.basename(filepath)

    try:
        img = Image.open(filepath)
        # Convert RGBA to RGB for WebP (WebP supports alpha but let's keep it simple)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")

        # Resize if too large
        w, h = img.size
        if max(w, h) > MAX_SIZE:
            ratio = MAX_SIZE / max(w, h)
            new_size = (int(w * ratio), int(h * ratio))
            # Use LANCZOS for high quality downscaling
            img = img.resize(new_size, Image.LANCZOS)

        # Save as WebP with quality 80 (good balance)
        img.save(webp_path, "WEBP", quality=80)

        # Remove original
        os.remove(filepath)

        return os.path.basename(webp_path)
    except Exception as e:
        print(f"  ERROR {os.path.basename(filepath)}: {e}")
        return os.path.basename(filepath)

def main():
    print("Optimizing images...")

    files = [f for f in os.listdir(IMG_DIR) if os.path.isfile(os.path.join(IMG_DIR, f))]
    total = len(files)
    optimized = 0

    # Build old->new filename mapping
    mapping = {}

    for i, f in enumerate(files):
        filepath = os.path.join(IMG_DIR, f)
        old_name = f
        new_name = optimize_image(filepath)
        mapping[old_name] = new_name

        if old_name != new_name:
            optimized += 1

        if (i + 1) % 50 == 0:
            print(f"  {i+1}/{total} done...")

    print(f"\nOptimized {optimized}/{total} images")

    # Update products.json
    print("Updating products.json...")
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    updated = 0
    for p in products:
        old_image = p["image"]
        # Extract just the filename from the path
        old_filename = os.path.basename(old_image)
        if old_filename in mapping:
            new_filename = mapping[old_filename]
            p["image"] = "/images/" + new_filename
            updated += 1

    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"Updated {updated} product image references")

    # Calculate size savings
    total_size = 0
    for f in os.listdir(IMG_DIR):
        fp = os.path.join(IMG_DIR, f)
        if os.path.isfile(fp):
            total_size += os.path.getsize(fp)
    print(f"Total images size: {total_size / 1024 / 1024:.1f} MB")

if __name__ == "__main__":
    main()
