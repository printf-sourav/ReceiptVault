import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  pulseDelay: number;
}

interface Connection {
  from: number;
  to: number;
  animated: boolean;
}

export default function NeuralBackground({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    // Generate nodes
    const generatedNodes: Node[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      pulseDelay: Math.random() * 5,
    }));
    setNodes(generatedNodes);

    // Generate connections
    const generatedConnections: Connection[] = [];
    for (let i = 0; i < generatedNodes.length; i++) {
      const connectionsPerNode = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < connectionsPerNode; j++) {
        const targetIndex = Math.floor(Math.random() * generatedNodes.length);
        if (targetIndex !== i) {
          generatedConnections.push({
            from: i,
            to: targetIndex,
            animated: Math.random() > 0.7,
          });
        }
      }
    }
    setConnections(generatedConnections);
  }, []);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
        </radialGradient>

        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Connections */}
      {connections.map((connection, i) => {
        const fromNode = nodes[connection.from];
        const toNode = nodes[connection.to];

        if (!fromNode || !toNode) return null;

        return (
          <motion.line
            key={i}
            x1={`${fromNode.x}%`}
            y1={`${fromNode.y}%`}
            x2={`${toNode.x}%`}
            y2={`${toNode.y}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: connection.animated ? [0, 1, 0] : 1,
              opacity: connection.animated ? [0, 0.3, 0] : 0.1,
            }}
            transition={{
              duration: connection.animated ? 3 + Math.random() * 2 : 0,
              repeat: connection.animated ? Infinity : 0,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const parallaxX = ((mouseX - window.innerWidth / 2) / window.innerWidth) * 20;
        const parallaxY = ((mouseY - window.innerHeight / 2) / window.innerHeight) * 20;

        return (
          <motion.circle
            key={node.id}
            cx={`calc(${node.x}% + ${parallaxX}px)`}
            cy={`calc(${node.y}% + ${parallaxY}px)`}
            r={node.size}
            fill="url(#nodeGradient)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: node.pulseDelay,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Animated Particles */}
      {connections.slice(0, 8).map((connection, i) => {
        const fromNode = nodes[connection.from];
        const toNode = nodes[connection.to];

        if (!fromNode || !toNode || !connection.animated) return null;

        return (
          <motion.circle
            key={`particle-${i}`}
            r="2"
            fill="#06b6d4"
            initial={{
              cx: `${fromNode.x}%`,
              cy: `${fromNode.y}%`,
              opacity: 0,
            }}
            animate={{
              cx: [`${fromNode.x}%`, `${toNode.x}%`],
              cy: [`${fromNode.y}%`, `${toNode.y}%`],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </svg>
  );
}
