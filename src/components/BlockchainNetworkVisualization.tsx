import React, { useState, useEffect, useRef } from 'react';
import { Globe, ZoomIn, ZoomOut, Maximize, Minimize, RefreshCw, Filter, Download } from 'lucide-react';
import Button from './Button';

interface Node {
  id: string;
  type: string;
  connections: string[];
  status: 'active' | 'warning' | 'error';
  size: number;
  x?: number;
  y?: number;
}

interface Link {
  source: string;
  target: string;
  strength: number;
  status: 'active' | 'warning' | 'error';
}

interface BlockchainNetworkVisualizationProps {
  title?: string;
  nodes?: Node[];
  links?: Link[];
  loading?: boolean;
  onRefresh?: () => void;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

const mockNodes: Node[] = [
  { id: 'node1', type: 'Core', connections: ['node2', 'node3', 'node4', 'node5'], status: 'active', size: 20 },
  { id: 'node2', type: 'Edge', connections: ['node1', 'node6', 'node7'], status: 'active', size: 15 },
  { id: 'node3', type: 'Edge', connections: ['node1', 'node8', 'node9'], status: 'active', size: 15 },
  { id: 'node4', type: 'Civic', connections: ['node1', 'node10'], status: 'active', size: 12 },
  { id: 'node5', type: 'Privacy', connections: ['node1', 'node11'], status: 'warning', size: 12 },
  { id: 'node6', type: 'Edge', connections: ['node2', 'node12', 'node13'], status: 'active', size: 10 },
  { id: 'node7', type: 'Quantum', connections: ['node2', 'node14'], status: 'active', size: 10 },
  { id: 'node8', type: 'Edge', connections: ['node3', 'node15'], status: 'active', size: 10 },
  { id: 'node9', type: 'Civic', connections: ['node3', 'node16'], status: 'error', size: 10 },
  { id: 'node10', type: 'Privacy', connections: ['node4'], status: 'active', size: 8 },
  { id: 'node11', type: 'Quantum', connections: ['node5'], status: 'active', size: 8 },
  { id: 'node12', type: 'Edge', connections: ['node6'], status: 'active', size: 8 },
  { id: 'node13', type: 'Civic', connections: ['node6'], status: 'active', size: 8 },
  { id: 'node14', type: 'Privacy', connections: ['node7'], status: 'warning', size: 8 },
  { id: 'node15', type: 'Quantum', connections: ['node8'], status: 'active', size: 8 },
  { id: 'node16', type: 'Edge', connections: ['node9'], status: 'active', size: 8 },
];

const generateLinks = (nodes: Node[]): Link[] => {
  const links: Link[] = [];
  
  nodes.forEach(node => {
    node.connections.forEach(targetId => {
      if (node.id < targetId) {
        const targetNode = nodes.find(n => n.id === targetId);
        links.push({
          source: node.id,
          target: targetId,
          strength: Math.random() * 0.5 + 0.5, // Random strength between 0.5 and 1
          status: targetNode?.status || 'active'
        });
      }
    });
  });
  
  return links;
};

const mockLinks = generateLinks(mockNodes);

const BlockchainNetworkVisualization: React.FC<BlockchainNetworkVisualizationProps> = ({
  title = 'Blockchain Network',
  nodes = mockNodes,
  links = mockLinks,
  loading = false,
  onRefresh,
  onNodeClick,
  className = '',
}) => {
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const nodeTypes = Array.from(new Set(nodes.map(node => node.type)));
  const nodeStatuses = ['active', 'warning', 'error'];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'; // accent-green
      case 'warning': return '#f59e0b'; // accent-yellow
      case 'error': return '#ef4444'; // accent-red
      default: return '#6b7280'; // text-tertiary
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Core': return '#3b82f6'; // accent-blue
      case 'Edge': return '#8b5cf6'; // accent-purple
      case 'Civic': return '#10b981'; // accent-green
      case 'Privacy': return '#f59e0b'; // accent-yellow
      case 'Quantum': return '#ef4444'; // accent-red
      default: return '#6b7280'; // text-tertiary
    }
  };
  
  const filteredNodes = nodes.filter(node => {
    const matchesType = filter.type === '' || node.type === filter.type;
    const matchesStatus = filter.status === '' || node.status === filter.status;
    return matchesType && matchesStatus;
  });
  
  const filteredLinks = links.filter(link => {
    const sourceNode = filteredNodes.find(node => node.id === link.source);
    const targetNode = filteredNodes.find(node => node.id === link.target);
    return sourceNode && targetNode;
  });
  
  useEffect(() => {
    if (!canvasRef.current || loading) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    filteredNodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) {
        node.x = Math.random() * canvas.width;
        node.y = Math.random() * canvas.height;
      }
    });
    
    const simulation = () => {
      for (let i = 0; i < 10; i++) { // Run multiple iterations per frame for faster convergence
        for (let i = 0; i < filteredNodes.length; i++) {
          for (let j = i + 1; j < filteredNodes.length; j++) {
            const nodeA = filteredNodes[i];
            const nodeB = filteredNodes[j];
            
            if (nodeA.x === undefined || nodeA.y === undefined || 
                nodeB.x === undefined || nodeB.y === undefined) continue;
            
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance === 0) continue;
            
            const repulsiveForce = 1000 / (distance * distance);
            const forceX = dx / distance * repulsiveForce;
            const forceY = dy / distance * repulsiveForce;
            
            nodeA.x -= forceX;
            nodeA.y -= forceY;
            nodeB.x += forceX;
            nodeB.y += forceY;
          }
        }
        
        filteredLinks.forEach(link => {
          const sourceNode = filteredNodes.find(node => node.id === link.source);
          const targetNode = filteredNodes.find(node => node.id === link.target);
          
          if (!sourceNode || !targetNode || 
              sourceNode.x === undefined || sourceNode.y === undefined || 
              targetNode.x === undefined || targetNode.y === undefined) return;
          
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance === 0) return;
          
          const attractiveForce = 0.05 * distance * link.strength;
          const forceX = dx / distance * attractiveForce;
          const forceY = dy / distance * attractiveForce;
          
          sourceNode.x += forceX;
          sourceNode.y += forceY;
          targetNode.x -= forceX;
          targetNode.y -= forceY;
        });
        
        filteredNodes.forEach(node => {
          if (node.x === undefined || node.y === undefined) return;
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          node.x += (centerX - node.x) * 0.01;
          node.y += (centerY - node.y) * 0.01;
          
          const padding = 50;
          node.x = Math.max(padding, Math.min(canvas.width - padding, node.x));
          node.y = Math.max(padding, Math.min(canvas.height - padding, node.y));
        });
      }
    };
    
    const render = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      
      filteredLinks.forEach(link => {
        const sourceNode = filteredNodes.find(node => node.id === link.source);
        const targetNode = filteredNodes.find(node => node.id === link.target);
        
        if (!sourceNode || !targetNode || 
            sourceNode.x === undefined || sourceNode.y === undefined || 
            targetNode.x === undefined || targetNode.y === undefined) return;
        
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        ctx.strokeStyle = getStatusColor(link.status);
        ctx.globalAlpha = 0.3 + link.strength * 0.4; // Vary opacity based on strength
        ctx.lineWidth = 1 + link.strength * 2; // Vary width based on strength
        
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });
      
      filteredNodes.forEach(node => {
        if (node.x === undefined || node.y === undefined) return;
        
        const radius = node.size * (selectedNode?.id === node.id ? 1.5 : 1);
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = getTypeColor(node.type);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = getStatusColor(node.status);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (node.size >= 12 || selectedNode?.id === node.id) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.type, node.x, node.y);
        }
      });
      
      ctx.restore();
    };
    
    let animationFrameId: number;
    const animate = () => {
      simulation();
      render();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / zoom;
      const mouseY = (e.clientY - rect.top) / zoom;
      
      let hoveredNode: Node | null = null;
      for (const node of filteredNodes) {
        if (node.x === undefined || node.y === undefined) continue;
        
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= node.size) {
          hoveredNode = node;
          break;
        }
      }
      
      canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
    };
    
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / zoom;
      const mouseY = (e.clientY - rect.top) / zoom;
      
      let clickedNode: Node | null = null;
      for (const node of filteredNodes) {
        if (node.x === undefined || node.y === undefined) continue;
        
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= node.size) {
          clickedNode = node;
          break;
        }
      }
      
      if (clickedNode) {
        setSelectedNode(clickedNode);
        if (onNodeClick) onNodeClick(clickedNode.id);
      } else {
        setSelectedNode(null);
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [filteredNodes, filteredLinks, loading, zoom, selectedNode, onNodeClick]);
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  const handleExportImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'blockchain-network.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className={`bg-background-secondary border border-border-light rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        <div className="flex items-center">
          <div className="p-2 rounded-md bg-background-tertiary mr-3">
            <Globe className="h-5 w-5 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-base font-medium text-text-primary">{title}</h2>
            <p className="text-xs text-text-tertiary mt-0.5">Interactive visualization of blockchain network</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <select
              className="text-xs bg-background-tertiary border border-border-light rounded-md px-2 py-1 text-text-secondary"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              {nodeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              className="text-xs bg-background-tertiary border border-border-light rounded-md px-2 py-1 text-text-secondary"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {nodeStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative h-[400px] bg-background-primary"
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
              <p className="mt-4 text-text-secondary">Loading network data...</p>
            </div>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        )}
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button 
            className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4 text-text-secondary" />
          </button>
          <button 
            className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4 text-text-secondary" />
          </button>
          <button 
            className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
            onClick={handleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4 text-text-secondary" />
            ) : (
              <Maximize className="h-4 w-4 text-text-secondary" />
            )}
          </button>
          <button 
            className="p-2 bg-background-secondary border border-border-light rounded-md shadow-lg hover:bg-background-elevated transition-colors"
            onClick={handleExportImage}
          >
            <Download className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background-secondary border border-border-light rounded-md p-3 shadow-lg">
          <div className="text-xs font-medium text-text-tertiary mb-2">Node Types</div>
          <div className="space-y-2">
            {nodeTypes.map(type => (
              <div key={type} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getTypeColor(type) }}
                ></div>
                <span className="text-xs text-text-secondary">{type}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected node info */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 bg-background-secondary border border-border-light rounded-md p-3 shadow-lg max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-text-primary">Node Details</div>
              <button 
                className="text-text-tertiary hover:text-text-secondary"
                onClick={() => setSelectedNode(null)}
              >
                ×
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-text-tertiary">ID:</span>
                <span className="text-xs text-text-secondary">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-tertiary">Type:</span>
                <span className="text-xs text-text-secondary">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-tertiary">Status:</span>
                <span className="text-xs text-text-secondary flex items-center">
                  <span 
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: getStatusColor(selectedNode.status) }}
                  ></span>
                  {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-tertiary">Connections:</span>
                <span className="text-xs text-text-secondary">{selectedNode.connections.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainNetworkVisualization;
