"use client"

import { useState, useEffect, useRef } from "react"
import { AlertTriangle, Shield, Activity, Users, Eye, Wifi, Server } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types for real network data
interface NetworkInterface {
  name: string
  address: string
  family: string
  internal: boolean
  mac: string
}

interface RealPacket {
  id: string
  timestamp: number
  source_ip: string
  dest_ip: string
  source_port: number
  dest_port: number
  protocol: string
  length: number
  flags: string[]
  payload_size: number
  threat_score: number
}

interface NetworkConnection {
  source_ip: string
  dest_ip: string
  protocol: string
  port: number
  packets: number
  bytes: number
  first_seen: number
  last_seen: number
  status: "active" | "closed"
}

interface SecurityThreat {
  id: string
  timestamp: number
  type: "port_scan" | "ddos" | "brute_force" | "suspicious_traffic" | "malware_signature"
  source_ip: string
  target_ip: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  rule_triggered: string
  blocked: boolean
  packet_count: number
}

interface NetworkStats {
  interfaces: NetworkInterface[]
  total_packets: number
  total_bytes: number
  packets_per_second: number
  active_connections: number
  unique_ips: number
  threats_detected: number
  uptime: number
}

export default function RealNetworkMonitor() {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedInterface, setSelectedInterface] = useState<string>("")
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    interfaces: [],
    total_packets: 0,
    total_bytes: 0,
    packets_per_second: 0,
    active_connections: 0,
    unique_ips: 0,
    threats_detected: 0,
    uptime: 0,
  })
  const [recentPackets, setRecentPackets] = useState<RealPacket[]>([])
  const [activeConnections, setActiveConnections] = useState<NetworkConnection[]>([])
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const wsRef = useRef<WebSocket | null>(null) 

  // WebSocket connection for real-time data
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connect = () => {
      try {
        ws = new WebSocket("ws://localhost:8080")
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          reconnectAttempts = 0
          console.log("Connected to network monitor backend")
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            switch (data.type) {
              case "network_stats":
                setNetworkStats(data.payload)
                break
              case "packet_capture":
                setRecentPackets((prev) => [data.payload, ...prev.slice(0, 100)])
                break
              case "connection_update":
                setActiveConnections(data.payload)
                break
              case "security_alert":
                setSecurityThreats((prev) => [data.payload, ...prev.slice(0, 50)])
                break
              default:
                console.log("Unknown message type:", data.type)
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        ws.onclose = (event) => {
          setIsConnected(false)
          console.log("Disconnected from network monitor backend", event.code, event.reason)

          // Attempt to reconnect if not manually closed
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`)
            reconnectTimeout = setTimeout(connect, 3000 * reconnectAttempts)
          }
        }

        ws.onerror = (error) => {
          console.error("WebSocket connection error:", error)
          setIsConnected(false)
        }
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error)
        setIsConnected(false)

        // Retry connection
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          reconnectTimeout = setTimeout(connect, 5000)
        }
      }
    }

    // Initial connection
    connect()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (ws) {
        ws.close(1000, "Component unmounting")
      }
    }
  }, [])

  const startMonitoring = () => {
  if (isConnected && selectedInterface && wsRef.current) {
    const message = JSON.stringify({
      action: "start_capture",
      interface: selectedInterface,
    });
    wsRef.current.send(message); // This line sends the command
    console.log("Starting monitoring for interface:", selectedInterface);
    setIsMonitoring(true);
  }
};
  
  const stopMonitoring = () => {
  if (wsRef.current) {
    const message = JSON.stringify({
      action: "stop_capture",
    });
    wsRef.current.send(message); // This line sends the command
  }
  console.log("Stopping monitoring");
  setIsMonitoring(false);
};
  
  



  const getProtocolColor = (protocol: string) => {
    switch (protocol.toLowerCase()) {
      case "tcp":
        return "bg-blue-500"
      case "udp":
        return "bg-green-500"
      case "icmp":
        return "bg-yellow-500"
      case "http":
        return "bg-purple-500"
      case "https":
        return "bg-indigo-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-400" />
              Real-Time Network Monitor
            </h1>
            <p className="text-gray-400 mt-1">Live network traffic analysis with IDS capabilities</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"} className="px-3 py-1">
              <Wifi className="w-4 h-4 mr-1" />
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant={isMonitoring ? "default" : "secondary"} className="px-3 py-1">
              <Activity className="w-4 h-4 mr-1" />
              {isMonitoring ? "Monitoring" : "Idle"}
            </Badge>
          </div>
        </div>

        {/* Connection Status Alert */}
        {!isConnected && (
          <Alert className="bg-red-900/20 border-red-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Backend server not connected. Make sure the Node.js network monitor is running on port 8080.
            </AlertDescription>
          </Alert>
        )}

        {/* Interface Selection and Controls */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Network Interface Control</CardTitle>
            <CardDescription>Select network interface and start packet capture</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Select value={selectedInterface} onValueChange={setSelectedInterface}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select network interface" />
              </SelectTrigger>
              <SelectContent>
                {networkStats.interfaces.map((iface) => (
                  <SelectItem key={iface.name} value={iface.name}>
                    {iface.name} - {iface.address} ({iface.family})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              disabled={!isConnected || !selectedInterface}
              variant={isMonitoring ? "destructive" : "default"}
            >
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Packets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{networkStats.total_packets.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Data Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatBytes(networkStats.total_bytes)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Packets/sec</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{networkStats.packets_per_second}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{networkStats.active_connections}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Unique IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{networkStats.unique_ips}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{networkStats.threats_detected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Threats Alert */}
        {securityThreats.filter((t) => t.severity === "critical" || t.severity === "high").length > 0 && (
          <Alert className="bg-red-900/20 border-red-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>
                {securityThreats.filter((t) => t.severity === "critical" || t.severity === "high").length}
              </strong>{" "}
              high-priority security threats detected in real-time
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="packets" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="packets">Live Packets</TabsTrigger>
            <TabsTrigger value="connections">Active Connections</TabsTrigger>
            <TabsTrigger value="threats">Security Threats</TabsTrigger>
            <TabsTrigger value="topology">Network Map</TabsTrigger>
          </TabsList>

          <TabsContent value="packets" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Real-Time Packet Capture
                </CardTitle>
                <CardDescription>Live network packets from {selectedInterface || "selected interface"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentPackets.map((packet) => (
                    <div key={packet.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={`${getProtocolColor(packet.protocol)} text-white border-0`}>
                          {packet.protocol}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {packet.source_ip}:{packet.source_port} → {packet.dest_ip}:{packet.dest_port}
                          </div>
                          <div className="text-sm text-gray-400">
                            Length: {packet.length} bytes • Payload: {packet.payload_size} bytes
                            {packet.flags.length > 0 && ` • Flags: ${packet.flags.join(", ")}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">{new Date(packet.timestamp).toLocaleTimeString()}</div>
                        {packet.threat_score > 0 && (
                          <Badge variant="destructive" className="mt-1">
                            Threat: {packet.threat_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {recentPackets.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No packets captured yet</p>
                      <p className="text-sm">Start monitoring to see live network traffic</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Network Connections
                </CardTitle>
                <CardDescription>Current active connections and sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activeConnections.map((conn, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={`${getProtocolColor(conn.protocol)} text-white border-0`}>
                          {conn.protocol}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {conn.source_ip} ↔ {conn.dest_ip}:{conn.port}
                          </div>
                          <div className="text-sm text-gray-400">
                            {conn.packets} packets • {formatBytes(conn.bytes)} • Duration:{" "}
                            {Math.floor((conn.last_seen - conn.first_seen) / 1000)}s
                          </div>
                        </div>
                      </div>
                      <Badge variant={conn.status === "active" ? "default" : "secondary"}>{conn.status}</Badge>
                    </div>
                  ))}
                  {activeConnections.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No active connections</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Real-Time Security Threats
                </CardTitle>
                <CardDescription>IDS alerts and threat detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {securityThreats.map((threat) => (
                    <div
                      key={threat.id}
                      className="flex items-start gap-4 p-4 bg-gray-700 rounded-lg border-l-4 border-l-red-500"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`${getSeverityColor(threat.severity)} text-white border-0`}
                          >
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{threat.type.replace("_", " ").toUpperCase()}</Badge>
                          {threat.blocked && (
                            <Badge variant="outline" className="bg-green-600 text-white border-0">
                              BLOCKED
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium mb-1">{threat.description}</div>
                        <div className="text-sm text-gray-400">
                          Source: {threat.source_ip} → Target: {threat.target_ip}
                        </div>
                        <div className="text-sm text-gray-400">
                          Rule: {threat.rule_triggered} • Packets: {threat.packet_count}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(threat.timestamp).toLocaleString()}</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {securityThreats.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No security threats detected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topology" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Network Topology Map
                </CardTitle>
                <CardDescription>Visual representation of discovered network hosts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Network topology visualization</p>
                  <p className="text-sm">Mapping discovered hosts and connections...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
