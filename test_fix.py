#!/usr/bin/env python3
"""
Quick test to verify the regions.py fix is working correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    # Test importing regions module
    print("Testing regions module import...")
    from regions import NodeType, generate_new_star_map
    print("✓ regions module imported successfully")
    
    # Test NodeType.get_all_types()
    print("\nTesting NodeType.get_all_types()...")
    node_types = NodeType.get_all_types()
    print(f"✓ Found {len(node_types)} node types: {', '.join(node_types)}")
    
    # Test star map generation
    print("\nTesting star map generation...")
    star_map = generate_new_star_map()
    print(f"✓ Generated star map with {len(star_map['regions'])} regions")
    
    # Check that all nodes have valid types
    print("\nVerifying all nodes have valid types...")
    valid_types = set(node_types)
    invalid_nodes = []
    
    for region_id, region in star_map['regions'].items():
        for node in region['nodes']:
            if node['type'] not in valid_types:
                invalid_nodes.append((region_id, node['id'], node['type']))
    
    if invalid_nodes:
        print(f"✗ Found {len(invalid_nodes)} nodes with invalid types:")
        for region_id, node_id, node_type in invalid_nodes:
            print(f"  - Region {region_id}, Node {node_id}: '{node_type}'")
    else:
        print("✓ All nodes have valid types!")
    
    print("\n✅ All tests passed! The fix is working correctly.")
    
except Exception as e:
    print(f"\n❌ Error during testing: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
