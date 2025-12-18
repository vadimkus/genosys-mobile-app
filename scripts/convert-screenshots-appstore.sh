#!/bin/bash

# Convert screenshots to App Store Connect preferred dimensions
# iPhone 14 Pro Max: 1284×2778 (most commonly requested)

set -e

SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)/app-store-screenshots"
OUTPUT_DIR="$SOURCE_DIR/appstore-ready"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   📱 App Store Screenshot Format Converter               ║${NC}"
echo -e "${BLUE}║      Convert 1320×2868 → 1284×2778                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${GREEN}✅ Source:${NC} $SOURCE_DIR"
echo -e "${GREEN}✅ Output:${NC} $OUTPUT_DIR"
echo ""

# Count source files
SOURCE_COUNT=$(ls -1 "$SOURCE_DIR"/*.png 2>/dev/null | grep -v "appstore-ready" | wc -l | tr -d ' ')

if [ "$SOURCE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No screenshots found in source directory${NC}"
    exit 1
fi

echo -e "${BLUE}Found $SOURCE_COUNT screenshot(s) to convert${NC}"
echo ""

# Convert each screenshot
CONVERTED=0
for sourcefile in "$SOURCE_DIR"/*.png; do
    # Skip if in appstore-ready subdirectory
    [[ "$sourcefile" == *"/appstore-ready/"* ]] && continue
    
    filename=$(basename "$sourcefile")
    outputfile="$OUTPUT_DIR/$filename"
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Converting:${NC} $filename"
    
    # Get source dimensions
    source_dims=$(sips -g pixelWidth -g pixelHeight "$sourcefile" 2>/dev/null | \
                  grep -E 'pixelWidth|pixelHeight' | \
                  awk '{print $2}' | \
                  tr '\n' 'x' | \
                  sed 's/x$//')
    
    echo -e "   ${BLUE}Source:${NC} ${source_dims}px"
    
    # Convert to 1284×2778 (iPhone 14 Pro Max standard)
    sips -z 2778 1284 "$sourcefile" --out "$outputfile" >/dev/null 2>&1
    
    if [ -f "$outputfile" ]; then
        # Get output dimensions and size
        output_dims=$(sips -g pixelWidth -g pixelHeight "$outputfile" 2>/dev/null | \
                      grep -E 'pixelWidth|pixelHeight' | \
                      awk '{print $2}' | \
                      tr '\n' 'x' | \
                      sed 's/x$//')
        
        output_size=$(ls -lh "$outputfile" | awk '{print $5}')
        
        echo -e "   ${GREEN}Output:${NC} ${output_dims}px (${output_size})"
        echo -e "   ${GREEN}✅ Converted successfully${NC}"
        ((CONVERTED++))
    else
        echo -e "   ${YELLOW}⚠️  Conversion failed${NC}"
    fi
    echo ""
done

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✨ Conversion Complete!                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Converted:${NC} $CONVERTED/$SOURCE_COUNT screenshots"
echo -e "${BLUE}📁 Location:${NC} $OUTPUT_DIR"
echo ""

if [ "$CONVERTED" -gt 0 ]; then
    echo -e "${BLUE}📸 Converted Files:${NC}"
    ls -1 "$OUTPUT_DIR"/*.png 2>/dev/null | while read -r file; do
        basename=$(basename "$file")
        dims=$(sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null | \
               grep -E 'pixelWidth|pixelHeight' | \
               awk '{print $2}' | \
               tr '\n' 'x' | \
               sed 's/x$//')
        size=$(ls -lh "$file" | awk '{print $5}')
        echo -e "   ${GREEN}✓${NC} $basename"
        echo -e "     ${BLUE}└─${NC} ${dims}px • ${size}"
    done
    echo ""
    
    echo -e "${GREEN}✅ Screenshots are now ready for App Store Connect!${NC}"
    echo ""
    echo -e "${YELLOW}📱 Upload Instructions:${NC}"
    echo "   1. Go to: https://appstoreconnect.apple.com"
    echo "   2. Select your app → App Store tab"
    echo "   3. Scroll to 'App Previews and Screenshots'"
    echo "   4. Select '6.7\" Display' or '6.5\" Display'"
    echo "   5. Upload files from: $OUTPUT_DIR"
    echo ""
    echo -e "${BLUE}💡 Note:${NC} Use 1284×2778px for best compatibility"
    echo ""
fi
