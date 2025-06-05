#!/usr/bin/env python3
"""
Generate a simple favicon.ico for Cosmic Explorer
Creates a 16x16 and 32x32 icon with a spaceship design
"""

import struct
import os

def create_favicon():
    # Create a simple 16x16 pixel spaceship icon
    # Using a basic design: black background with cyan spaceship
    
    # 16x16 bitmap (simplified spaceship shape)
    icon_16 = []
    
    # Create the pixel data (BGRA format, 4 bytes per pixel)
    # Black background
    black = b'\x0f\x0a\x0a\xff'  # BGRA: dark background
    # Cyan color for spaceship
    cyan = b'\xff\xff\x00\xff'   # BGRA: cyan
    # Purple for window
    purple = b'\xff\x00\xff\xff' # BGRA: magenta/purple
    # Yellow for thrust
    yellow = b'\x00\xff\xff\xff' # BGRA: yellow
    
    # 16x16 pixel design (upside down because BMP format)
    design_16 = [
        "................",
        "................",
        ".......YY.......",
        "......YYYY......",
        ".....CCCCCC.....",
        ".....CCPPCC.....",
        ".....CCPPCC.....",
        ".....CCCCCC.....",
        "....CCCCCCCC....",
        "....CCCCCCCC....",
        "...CCCCCCCCCC...",
        "...CCCCCCCCCC...",
        "..CCCC....CCCC..",
        "..CCC......CCC..",
        "................",
        "................"
    ]
    
    # Reverse the design (BMP is bottom-up)
    design_16.reverse()
    
    # Convert design to bytes
    pixels_16 = b''
    for row in design_16:
        for char in row:
            if char == '.':
                pixels_16 += black
            elif char == 'C':
                pixels_16 += cyan
            elif char == 'P':
                pixels_16 += purple
            elif char == 'Y':
                pixels_16 += yellow
    
    # Create ICO file structure
    ico_data = b''
    
    # ICO Header
    ico_data += struct.pack('<HHH', 0, 1, 1)  # Reserved, Type (1=ICO), Count
    
    # Image directory entry
    ico_data += struct.pack('B', 16)  # Width
    ico_data += struct.pack('B', 16)  # Height
    ico_data += struct.pack('B', 0)   # Color count (0 = true color)
    ico_data += struct.pack('B', 0)   # Reserved
    ico_data += struct.pack('<H', 1)  # Color planes
    ico_data += struct.pack('<H', 32) # Bits per pixel
    
    # Calculate BMP size
    bmp_header_size = 40  # BITMAPINFOHEADER size
    pixel_data_size = 16 * 16 * 4  # width * height * bytes_per_pixel
    bmp_size = bmp_header_size + pixel_data_size
    
    ico_data += struct.pack('<I', bmp_size)  # Size of image data
    ico_data += struct.pack('<I', 22)  # Offset to image data (ICO header + directory)
    
    # BMP Header (BITMAPINFOHEADER)
    ico_data += struct.pack('<I', 40)  # Header size
    ico_data += struct.pack('<i', 16)  # Width
    ico_data += struct.pack('<i', 32)  # Height (double for AND mask)
    ico_data += struct.pack('<H', 1)   # Planes
    ico_data += struct.pack('<H', 32)  # Bits per pixel
    ico_data += struct.pack('<I', 0)   # Compression (0 = none)
    ico_data += struct.pack('<I', pixel_data_size)  # Image size
    ico_data += struct.pack('<i', 0)   # X pixels per meter
    ico_data += struct.pack('<i', 0)   # Y pixels per meter
    ico_data += struct.pack('<I', 0)   # Colors used
    ico_data += struct.pack('<I', 0)   # Important colors
    
    # Add pixel data
    ico_data += pixels_16
    
    # Add AND mask (all transparent)
    and_mask = b'\x00' * (16 * 4)  # 16 rows, 4 bytes per row
    ico_data += and_mask
    
    return ico_data

def main():
    # Generate favicon data
    favicon_data = create_favicon()
    
    # Get the path to the static directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(script_dir, 'static')
    favicon_path = os.path.join(static_dir, 'favicon.ico')
    
    # Create static directory if it doesn't exist
    os.makedirs(static_dir, exist_ok=True)
    
    # Write favicon.ico
    with open(favicon_path, 'wb') as f:
        f.write(favicon_data)
    
    print(f"Favicon created at: {favicon_path}")
    print("The favicon features a cyan spaceship with purple cockpit and yellow thrust!")

if __name__ == '__main__':
    main()
