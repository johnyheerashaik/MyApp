#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/generate-icons.sh path/to/base_icon.png
# Base icon should be 1024x1024 PNG (no transparency for best results on Android).

BASE_ICON=${1:-}
if [ -z "$BASE_ICON" ]; then
  echo "Provide path to 1024x1024 base icon PNG" >&2
  exit 1
fi
if [ ! -f "$BASE_ICON" ]; then
  echo "File not found: $BASE_ICON" >&2
  exit 1
fi

IOS_DIR="ios/MyApp/Images.xcassets/AppIcon.appiconset"
ANDROID_RES="android/app/src/main/res"

mkdir -p "$IOS_DIR"

# iOS icon sizes (size@scale -> pixel)
# Format: logical_size scale filename pixel
IOS_SPECS=(
  "20 2 icon-20@2x.png 40"
  "20 3 icon-20@3x.png 60"
  "29 2 icon-29@2x.png 58"
  "29 3 icon-29@3x.png 87"
  "40 2 icon-40@2x.png 80"
  "40 3 icon-40@3x.png 120"
  "60 2 icon-60@2x.png 120"
  "60 3 icon-60@3x.png 180"
  "1024 1 icon-1024.png 1024"
)

echo "Generating iOS icons..."
for spec in "${IOS_SPECS[@]}"; do
  read -r logical scale filename pixels <<<"$spec"
  sips -Z "$pixels" "$BASE_ICON" --out "$IOS_DIR/$filename" >/dev/null
  echo "  $filename ($pixels px)"
done

echo "Updating iOS Contents.json..."
cat > "$IOS_DIR/Contents.json" <<'JSON'
{
  "images" : [
    {"size":"20x20","idiom":"iphone","filename":"icon-20@2x.png","scale":"2x"},
    {"size":"20x20","idiom":"iphone","filename":"icon-20@3x.png","scale":"3x"},
    {"size":"29x29","idiom":"iphone","filename":"icon-29@2x.png","scale":"2x"},
    {"size":"29x29","idiom":"iphone","filename":"icon-29@3x.png","scale":"3x"},
    {"size":"40x40","idiom":"iphone","filename":"icon-40@2x.png","scale":"2x"},
    {"size":"40x40","idiom":"iphone","filename":"icon-40@3x.png","scale":"3x"},
    {"size":"60x60","idiom":"iphone","filename":"icon-60@2x.png","scale":"2x"},
    {"size":"60x60","idiom":"iphone","filename":"icon-60@3x.png","scale":"3x"},
    {"size":"1024x1024","idiom":"ios-marketing","filename":"icon-1024.png","scale":"1x"}
  ],
  "info" : {"version":1,"author":"script"}
}
JSON

echo "Generating Android launcher icons..."
# Android mipmap sizes
# mdpi:48, hdpi:72, xhdpi:96, xxhdpi:144, xxxhdpi:192
ANDROID_SPECS=(
  "mipmap-mdpi 48"
  "mipmap-hdpi 72"
  "mipmap-xhdpi 96"
  "mipmap-xxhdpi 144"
  "mipmap-xxxhdpi 192"
)
for spec in "${ANDROID_SPECS[@]}"; do
  read -r folder size <<<"$spec"
  outDir="$ANDROID_RES/$folder"
  mkdir -p "$outDir"
  sips -Z "$size" "$BASE_ICON" --out "$outDir/ic_launcher.png" >/dev/null
  sips -Z "$size" "$BASE_ICON" --out "$outDir/ic_launcher_round.png" >/dev/null
  echo "  $folder -> ${size}px"
done

echo "Done. Rebuild apps to see new icons."
