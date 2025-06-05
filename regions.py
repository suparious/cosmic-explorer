# Region and Node system for Cosmic Explorer
# Defines the structure of space regions and their nodes

import random
import json
from typing import Dict, List, Tuple, Optional
import math

class NodeType:
    PLANET = "planet"
    STATION = "station"
    ANOMALY = "anomaly"
    WORMHOLE = "wormhole"
    ASTEROID_FIELD = "asteroid_field"
    DERELICT = "derelict"

class RegionType:
    CORE_WORLDS = "core_worlds"
    FRONTIER = "frontier"
    NEBULA_FIELDS = "nebula_fields"
    VOID_SPACE = "void_space"
    ANCIENT_SECTORS = "ancient_sectors"

class Region:
    """Represents a region of space with unique characteristics"""
    
    # Region definitions with visual and audio themes
    REGION_CONFIGS = {
        RegionType.CORE_WORLDS: {
            "name": "Core Worlds",
            "description": "The heart of civilization, bustling with trade and politics",
            "background": {
                "primary_color": "#4169E1",  # Royal Blue
                "secondary_color": "#87CEEB",  # Sky Blue
                "star_density": 1.5,
                "nebula_opacity": 0.3,
                "particle_effects": ["trade_ships", "station_lights"],
                "ambient_brightness": 0.8
            },
            "music_theme": "station",  # Maps to existing music system
            "node_types": [NodeType.PLANET, NodeType.STATION, NodeType.PLANET],
            "danger_level": 0.1,
            "wealth_modifier": 1.5,
            "repair_availability": 0.9
        },
        RegionType.FRONTIER: {
            "name": "Frontier Space",
            "description": "Lawless territories on the edge of known space",
            "background": {
                "primary_color": "#FF6347",  # Tomato Red
                "secondary_color": "#FF8C00",  # Dark Orange
                "star_density": 0.7,
                "nebula_opacity": 0.5,
                "particle_effects": ["asteroids", "debris"],
                "ambient_brightness": 0.5
            },
            "music_theme": "danger",
            "node_types": [NodeType.PLANET, NodeType.ASTEROID_FIELD, NodeType.DERELICT],
            "danger_level": 0.6,
            "wealth_modifier": 1.2,
            "repair_availability": 0.4
        },
        RegionType.NEBULA_FIELDS: {
            "name": "Nebula Fields",
            "description": "Mysterious clouds of cosmic dust hide ancient secrets",
            "background": {
                "primary_color": "#9370DB",  # Medium Purple
                "secondary_color": "#FF1493",  # Deep Pink
                "star_density": 1.0,
                "nebula_opacity": 0.8,
                "particle_effects": ["nebula_wisps", "energy_storms"],
                "ambient_brightness": 0.6
            },
            "music_theme": "exploration",
            "node_types": [NodeType.ANOMALY, NodeType.PLANET, NodeType.ANOMALY],
            "danger_level": 0.4,
            "wealth_modifier": 1.0,
            "repair_availability": 0.5
        },
        RegionType.VOID_SPACE: {
            "name": "The Void",
            "description": "Empty expanses between the stars, where few dare to venture",
            "background": {
                "primary_color": "#191970",  # Midnight Blue
                "secondary_color": "#000033",  # Very Dark Blue
                "star_density": 0.2,
                "nebula_opacity": 0.1,
                "particle_effects": ["void_whispers"],
                "ambient_brightness": 0.2
            },
            "music_theme": "danger",
            "node_types": [NodeType.DERELICT, NodeType.ANOMALY],
            "danger_level": 0.8,
            "wealth_modifier": 0.8,
            "repair_availability": 0.1
        },
        RegionType.ANCIENT_SECTORS: {
            "name": "Ancient Sectors",
            "description": "Regions containing remnants of long-lost civilizations",
            "background": {
                "primary_color": "#32CD32",  # Lime Green
                "secondary_color": "#FFD700",  # Gold
                "star_density": 0.8,
                "nebula_opacity": 0.6,
                "particle_effects": ["ancient_artifacts", "energy_fields"],
                "ambient_brightness": 0.7
            },
            "music_theme": "exploration",
            "node_types": [NodeType.ANOMALY, NodeType.DERELICT, NodeType.WORMHOLE],
            "danger_level": 0.5,
            "wealth_modifier": 1.8,
            "repair_availability": 0.2
        }
    }
    
    def __init__(self, region_id: str, region_type: str, position: Tuple[float, float]):
        self.id = region_id
        self.type = region_type
        self.config = self.REGION_CONFIGS[region_type]
        self.name = f"{self.config['name']} Sector {region_id[-3:]}"
        self.position = position  # x, y coordinates on the star map
        self.nodes = []
        self.connections = []  # Connections to other regions
        
    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "name": self.name,
            "position": self.position,
            "nodes": [node.to_dict() for node in self.nodes],
            "connections": self.connections,
            "config": self.config
        }

class Node:
    """Represents a location within a region"""
    
    NODE_CONFIGS = {
        NodeType.PLANET: {
            "prefixes": ["New", "Old", "Lost", "Prime", "Beta", "Alpha"],
            "names": ["Terra", "Haven", "Forge", "Eden", "Kronos", "Athena", "Sparta"],
            "suffixes": ["", " III", " IV", " Prime", " Minor"],
            "has_repair": 0.7,
            "has_trade": 0.8,
            "danger_events": 0.2
        },
        NodeType.STATION: {
            "prefixes": ["Deep Space", "Orbital", "Trading", "Mining", "Research"],
            "names": ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Outpost"],
            "suffixes": ["-1", "-7", "-9", " Hub", " Platform"],
            "has_repair": 1.0,
            "has_trade": 1.0,
            "danger_events": 0.1
        },
        NodeType.ANOMALY: {
            "prefixes": ["Quantum", "Temporal", "Spatial", "Dimensional", "Unknown"],
            "names": ["Anomaly", "Distortion", "Rift", "Vortex", "Phenomenon"],
            "suffixes": [" X", " Z", " Omega", " Alpha", ""],
            "has_repair": 0.0,
            "has_trade": 0.0,
            "danger_events": 0.8
        },
        NodeType.WORMHOLE: {
            "prefixes": ["Unstable", "Stable", "Ancient", "Collapsed", "Active"],
            "names": ["Wormhole", "Gateway", "Portal", "Conduit", "Passage"],
            "suffixes": [" A", " B", " C", "", " Sigma"],
            "has_repair": 0.0,
            "has_trade": 0.0,
            "danger_events": 0.5
        },
        NodeType.ASTEROID_FIELD: {
            "prefixes": ["Dense", "Scattered", "Rich", "Depleted", "Dangerous"],
            "names": ["Belt", "Field", "Cluster", "Zone", "Expanse"],
            "suffixes": [" Alpha", " Beta", " Gamma", "", " Mining Zone"],
            "has_repair": 0.2,
            "has_trade": 0.4,
            "danger_events": 0.6
        },
        NodeType.DERELICT: {
            "prefixes": ["Abandoned", "Ancient", "Destroyed", "Mysterious", "Alien"],
            "names": ["Hulk", "Wreck", "Ship", "Station", "Artifact"],
            "suffixes": ["", " Site", " Field", " Graveyard"],
            "has_repair": 0.1,
            "has_trade": 0.2,
            "danger_events": 0.7
        }
    }
    
    def __init__(self, node_id: str, node_type: str, region_id: str, position: Tuple[float, float]):
        self.id = node_id
        self.type = node_type
        self.region_id = region_id
        self.position = position  # Relative position within the region
        self.config = self.NODE_CONFIGS[node_type]
        self.name = self._generate_name()
        self.connections = []  # Connected nodes within the region
        self.discovered = False
        self.visited = False
        
        # Node properties
        self.has_repair = random.random() < self.config["has_repair"]
        self.has_trade = random.random() < self.config["has_trade"]
        self.danger_level = self.config["danger_events"]
        
        # Special properties
        self.special_items = []
        self.quests = []
        
    def _generate_name(self):
        """Generate a procedural name for the node"""
        prefix = random.choice(self.config["prefixes"])
        name = random.choice(self.config["names"])
        suffix = random.choice(self.config["suffixes"])
        return f"{prefix} {name}{suffix}".strip()
    
    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "region_id": self.region_id,
            "name": self.name,
            "position": self.position,
            "connections": self.connections,
            "discovered": self.discovered,
            "visited": self.visited,
            "has_repair": self.has_repair,
            "has_trade": self.has_trade,
            "danger_level": self.danger_level,
            "special_items": self.special_items,
            "quests": self.quests
        }

class StarMapGenerator:
    """Generates procedural star maps"""
    
    def __init__(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)
        
    def generate_star_map(self, num_regions: int = 5) -> Dict:
        """Generate a complete star map with regions and nodes"""
        regions = {}
        
        # Generate regions in a roughly circular pattern
        region_types = list(Region.REGION_CONFIGS.keys())
        
        # Always include one of each type if possible
        selected_types = region_types.copy()
        while len(selected_types) < num_regions:
            selected_types.append(random.choice(region_types))
        
        random.shuffle(selected_types)
        
        # Position regions
        for i, region_type in enumerate(selected_types[:num_regions]):
            angle = (i / num_regions) * 2 * math.pi
            distance = 300 + random.randint(-50, 50)
            x = math.cos(angle) * distance
            y = math.sin(angle) * distance
            
            region_id = f"REG_{i:03d}"
            region = Region(region_id, region_type, (x, y))
            
            # Generate nodes for this region
            num_nodes = random.randint(3, 8)
            nodes = self._generate_nodes_for_region(region, num_nodes)
            region.nodes = nodes
            
            # Create node connections within region
            self._connect_nodes(nodes)
            
            regions[region_id] = region
        
        # Connect regions
        self._connect_regions(list(regions.values()))
        
        # Ensure starting region is accessible
        start_region = list(regions.values())[0]
        start_region.nodes[0].discovered = True
        start_region.nodes[0].visited = True
        
        return {
            "regions": {rid: r.to_dict() for rid, r in regions.items()},
            "current_region": start_region.id,
            "current_node": start_region.nodes[0].id,
            "discovered_regions": [start_region.id],
            "map_seed": random.randint(0, 999999)
        }
    
    def _generate_nodes_for_region(self, region: Region, num_nodes: int) -> List[Node]:
        """Generate nodes within a region"""
        nodes = []
        node_types = region.config["node_types"].copy()
        
        # Add additional random node types
        while len(node_types) < num_nodes:
            node_types.append(random.choice(list(NodeType.__dict__.values())))
        
        # Position nodes in a scattered pattern within the region
        for i in range(num_nodes):
            angle = (i / num_nodes) * 2 * math.pi + random.uniform(-0.5, 0.5)
            distance = 50 + random.randint(0, 100)
            x = math.cos(angle) * distance
            y = math.sin(angle) * distance
            
            node_id = f"NODE_{region.id}_{i:03d}"
            node_type = node_types[i] if i < len(node_types) else random.choice(list(NodeType.__dict__.values()))
            
            node = Node(node_id, node_type, region.id, (x, y))
            nodes.append(node)
        
        return nodes
    
    def _connect_nodes(self, nodes: List[Node]):
        """Create connections between nodes in a region"""
        if len(nodes) < 2:
            return
        
        # Create a minimum spanning tree to ensure all nodes are connected
        connected = [nodes[0]]
        unconnected = nodes[1:]
        
        while unconnected:
            min_dist = float('inf')
            min_pair = None
            
            for connected_node in connected:
                for unconnected_node in unconnected:
                    dist = self._distance(connected_node.position, unconnected_node.position)
                    if dist < min_dist:
                        min_dist = dist
                        min_pair = (connected_node, unconnected_node)
            
            if min_pair:
                node1, node2 = min_pair
                node1.connections.append(node2.id)
                node2.connections.append(node1.id)
                connected.append(node2)
                unconnected.remove(node2)
        
        # Add some additional connections for variety
        for _ in range(random.randint(1, len(nodes) // 2)):
            node1 = random.choice(nodes)
            node2 = random.choice(nodes)
            if node1 != node2 and node2.id not in node1.connections:
                node1.connections.append(node2.id)
                node2.connections.append(node1.id)
    
    def _connect_regions(self, regions: List[Region]):
        """Create connections between regions"""
        # Connect each region to 1-3 other regions
        for region in regions:
            num_connections = random.randint(1, 3)
            potential_targets = [r for r in regions if r != region]
            
            for _ in range(min(num_connections, len(potential_targets))):
                if not potential_targets:
                    break
                    
                # Find closest unconnected region
                target = min(potential_targets, key=lambda r: self._distance(region.position, r.position))
                
                if target.id not in region.connections:
                    region.connections.append(target.id)
                    target.connections.append(region.id)
                
                potential_targets.remove(target)
    
    def _distance(self, pos1: Tuple[float, float], pos2: Tuple[float, float]) -> float:
        """Calculate distance between two positions"""
        return math.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)

# Export for use in game
def generate_new_star_map(seed: Optional[int] = None) -> Dict:
    """Generate a new star map for a new game"""
    generator = StarMapGenerator(seed)
    return generator.generate_star_map()

def get_region_visual_config(region_type: str) -> Dict:
    """Get visual configuration for a region type"""
    return Region.REGION_CONFIGS.get(region_type, Region.REGION_CONFIGS[RegionType.CORE_WORLDS])
