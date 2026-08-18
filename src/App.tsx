import { useState, useEffect } from 'react'
import Hero12 from './components/originkit/hero-12'

// ==========================================
// MOCK DATA TYPES
// ==========================================
interface Order {
  id: string
  customer: string
  priority: 'Urgent' | 'High' | 'Medium' | 'Normal'
  item: string
  qty: number
  status: string
  sla: string
  recommendation: string
  score: number
  allocStatus: 'Allocated' | 'Pending' | 'Partial'
  pickStatus: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed'
  packStatus: 'Not Started' | 'In Progress' | 'Completed'
  dispatchStatus: 'Not Started' | 'Ready' | 'Completed'
}

interface Product {
  id: string
  name: string
  total: number
  reserved: number
  available: number
  damaged: number
  reorderLevel: number
  status: 'Healthy' | 'Low Stock' | 'Out of Stock'
  demand: number
  daysRemaining: number
}

interface Picker {
  id: string
  name: string
  tasks: number
  workload: number
}

interface Exception {
  id: string
  type: string
  orderId: string
  details: string
  recommendation: string
  resolved: boolean
}

interface Shipment {
  id: string
  orderId: string
  customer: string
  status: 'On Time' | 'At Risk' | 'Delayed'
  reason: string
  recommendation: string
  prioritized: boolean
}

function App() {
  // ==========================================
  // APP NAVIGATION AND MODAL STATE
  // ==========================================
  const [isDashboardMode, setIsDashboardMode] = useState(false)
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'orders' | 'inventory' | 'allocation' | 'picking' | 'exceptions' | 'analytics' | 'whatif'>('overview')
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [activeReasoningId, setActiveReasoningId] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  
  // Custom Alternative Stock modal/panel state for P311
  const [showAltStockModal, setShowAltStockModal] = useState(false)
  const [altStockStatus, setAltStockStatus] = useState<'idle' | 'found' | 'transferred'>('idle')

  // ==========================================
  // LIVING STATE DATA
  // ==========================================
  const [orders, setOrders] = useState<Order[]>([
    { id: "1024", customer: "NovaLogistics", priority: "Urgent", item: "Smart Sensor Hub", qty: 10, status: "Inventory Shortage", sla: "2 hours", recommendation: "Reallocate stock from lower-priority orders", score: 94, allocStatus: "Pending", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started" },
    { id: "1025", customer: "AeroParts Inc", priority: "High", item: "RFID Tags (Bulk)", qty: 500, status: "Allocated", sla: "4 hours", recommendation: "Release to pick queue", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 81 },
    { id: "1026", customer: "Apex Retail", priority: "Medium", item: "Industrial Scanner", qty: 5, status: "Picking", sla: "6 hours", recommendation: "Optimize picker route", allocStatus: "Allocated", pickStatus: "In Progress", packStatus: "Not Started", dispatchStatus: "Not Started", score: 63 },
    { id: "1027", customer: "Zenith Warehousing", priority: "High", item: "Wireless Mouse (Enterprise)", qty: 30, status: "Packing", sla: "3 hours", recommendation: "Verify packing completeness", allocStatus: "Allocated", pickStatus: "Completed", packStatus: "In Progress", dispatchStatus: "Not Started", score: 81 },
    { id: "1028", customer: "Global Dist", priority: "Normal", item: "Smart Sensor Hub", qty: 5, status: "Allocated", sla: "12 hours", recommendation: "Hold for consolidation", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 42 },
    { id: "1029", customer: "TechFulfill", priority: "Normal", item: "Barcode Labels", qty: 1000, status: "Dispatched", sla: "SLA Met", recommendation: "None", allocStatus: "Allocated", pickStatus: "Completed", packStatus: "Completed", dispatchStatus: "Completed", score: 42 },
    { id: "1030", customer: "Prime Delivery", priority: "High", item: "Heavy Duty Casters", qty: 20, status: "Allocated", sla: "5 hours", recommendation: "Ready for picking", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 81 },
    { id: "1031", customer: "SwiftCargo", priority: "Medium", item: "Lithium Batteries (10-pack)", qty: 8, status: "Ready for Dispatch", sla: "7 hours", recommendation: "Load on SwiftTruck #4", allocStatus: "Allocated", pickStatus: "Completed", packStatus: "Completed", dispatchStatus: "Ready", score: 63 },
    { id: "1032", customer: "Helix Systems", priority: "High", item: "Thermal Printer P204", qty: 2, status: "Picking Delay", sla: "2 hours", recommendation: "Reassign picker task", allocStatus: "Allocated", pickStatus: "Delayed", packStatus: "Not Started", dispatchStatus: "Not Started", score: 81 },
    { id: "1035", customer: "Orbit Retail", priority: "Normal", item: "Bubble Wrap Rolls", qty: 15, status: "Allocated", sla: "24 hours", recommendation: "None", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 42 },
    { id: "1036", customer: "Stellar Logistics", priority: "Medium", item: "RFID Scanner S311", qty: 4, status: "Stock Unassigned", sla: "8 hours", recommendation: "Locate alternative warehouse inventory", allocStatus: "Pending", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 63 },
    { id: "1037", customer: "Quantum Corp", priority: "Urgent", item: "Heavy Duty Casters", qty: 10, status: "Allocated", sla: "1 hour", recommendation: "Mark express picking", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 94 },
    { id: "1038", customer: "NextGen Tech", priority: "Normal", item: "Wireless Mouse (Enterprise)", qty: 12, status: "Allocated", sla: "16 hours", recommendation: "None", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 42 },
    { id: "1039", customer: "Pinnacle Stores", priority: "Medium", item: "Industrial Scanner", qty: 3, status: "Allocated", sla: "9 hours", recommendation: "None", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 63 },
    { id: "1040", customer: "Vortex Supply", priority: "High", item: "Lithium Batteries (10-pack)", qty: 15, status: "Allocated", sla: "4 hours", recommendation: "Ensure special containment packing", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 81 },
    { id: "1041", customer: "Echo Freight", priority: "High", item: "Barcode Labels", qty: 2500, status: "Packing Queue", sla: "3 hours", recommendation: "Route to high-speed pack table", allocStatus: "Allocated", pickStatus: "Completed", packStatus: "In Progress", dispatchStatus: "Not Started", score: 81 },
    { id: "1048", customer: "Alpha Dist", priority: "Medium", item: "Thermal Printer P204", qty: 5, status: "Missing Item exception", sla: "5 hours", recommendation: "Check Warehouse B", allocStatus: "Partial", pickStatus: "In Progress", packStatus: "Not Started", dispatchStatus: "Not Started", score: 63 },
    { id: "1051", customer: "Summit Goods", priority: "High", item: "Lithium Batteries (10-pack)", qty: 2, status: "Damaged Item exception", sla: "4 hours", recommendation: "Reallocate fresh inventory", allocStatus: "Partial", pickStatus: "Completed", packStatus: "Not Started", dispatchStatus: "Not Started", score: 81 },
    { id: "1052", customer: "Cascade Supply", priority: "Normal", item: "Industrial Scanner", qty: 1, status: "Allocated", sla: "20 hours", recommendation: "None", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 42 },
    { id: "1053", customer: "Atlas Wholesale", priority: "Medium", item: "Smart Sensor Hub", qty: 4, status: "Allocated", sla: "10 hours", recommendation: "None", allocStatus: "Allocated", pickStatus: "Not Started", packStatus: "Not Started", dispatchStatus: "Not Started", score: 63 }
  ])

  const [inventory, setInventory] = useState<Product[]>([
    { id: "P201", name: "Wireless Mouse (Enterprise)", total: 120, reserved: 78, available: 42, damaged: 3, reorderLevel: 30, status: "Healthy", demand: 14, daysRemaining: 3 },
    { id: "P204", name: "Thermal Printer P204", total: 25, reserved: 7, available: 18, damaged: 0, reorderLevel: 25, status: "Low Stock", demand: 5, daysRemaining: 3 },
    { id: "P311", name: "RFID Scanner S311", total: 0, reserved: 0, available: 0, damaged: 2, reorderLevel: 10, status: "Out of Stock", demand: 8, daysRemaining: 0 },
    { id: "P401", name: "Smart Sensor Hub", total: 15, reserved: 12, available: 3, damaged: 1, reorderLevel: 8, status: "Low Stock", demand: 6, daysRemaining: 1 },
    { id: "P502", name: "RFID Tags (Bulk)", total: 2400, reserved: 1200, available: 1200, damaged: 0, reorderLevel: 500, status: "Healthy", demand: 250, daysRemaining: 4 },
    { id: "P112", name: "Industrial Scanner", total: 45, reserved: 32, available: 13, damaged: 1, reorderLevel: 10, status: "Healthy", demand: 4, daysRemaining: 3 },
    { id: "P709", name: "Barcode Labels", total: 5800, reserved: 3500, available: 2300, damaged: 0, reorderLevel: 1000, status: "Healthy", demand: 800, daysRemaining: 2 },
    { id: "P881", name: "Heavy Duty Casters", total: 90, reserved: 60, available: 30, damaged: 4, reorderLevel: 20, status: "Healthy", demand: 15, daysRemaining: 2 },
    { id: "P992", name: "Lithium Batteries (10-pack)", total: 85, reserved: 65, available: 20, damaged: 2, reorderLevel: 15, status: "Healthy", demand: 12, daysRemaining: 1 },
    { id: "P101", name: "Bubble Wrap Rolls", total: 150, reserved: 95, available: 55, damaged: 0, reorderLevel: 40, status: "Healthy", demand: 20, daysRemaining: 2 },
    { id: "P102", name: "Stretch Wrap Film", total: 72, reserved: 48, available: 24, damaged: 0, reorderLevel: 20, status: "Healthy", demand: 8, daysRemaining: 3 },
    { id: "P103", name: "Heavy Duty Pallets", total: 140, reserved: 110, available: 30, damaged: 5, reorderLevel: 25, status: "Healthy", demand: 10, daysRemaining: 3 },
    { id: "P104", name: "ESD Safe Bags", total: 900, reserved: 450, available: 450, damaged: 0, reorderLevel: 200, status: "Healthy", demand: 100, daysRemaining: 4 },
    { id: "P105", name: "Hazardous Materials Pouches", total: 60, reserved: 40, available: 20, damaged: 1, reorderLevel: 15, status: "Healthy", demand: 6, daysRemaining: 3 },
    { id: "P106", name: "Smart Bluetooth Beacons", total: 110, reserved: 90, available: 20, damaged: 2, reorderLevel: 25, status: "Low Stock", demand: 15, daysRemaining: 1 }
  ])

  const [pickers, setPickers] = useState<Picker[]>([
    { id: "01", name: "Picker 01 (Zone A)", tasks: 12, workload: 82 },
    { id: "02", name: "Picker 02 (Zone B)", tasks: 7, workload: 48 },
    { id: "03", name: "Picker 03 (Zone C)", tasks: 15, workload: 94 }
  ])

  const [exceptions, setExceptions] = useState<Exception[]>([
    { id: "E1", type: "Damaged Item", orderId: "1051", details: "Lithium Batteries: Expected 2, Good 1, Damaged 1", recommendation: "Locate replacement inventory and reallocate before dispatch", resolved: false },
    { id: "E2", type: "Missing Item", orderId: "1048", details: "Missing SKU: P204 (Thermal Printer)", recommendation: "Check alternative warehouse inventory (Warehouse B has 8 units)", resolved: false }
  ])

  const [shipments, setShipments] = useState<Shipment[]>([
    { id: "883", orderId: "1041", customer: "Echo Freight", status: "At Risk", reason: "Packing delay at Table 02", recommendation: "Reallocate one packing resource to Table 02", prioritized: false }
  ])

  // KPIs
  const [kpis, setKpis] = useState({
    activeOrders: 128,
    fulfillmentRate: 94.2,
    availableInventory: 84.0,
    ordersAtRisk: 7,
    lowStockItems: 12,
    activeExceptions: 4
  })

  // Simulated Picking state
  const [pickingStatus, setPickingStatus] = useState<'idle' | 'routing' | 'completed'>('idle')
  const [pickingProgress, setPickingProgress] = useState(0)

  // What-If Simulator state
  const [selectedWhatIf, setSelectedWhatIf] = useState<string>('none')
  const [whatIfResults, setWhatIfResults] = useState<{
    affectedOrders: number
    delayedOrders: number
    actionText: string
    confidence: number
  } | null>(null)

  // AI Assistant chat history
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant', text: string, list?: Array<{ title: string, desc: string }> }>>([
    { sender: 'assistant', text: "Hello, I am SmartFulfill AI. I am monitoring your warehouse operations. Ask me about delays, inventory limits, exception resolutions, or picker workloads." }
  ])

  // ==========================================
  // ACTION CONTROLLER METHODS (DECISION EXECUTION)
  // ==========================================
  
  const showToast = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  // 1. Resolve urgent order shortages (AI DECISION ENGINE)
  const handleApplyUrgentDecision = () => {
    // Reallocate stock for order 1024
    setOrders(prev => prev.map(o => {
      if (o.id === "1024") {
        return {
          ...o,
          status: "Fully Allocated",
          allocStatus: "Allocated",
          recommendation: "Released to Picking Route A-4"
        }
      }
      // Order 1028 releases 5 units of Smart Sensor Hub for 1024
      if (o.id === "1028") {
        return {
          ...o,
          status: "Pending Replenishment",
          allocStatus: "Partial",
          recommendation: "Hold for next inbound shipment"
        }
      }
      return o
    }))

    // Update smart sensor hub quantities
    setInventory(prev => prev.map(p => {
      if (p.id === "P401") {
        return {
          ...p,
          reserved: p.reserved + 3, // allocate the remaining 3 units needed from inbound/reserves
          available: 0
        }
      }
      return p
    }))

    // Decrement at risk orders
    setKpis(prev => ({
      ...prev,
      ordersAtRisk: Math.max(0, prev.ordersAtRisk - 1),
      fulfillmentRate: 95.1
    }))

    showToast("AI Decision applied: Allocated 7 available units of Smart Sensor Hub to Order #1024, reallocated remaining deficit from Order #1028.")
  }

  // 2. Resolve Damaged Item Exception ( summit goods order 1051)
  const handleResolveDamagedException = () => {
    setExceptions(prev => prev.map(e => e.id === "E1" ? { ...e, resolved: true } : e))
    setOrders(prev => prev.map(o => o.id === "1051" ? { ...o, status: "Fulfillment Ready", allocStatus: "Allocated", recommendation: "Send to packing station" } : o))
    setKpis(prev => ({ ...prev, activeExceptions: Math.max(0, prev.activeExceptions - 1) }))
    showToast("Exception Resolved: Substituted damaged lithium batteries with fresh stock from Reserve Cage B.")
  }

  // 3. Find Alternative Stock for Out of Stock (RFID Scanner S311)
  const handleFindAlternativeStock = () => {
    setShowAltStockModal(true)
    setAltStockStatus('found')
  }

  const handleExecuteStockTransfer = () => {
    setInventory(prev => prev.map(p => {
      if (p.id === "P311") {
        return {
          ...p,
          total: 12,
          available: 12,
          status: "Healthy"
        }
      }
      return p
    }))

    setOrders(prev => prev.map(o => {
      if (o.id === "1036") { // RFID Scanner S311 order
        return {
          ...o,
          status: "Allocated",
          allocStatus: "Allocated",
          recommendation: "Route to picking"
        }
      }
      return o
    }))

    setKpis(prev => ({
      ...prev,
      lowStockItems: Math.max(0, prev.lowStockItems - 1),
      fulfillmentRate: 96.0
    }))

    setAltStockStatus('transferred')
    showToast("Alternative Stock Transfer Executed: Moved 12 units of RFID Scanner S311 from auxiliary Warehouse B into primary shelves.")
    setTimeout(() => {
      setShowAltStockModal(false)
      setAltStockStatus('idle')
    }, 2000)
  }

  // 4. Start Optimized Picking routes
  const handleStartPicking = () => {
    if (pickingStatus === 'routing') return
    setPickingStatus('routing')
    setPickingProgress(0)
    showToast("Starting optimized pick route. AI recalculation reduced picker travel path by 38% (87m -> 54m).")
  }

  useEffect(() => {
    let timer: number
    if (pickingStatus === 'routing') {
      timer = window.setInterval(() => {
        setPickingProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer)
            setPickingStatus('completed')
            // Update orders that are in picking status
            setOrders(prevOrders => prevOrders.map(o => {
              if (o.status === "Picking" || o.id === "1026") {
                return { ...o, status: "Quality Check", pickStatus: "Completed", packStatus: "In Progress" }
              }
              return o
            }))
            showToast("Optimized picker route completed. Order #1026 has been routed to Packing Table 01.")
            return 100
          }
          return prev + 10
        })
      }, 300)
    }
    return () => clearInterval(timer)
  }, [pickingStatus])

  // 5. Rebalance Picker Workload
  const handleRebalanceWorkload = () => {
    setPickers(prev => prev.map(p => {
      if (p.id === "03") { // Picker 03 (94%)
        return { ...p, tasks: 12, workload: 76 }
      }
      if (p.id === "02") { // Picker 02 (48%)
        return { ...p, tasks: 10, workload: 66 }
      }
      return p
    }))
    showToast("AI Workload Rebalance Applied: Moved 3 picking tasks from Picker 03 to Picker 02. Workloads rebalanced to 76% and 66%.")
  }

  // 6. Replenish Low Stock Item (P204)
  const handleCreateReorder = (productId: string) => {
    setInventory(prev => prev.map(p => {
      if (p.id === productId) {
        const orderQty = productId === "P204" ? 50 : 30
        return {
          ...p,
          total: p.total + orderQty,
          available: p.available + orderQty,
          status: "Healthy"
        }
      }
      return p
    }))
    
    // Check if there are orders stuck on it (like order 1048)
    if (productId === "P204") {
      setOrders(prev => prev.map(o => {
        if (o.id === "1048") {
          return {
            ...o,
            status: "Allocated",
            allocStatus: "Allocated",
            recommendation: "Release to picking queue"
          }
        }
        return o
      }))
      setExceptions(prev => prev.map(e => e.orderId === "1048" ? { ...e, resolved: true } : e))
    }

    showToast(`Replenishment Order dispatched: Created procurement request for stock ID ${productId}. Available inventory updated.`)
  }

  // 7. Prioritize delayed shipment
  const handlePrioritizeShipment = (shipmentId: string) => {
    setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, status: "On Time", prioritized: true, reason: "Bypassed queue to Express Bay" } : s))
    showToast(`Shipment #${shipmentId} Prioritized. Packed via Express Table and loaded onto transport queue. SLA secured.`)
  }

  // ==========================================
  // WHAT-IF SCENARIOS SIMULATION
  // ==========================================
  const handleWhatIfRun = (scenario: string) => {
    setSelectedWhatIf(scenario)
    if (scenario === 'none') {
      setWhatIfResults(null)
      return
    }

    if (scenario === 'stock_decrease') {
      setWhatIfResults({
        affectedOrders: 4,
        delayedOrders: 2,
        actionText: "AI recommendation: Shift 8 reserve units from secondary warehouse B to bypass shortages, and initiate immediate reorder of 50 units.",
        confidence: 94
      })
    } else if (scenario === 'labor_deficit') {
      setWhatIfResults({
        affectedOrders: 18,
        delayedOrders: 8,
        actionText: "AI recommendation: Restructure pick lanes. Dynamically merge zones A and C, and prioritize high-margin orders first.",
        confidence: 91
      })
    } else if (scenario === 'delay_shipment') {
      setWhatIfResults({
        affectedOrders: 6,
        delayedOrders: 5,
        actionText: "AI recommendation: Re-route remaining orders to FedEx Express local parcel drop instead of default freight carrier.",
        confidence: 89
      })
    }
  }

  // ==========================================
  // AI ASSISTANT CHATBOT INTERACTION
  // ==========================================
  const handleAiAssistantQuery = (query: string) => {
    let replyText = ""
    let items: Array<{ title: string, desc: string }> | undefined = undefined

    if (query.includes("at risk")) {
      replyText = "I have detected 4 orders that are currently at risk due to process delays:"
      items = [
        { title: "Order #1024", desc: "Critical â€” Inventory shortage of Smart Sensor Hubs." },
        { title: "Order #1032", desc: "High â€” Picking delay in Zone C." },
        { title: "Order #1041", desc: "High â€” Packing table backlog." },
        { title: "Order #1048", desc: "Medium â€” Dispatch queue loading hold." }
      ]
    } else if (query.includes("1024")) {
      replyText = "Order #1024 (NovaLogistics) is flagged. We require 10 units of 'Smart Sensor Hub' but only 3 are physically free. The AI decision engine recommends reallocating 5 units from Order #1028 (normal priority) and routing the remaining from auxiliary stock. Would you like me to execute this reallocation?"
    } else if (query.includes("replenishment") || query.includes("stockout")) {
      replyText = "Two items require urgent procurement to avoid stockouts:"
      items = [
        { title: "Product P204 (Thermal Printer)", desc: "18 units available. Reorder level is 25. Projected depletion in 3 days." },
        { title: "Product P311 (RFID Scanner)", desc: "0 units available. 4 orders affected. Reorder required immediately." }
      ]
    } else if (query.includes("bottleneck")) {
      replyText = "The highest bottleneck is currently in the Dispatch stage. Average dispatch processing time is 14 minutes (normally 9 minutes, representing a +55% delay). The AI recommendation is to rebalance workloads between Dispatch Station 01 and Station 02."
    } else if (query.includes("picker")) {
      replyText = "Picker 03 (Zone C) is overloaded at 94% capacity with 15 active tasks, whereas Picker 02 is at 48% with 7 tasks. I recommend applying task rebalancing to move 3 picking tasks to Picker 02."
    } else {
      replyText = "I am processing the data. I can suggest routes, allocate stocks, or resolve alerts. Please use one of the quick actions below to query specific subsystems."
    }

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: query },
      { sender: 'assistant', text: replyText, list: items }
    ])
  }

  // ==========================================
  // NAVIGATION ROUTING
  // ==========================================
  const handleNavClick = (section: string) => {
    if (section === 'home') {
      setIsDashboardMode(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsDashboardMode(true)
    if (section === 'overview') setDashboardTab('overview')
    else if (section === 'orders') setDashboardTab('orders')
    else if (section === 'inventory') setDashboardTab('inventory')
    else if (section === 'allocation') setDashboardTab('allocation')
    else if (section === 'picking') setDashboardTab('picking')
    else if (section === 'exceptions') setDashboardTab('exceptions')
    else if (section === 'analytics') setDashboardTab('analytics')

    // Scroll to dashboard top after state changes
    setTimeout(() => {
      const el = document.getElementById('dashboard-view')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleExploreSolution = () => {
    const el = document.getElementById('problem-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="w-full min-h-screen text-white bg-[#04020b] font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-55 max-w-md animate-slide-up rounded-lg border border-purple-500/40 bg-[#120a24]/90 px-4 py-3 shadow-[0_0_20px_rgba(201,139,255,0.25)] backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-purple-400 animate-ping" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#c98bff]">Decision Executed</h4>
              <p className="mt-1 text-xs text-white/90 leading-relaxed">{notification}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Stock Transfer Modal */}
      {showAltStockModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-purple-500/30 bg-[#0e0b1a] p-6 shadow-[0_0_30px_rgba(201,139,255,0.15)]">
            <div className="flex items-center justify-between border-b border-[#2d234d] pb-4">
              <h3 className="font-instrument-serif text-2xl text-white">Find Alternative Stock</h3>
              <button onClick={() => setShowAltStockModal(false)} className="text-white/60 hover:text-white">&times;</button>
            </div>

            <div className="my-5 space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-purple-400">SKU QUERY</span>
                <p className="text-sm font-semibold">P311 â€” RFID Scanner S311</p>
              </div>

              {altStockStatus === 'found' && (
                <div className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">STOCK LOCATED</span>
                  </div>
                  <p className="mt-2 text-xs text-white/80 leading-relaxed">
                    <strong>Warehouse B (Auxiliary Hub)</strong> has <strong>12 units</strong> of S311 available. 
                    AI estimates transfer time to primary warehouse is <strong>45 minutes</strong>.
                  </p>
                </div>
              )}

              {altStockStatus === 'transferred' && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-300">TRANSFER COMPLETED</span>
                  </div>
                  <p className="mt-2 text-xs text-white/80 leading-relaxed">
                    Inventory has been successfully updated. S311 is now marked as <strong>Healthy</strong> in the primary stock directory.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d234d]">
              <button 
                onClick={() => setShowAltStockModal(false)} 
                className="rounded px-4 py-2 text-xs font-medium text-white/70 hover:text-white"
              >
                Close
              </button>
              {altStockStatus === 'found' && (
                <button 
                  onClick={handleExecuteStockTransfer} 
                  className="rounded bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200"
                >
                  Transfer Stock
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          LANDING PAGE MODE
          ========================================== */}
      {!isDashboardMode ? (
        <>
          {/* Main Hero (renders Navbar + HeroContent + HeroVisual) */}
          <Hero12
            onOpenCommandCenter={() => setIsDashboardMode(true)}
            onExploreSolution={handleExploreSolution}
            onNavClick={handleNavClick}
            onToggleAiAssistant={() => setAiAssistantOpen(prev => !prev)}
            isDashboardMode={isDashboardMode}
          />

          {/* Section 2: Problem Statement */}
          <section id="problem-section" className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#2d234d]">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[#c98bff] uppercase block mb-3">THE PROBLEM</span>
              <h2 className="font-instrument-serif text-3xl md:text-5xl lg:text-6xl text-white font-normal leading-tight text-balance">
                Warehouses don't fail because of a lack of data. They fail because the right decision is made too late.
              </h2>
              <p className="mt-6 text-sm md:text-base text-white/70 font-light leading-relaxed">
                Modern warehouses handle hundreds of products and orders simultaneously. Poor inventory visibility, incorrect stock allocation, delayed picking, misplaced items and fulfillment bottlenecks can quickly lead to stockouts, delayed shipments and unhappy customers.
              </p>
            </div>

            {/* Problem Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Inventory Visibility", desc: "Teams need a clear understanding of available, reserved, damaged and incoming stock before making allocation decisions." },
                { title: "Order Prioritization", desc: "Urgent orders can get buried behind lower-priority work when prioritization is handled manually." },
                { title: "Inventory Allocation", desc: "Limited stock creates difficult decisions when multiple orders compete for the same products." },
                { title: "Picking & Packing", desc: "Inefficient picking routes and workload imbalance increase fulfillment time." },
                { title: "Exceptions", desc: "Damaged, missing or unavailable items can interrupt the entire order workflow." },
                { title: "Fulfillment Bottlenecks", desc: "Without operational intelligence, teams often discover bottlenecks only after they affect delivery performance." }
              ].map((card, i) => (
                <div 
                  key={i} 
                  className="group relative rounded-xl border border-[#2d234d] bg-[#0e0b1a] p-6 transition-all duration-300 hover:border-[#c98bff]/30 hover:shadow-[0_0_30px_rgba(201,139,255,0.05)] cursor-default"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c98bff]/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-all duration-500" />
                  <span className="text-xs font-mono text-[#c98bff]/50 uppercase tracking-widest block mb-4">0{i+1} // SCENARIO</span>
                  <h3 className="font-tight text-lg font-semibold text-white group-hover:text-[#c98bff] transition-colors">{card.title}</h3>
                  <p className="mt-3 text-xs text-white/60 leading-relaxed font-light">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Why Traditional Systems Fail */}
          <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#2d234d] bg-gradient-to-b from-transparent to-[#0a0514]/30">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[#c98bff] uppercase block mb-3">TECHNOLOGY REVOLUTION</span>
              <h2 className="font-instrument-serif text-3xl md:text-5xl text-white font-normal">
                Why Traditional WMS Systems Fail
              </h2>
              <p className="mt-4 text-xs md:text-sm text-white/60">
                Legacy Warehouse Management Systems act as passive registries. Here is how SmartFulfill AI changes the paradigm.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-xl border border-red-500/10 bg-[#0e0b1a]/40 p-8 shadow-[inset_0_0_20px_rgba(239,68,68,0.02)]">
                <h3 className="font-instrument-serif text-2xl text-red-400 mb-6 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Traditional WMS
                </h3>
                <ul className="space-y-4 text-xs font-light text-white/60">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500/70 font-mono mt-0.5">âœ•</span>
                    <span><strong>Static Lists:</strong> Orders are processed sequentially without prioritizing commercial SLA or real-time business values.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500/70 font-mono mt-0.5">âœ•</span>
                    <span><strong>Manual Intervention:</strong> Inventory shortages trigger systemic failures that require managers to inspect sheets and manually reallocate items.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500/70 font-mono mt-0.5">âœ•</span>
                    <span><strong>Blind Travel Paths:</strong> Static picking routes do not account for physical warehouse traffic, bin status, or worker congestion.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500/70 font-mono mt-0.5">âœ•</span>
                    <span><strong>Reactive Analytics:</strong> Managers discover delays only at the end of shifts, when reports compile and customers complain.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-purple-500/20 bg-[#120a24]/30 p-8 shadow-[inset_0_0_20px_rgba(201,139,255,0.03)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#c98bff]/5 rounded-full blur-3xl pointer-events-none" />
                <h3 className="font-instrument-serif text-2xl text-[#c98bff] mb-6 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#c98bff] animate-pulse" /> SmartFulfill AI
                </h3>
                <ul className="space-y-4 text-xs font-light text-white/80">
                  <li className="flex items-start gap-3">
                    <span className="text-[#c98bff] font-mono mt-0.5">âœ“</span>
                    <span><strong>Dynamic Priority:</strong> Automatically ranks fulfillment sequence based on vehicle schedules, SLAs, and customer urgency.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#c98bff] font-mono mt-0.5">âœ“</span>
                    <span><strong>Autonomous Action:</strong> Decision engine reallocates inventory, reserves inbound stock, and updates queues automatically.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#c98bff] font-mono mt-0.5">âœ“</span>
                    <span><strong>Adaptive Picking:</strong> Real-time routing engines guide workers dynamically through path-optimized picking zones.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#c98bff] font-mono mt-0.5">âœ“</span>
                    <span><strong>Real-time Forecast:</strong> Identifies bottlenecks while they are forming, suggesting workload rebalancing immediately.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: SmartFulfill Solution */}
          <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#2d234d]">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[#c98bff] uppercase block mb-3">FROM DATA TO DECISION</span>
              <h2 className="font-instrument-serif text-3xl md:text-5xl text-white font-normal">
                One intelligence layer across the entire fulfillment lifecycle.
              </h2>
            </div>

            {/* Lifecycle visualization flow */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
              {[
                { name: "Observe", action: "Collect information from", items: ["Orders & Priority status", "Active Inventory bins", "Picking floor activity", "Packing station speeds", "Dispatch delays"] },
                { name: "Analyze", action: "Evaluate operational variables", items: ["Customer SLA deadlines", "Stock availability risks", "Zone travel distances", "Worker task backlogs", "Procurement lead times"] },
                { name: "Decide", action: "Generate smart recommendations", items: ["Stock reallocation vectors", "Dynamic pick routes", "Worker zoning updates", "Reorder schedules", "Exception resolution actions"] },
                { name: "Act", action: "Execute system orchestration", items: ["Instantly reallocate items", "Direct pickers via HUDs", "Print hazard wrap labels", "Dispatch courier transfers", "Auto-procure stockouts"] }
              ].map((step, i) => (
                <div 
                  key={i}
                  className="rounded-xl border border-[#2d234d] bg-[#0e0b1a]/60 p-6 relative hover:border-[#c98bff]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-instrument-serif text-white font-light group-hover:text-[#c98bff] transition-colors">{step.name}</span>
                    <span className="font-mono text-xs text-purple-400/50">STAGE 0{i+1}</span>
                  </div>
                  <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-mono block mb-3">{step.action}:</span>
                  <ul className="space-y-2">
                    {step.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-light text-white/70">
                        <span className="size-1 rounded-full bg-[#c98bff]/50" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-[#c98bff]/30 font-mono text-lg font-light">â†’</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Decision Engine Preview */}
          <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#2d234d]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[#c98bff] uppercase block">AI DECISION ENGINE</span>
                <h2 className="font-instrument-serif text-3xl md:text-5xl text-white leading-tight">
                  When the warehouse encounters a problem, SmartFulfill recommends what to do next.
                </h2>
                <p className="text-xs md:text-sm text-white/60 leading-relaxed font-light">
                  Our core decision engine continuously observes operational status, analyses exceptions, and renders precise actions to warehouse managers.
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => setIsDashboardMode(true)}
                    className="px-6 py-3 rounded bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer"
                  >
                    Open Command Center
                  </button>
                </div>
              </div>

              {/* Interactive Decision Engine Card */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-purple-500/20 bg-[#0e0b1a] p-6 shadow-[0_0_40px_rgba(201,139,255,0.06)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 border-l border-b border-purple-500/20 bg-purple-950/20 px-3 py-1 text-[10px] font-semibold text-[#c98bff] tracking-wider uppercase rounded-bl">
                    Interactive Preview
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-[#2d234d]">
                    <div>
                      <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono">SCENARIO REPORT</span>
                      <h3 className="text-lg font-semibold mt-1">Order Shortage Resolution</h3>
                    </div>
                    <div className="bg-[#120a24] border border-[#c98bff]/20 rounded px-2.5 py-1 text-right">
                      <span className="text-[8px] text-white/50 block font-mono">CONFIDENCE</span>
                      <span className="text-xs font-bold text-emerald-400">94.2%</span>
                    </div>
                  </div>

                  <div className="my-5 space-y-4">
                    {/* Exception block */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-red-500/25 border border-red-500 flex items-center justify-center text-xs text-red-300 font-mono">!</div>
                        <div className="w-[1px] grow bg-dashed border-l border-[#2d234d] mt-2" />
                      </div>
                      <div className="pb-2">
                        <span className="text-[9px] uppercase tracking-wider text-red-400 font-semibold">Exception Detected</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5">URGENT ORDER #1024 SHORTAGE</h4>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          Requires <strong>10 units</strong> of Smart Sensor Hub. Only <strong>3 units</strong> are available in stock. 
                          Normal-priority Order #1028 holds 5 allocated units.
                        </p>
                      </div>
                    </div>

                    {/* Decision block */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-purple-500/25 border border-purple-500 flex items-center justify-center text-xs text-[#c98bff] font-mono">A</div>
                        <div className="w-[1px] grow bg-dashed border-l border-[#2d234d] mt-2" />
                      </div>
                      <div className="pb-2">
                        <span className="text-[9px] uppercase tracking-wider text-purple-400 font-semibold">AI Decision</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5">PRIORITIZE URGENT ORDER</h4>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          Reallocate 5 units of Smart Sensor Hub from lower-priority Order #1028 to Order #1024. 
                          Mark deficit (2 units) as pending incoming shipment.
                        </p>
                      </div>
                    </div>

                    {/* Resolution block */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-[#c98bff]/25 border border-[#c98bff] flex items-center justify-center text-xs text-[#c98bff] font-mono">R</div>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#c98bff] font-semibold font-mono">Resolution Pipeline</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5">AUTO-STEERING ACTION</h4>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          Release Order #1024 for partial dispatch (80% SLA fulfillment), and auto-create replenishment route for the shortage.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#2d234d] mt-6">
                    <button 
                      onClick={() => setActiveReasoningId(activeReasoningId === 'urgent' ? null : 'urgent')}
                      className="text-xs font-semibold text-white/70 hover:text-white underline cursor-pointer"
                    >
                      {activeReasoningId === 'urgent' ? 'Hide Reasoning' : 'View Reasoning'}
                    </button>
                    <button 
                      onClick={handleApplyUrgentDecision}
                      disabled={orders.find(o => o.id === "1024")?.status === "Fully Allocated"}
                      className="rounded bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {orders.find(o => o.id === "1024")?.status === "Fully Allocated" ? "Applied" : "Apply Decision"}
                    </button>
                  </div>

                  {activeReasoningId === 'urgent' && (
                    <div className="mt-4 p-4 rounded border border-purple-500/20 bg-purple-950/20 text-xs text-white/80 leading-relaxed animate-slide-up">
                      <strong>AI Operational Reasoning:</strong> Reallocating from Order #1028 carries 0% risk of SLA breach because its shipping window is in 24 hours. Order #1024 must ship in 2 hours to meet the express carrier dispatch truck, protecting customer relations value and preventing delay penalties.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Fulfillment Workflow */}
          <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#2d234d]">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[#c98bff] uppercase block mb-3">WORKFLOW ARCHITECTURE</span>
              <h2 className="font-instrument-serif text-3xl md:text-5xl text-white font-normal">
                Autonomous Fulfillment Workflow
              </h2>
              <p className="mt-4 text-xs md:text-sm text-white/60">
                How an order transitions from entry to dispatch inside our intelligence ecosystem. Click a step to review operational metadata.
              </p>
            </div>

            {/* Workflow steps */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { step: "1", title: "Order Created", desc: "Order imported from WMS/ERP with metadata details." },
                { step: "2", title: "Priority Scored", desc: "AI engine scores order priority (0 to 100) instantly." },
                { step: "3", title: "Inventory Checked", desc: "Real-time stock audit checks bin coordinates." },
                { step: "4", title: "Stock Allocated", desc: "Automatic allocation and reservations are mapped." },
                { step: "5", title: "Picking Route", desc: "Optimized travel route generated on picker HUD." },
                { step: "6", title: "Packing Station", desc: "Orders packed and special hazmat flags attached." },
                { step: "7", title: "Quality Checked", desc: "Camera arrays inspect SKU shape and count details." },
                { step: "8", title: "Dispatch Load", desc: "Courier trucks assigned based on route delays." },
                { step: "9", title: "Inventory Updated", desc: "System updates active reserves and reorder levels." }
              ].map((wStep, i) => (
                <div 
                  key={i}
                  className="rounded-lg border border-[#2d234d] bg-[#0e0b1a] p-5 hover:border-[#c98bff]/30 cursor-default transition-all duration-300"
                >
                  <span className="font-mono text-xs text-[#c98bff] font-semibold">STAGE 0{wStep.step}</span>
                  <h4 className="text-xs font-semibold text-white mt-2">{wStep.title}</h4>
                  <p className="text-[10px] text-white/50 mt-1 leading-relaxed font-light">{wStep.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 15: Final CTA */}
          <section className="relative py-24 px-6 md:px-12 max-w-5xl mx-auto text-center border-t border-[#2d234d]">
            <div className="rounded-2xl border border-purple-500/20 bg-[#0c0819] py-16 px-8 shadow-[0_0_50px_rgba(201,139,255,0.04)] relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#c98bff]/5 rounded-full blur-3xl pointer-events-none" />
              
              <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[#c98bff] uppercase block mb-4">READY TO OPERATE SMARTER?</span>
              <h2 className="font-instrument-serif text-3xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-2xl mx-auto">
                Turn Warehouse Complexity Into Intelligent Action.
              </h2>
              <p className="mt-6 text-sm text-white/70 max-w-lg mx-auto font-light leading-relaxed">
                SmartFulfill AI helps your team see problems earlier, make better decisions and keep every order moving.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setIsDashboardMode(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Open Command Center
                </button>
                <button 
                  onClick={handleExploreSolution}
                  className="w-full sm:w-auto px-6 py-3 rounded border border-purple-500/30 text-white font-medium text-xs bg-transparent hover:bg-purple-950/20 transition-all cursor-pointer"
                >
                  Explore Operations
                </button>
              </div>
            </div>
          </section>

          {/* Section 16: Footer */}
          <footer className="border-t border-[#2d234d] bg-[#020106] py-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <img src="/originkit/hero-12/nav-logo.svg" alt="" className="size-[20px]" />
                <span className="font-sans text-base font-semibold tracking-wider text-white">SmartFulfill AI</span>
              </div>
              <p className="text-[10px] text-white/40 tracking-wider">
                &copy; 2026 SMARTFULFILL AI. FOR HACKATHON EVALUATION ONLY. ALL RIGHTS RESERVED.
              </p>
              <div className="flex items-center gap-6 text-xs text-white/60">
                <a href="#overview" onClick={(e) => {e.preventDefault(); handleNavClick('overview')}} className="hover:text-white transition-colors">Console</a>
                <a href="#orders" onClick={(e) => {e.preventDefault(); handleNavClick('orders')}} className="hover:text-white transition-colors">Orders</a>
                <a href="#inventory" onClick={(e) => {e.preventDefault(); handleNavClick('inventory')}} className="hover:text-white transition-colors">Inventory</a>
              </div>
            </div>
          </footer>
        </>
      ) : (
        // ==========================================
        // COMMAND CENTER (DASHBOARD) MODE
        // ==========================================
        <div id="dashboard-view" className="w-full min-h-screen bg-[#0d081e]">
          
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-[#3e2e6b]/60 bg-[#0d081e]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/originkit/hero-12/nav-logo.svg" alt="" className="size-[22px]" />
              <div>
                <h1 className="font-sans text-base font-semibold tracking-wider text-white">SmartFulfill AI</h1>
                <span className="text-[9px] uppercase tracking-widest text-[#c98bff] font-semibold block">Warehouse Command Center</span>
              </div>
            </div>

            {/* Tab sub-nav */}
            <nav className="hidden lg:flex items-center gap-1 bg-black/60 border border-[#2d234d] rounded-xl p-1 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
              {[
                { tabId: "overview", label: "Overview" },
                { tabId: "orders", label: "Orders" },
                { tabId: "inventory", label: "Inventory" },
                { tabId: "allocation", label: "Allocation" },
                { tabId: "picking", label: "Picking" },
                { tabId: "exceptions", label: "Exceptions" },
                { tabId: "analytics", label: "Analytics" },
                { tabId: "whatif", label: "What-If Simulator" },
              ].map(t => (
                <button
                  key={t.tabId}
                  onClick={() => setDashboardTab(t.tabId as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
                    dashboardTab === t.tabId 
                      ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.25)] scale-[1.02]' 
                      : 'text-white/60 hover:text-white hover:bg-white/10 font-medium'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setAiAssistantOpen(prev => !prev)}
                className="text-xs text-white/80 hover:text-[#c98bff] transition-colors cursor-pointer font-mono"
              >
                // AI Assistant
              </button>
              <button 
                onClick={() => setIsDashboardMode(false)}
                className="btn-classic-secondary rounded-lg px-4.5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                Leave Console
              </button>
            </div>
          </header>

          {/* Mobile Tab nav */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto bg-black/60 border-b border-[#2d234d]/60 p-2">
            {[
              { tabId: "overview", label: "Overview" },
              { tabId: "orders", label: "Orders" },
              { tabId: "inventory", label: "Inventory" },
              { tabId: "allocation", label: "Allocation" },
              { tabId: "picking", label: "Picking" },
              { tabId: "exceptions", label: "Exceptions" },
              { tabId: "analytics", label: "Analytics" },
              { tabId: "whatif", label: "What-If" },
            ].map(t => (
              <button
                key={t.tabId}
                onClick={() => setDashboardTab(t.tabId as any)}
                className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all cursor-pointer ${
                  dashboardTab === t.tabId ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <main className="p-6 md:p-10 mx-auto space-y-10 min-h-[calc(100vh-140px)] w-full max-w-[94vw] xl:max-w-[1800px]">
            
            {/* Overview Title / breadcrumb */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#3e2e6b]/60 pb-6">
              <div>
                <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold font-mono">Operations Console</span>
                <h2 className="font-instrument-serif text-3xl md:text-5xl text-white font-normal mt-1 capitalize">
                  {dashboardTab === 'whatif' ? 'What-If Simulator' : dashboardTab}
                </h2>
                {dashboardTab === 'overview' && (
                  <p className="text-xs text-white/50 mt-2 font-light">
                    Real-time intelligence across your warehouse operations.
                  </p>
                )}
              </div>
              <div className="text-xs text-white/90 bg-[#1b1238] border border-[#c98bff]/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_0_20px_rgba(201,139,255,0.12)]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono tracking-wide">Warehouse Zone A, B & C Online</span>
              </div>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {dashboardTab === 'overview' && (
              <div key="tab-overview" className="space-y-8 animate-tab-opening rounded-3xl">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                  {[
                    { label: "Active Orders", val: orders.filter(o => o.status !== "Dispatched").length, change: "+4 today", trendType: "success", alert: false },
                    { label: "Fulfillment Rate", val: `${kpis.fulfillmentRate}%`, change: "+1.2%", trendType: "success", alert: false },
                    { label: "Available Stock", val: `${kpis.availableInventory}%`, change: "Healthy", trendType: "success", alert: false },
                    { label: "Orders At Risk", val: orders.filter(o => o.status.includes("Shortage") || o.status.includes("exception") || o.status.includes("Delay")).length, change: "Critical", trendType: "error", alert: true },
                    { label: "Low Stock Items", val: inventory.filter(p => p.status !== "Healthy").length, change: "Action Req.", trendType: "error", alert: true },
                    { label: "Active Exceptions", val: exceptions.filter(e => !e.resolved).length, change: "Blocking", trendType: "error", alert: true }
                  ].map((k, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xl border bg-[#160f2e] p-6 transition-all duration-300 hover:border-[#c98bff]/40 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(201,139,255,0.12)] flex flex-col justify-between ${k.alert && k.val !== 0 && k.val !== "0" ? 'border-[#c98bff]/40 shadow-[0_0_15px_rgba(201,139,255,0.08)]' : 'border-[#3e2e6b]/60'}`}
                    >
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-medium block">{k.label}</span>
                      <span className="text-3xl font-extrabold font-mono mt-3 text-white tracking-tight">{k.val}</span>
                      <div className="mt-3 flex items-center">
                        <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                          k.trendType === 'success' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30' :
                          k.trendType === 'error' ? 'bg-red-950/50 text-red-300 border border-red-500/30' :
                          'bg-purple-950/50 text-[#c98bff] border border-purple-500/30'
                        }`}>
                          {k.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Action Engine Alert & Bottleneck alert */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* AI Decision Alert Box (Hero of the Overview - Level 3 depth) */}
                  <div className="lg:col-span-8 rounded-xl border border-[#c98bff]/40 bg-gradient-to-b from-[#1b1236] to-[#120b29] p-8 shadow-[0_0_35px_rgba(201,139,255,0.1)] relative overflow-hidden flex flex-col justify-between">
                    
                    {/* Ambient overlay glow */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_top_right,rgba(201,139,255,0.05),transparent_70%)] pointer-events-none" />
                    
                    <div className="absolute top-0 right-0 border-l border-b border-purple-500/30 bg-purple-950/50 px-4 py-1 text-[10px] font-bold text-[#c98bff] tracking-widest uppercase rounded-bl font-mono">
                      AI DECISION ENGINE
                    </div>

                    <div className="space-y-6">
                      {/* Section Header */}
                      <div>
                        <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-mono font-semibold">Priority Reallocation Recommendation</span>
                        <h3 className="text-2xl font-semibold mt-1 font-instrument-serif tracking-wide text-white">Inventory Allocation Conflict Solver</h3>
                        <p className="text-xs text-white/60 mt-1 font-light">Automated conflict solver detected an inventory shortage for Order #1024.</p>
                      </div>

                      {/* Information Grid (Required, Available, Shortage vs Score) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-y border-[#3e2e6b]/60">
                        
                        {/* Metrics breakdown */}
                        <div className="space-y-4">
                          <span className="text-[10px] text-white/50 uppercase tracking-wider font-mono block">Order #1024 Requirements (Urgent)</span>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#110a24] border border-[#3e2e6b]/60 rounded p-3 text-center">
                              <span className="text-[9px] text-white/50 uppercase block font-mono">Required</span>
                              <span className="text-base font-bold text-white font-mono block mt-1">10 u</span>
                            </div>
                            <div className="bg-[#110a24] border border-[#3e2e6b]/60 rounded p-3 text-center">
                              <span className="text-[9px] text-white/50 uppercase block font-mono">Available</span>
                              <span className="text-base font-bold text-[#c98bff] font-mono block mt-1">7 u</span>
                            </div>
                            <div className="bg-[#110a24] border border-red-500/40 bg-red-950/30 rounded p-3 text-center">
                              <span className="text-[9px] text-red-300 uppercase block font-mono">Shortage</span>
                              <span className="text-base font-bold text-red-400 font-mono block mt-1">3 u</span>
                            </div>
                          </div>
                        </div>

                        {/* Priority Score area */}
                        <div className="flex items-center justify-between bg-[#110a24] border border-[#3e2e6b]/60 rounded-xl p-4 md:px-6">
                          <div>
                            <span className="text-[9px] text-[#c98bff] uppercase tracking-widest font-mono font-semibold block">Priority Score</span>
                            <span className="text-4xl font-extrabold font-mono text-white mt-1 block">94</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 rounded px-2.5 py-1 uppercase font-mono block">HIGH CONFIDENCE</span>
                            <span className="text-[10px] text-white/50 block mt-1 font-mono">Confidence: 94.2%</span>
                          </div>
                        </div>

                      </div>

                      {/* Decision Flow Steps */}
                      <div className="py-2">
                        <span className="text-[10px] text-white/50 uppercase tracking-wider font-mono block mb-4">Decision Flow Lifecycle</span>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-2 relative">
                          
                          {/* Step 1 */}
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="h-7 w-7 rounded-full bg-red-950/50 border border-red-500/40 flex items-center justify-center text-[10px] text-red-300 font-mono">01</div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono block">DETECTED</span>
                              <span className="text-xs text-white font-medium">Inventory Conflict</span>
                            </div>
                          </div>
                          
                          <div className="hidden sm:block grow h-[1px] bg-[#3e2e6b] mx-2" />

                          {/* Step 2 */}
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="h-7 w-7 rounded-full bg-purple-950/50 border border-purple-500/40 flex items-center justify-center text-[10px] text-[#c98bff] font-mono">02</div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono block">ANALYZED</span>
                              <span className="text-xs text-white font-medium">Priority Score 94</span>
                            </div>
                          </div>

                          <div className="hidden sm:block grow h-[1px] bg-[#3e2e6b] mx-2" />

                          {/* Step 3 */}
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="h-7 w-7 rounded-full bg-purple-950/50 border border-purple-500/40 flex items-center justify-center text-[10px] text-[#c98bff] font-mono">03</div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono block">RECOMMENDED</span>
                              <span className="text-xs text-white font-medium">Allocate Stock</span>
                            </div>
                          </div>

                          <div className="hidden sm:block grow h-[1px] bg-[#3e2e6b] mx-2" />

                          {/* Step 4 */}
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="h-7 w-7 rounded-full bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-center text-[10px] text-emerald-300 font-mono">04</div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono block">READY</span>
                              <span className="text-xs text-white font-medium">Apply Decision</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Recommended Resolution Text */}
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-mono font-semibold block">RECOMMENDED RESOLUTION</span>
                          <p className="text-xs text-white/90 leading-relaxed font-light">
                            Allocate 7 available units to Order #1024, mark 3 units as pending and reserve incoming inventory for the shortage.
                          </p>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#110a24] border border-[#3e2e6b]/60 text-xs">
                          <span className="text-[#c98bff] font-mono mt-0.5">•</span>
                          <p className="text-white/80 leading-relaxed font-light">
                            <strong>Reallocation Action:</strong> Reallocate 5 units of Smart Sensor Hub from normal-priority Order #1028 (NovaLogistics) to satisfy immediate delivery needs.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Footer Action buttons */}
                    <div className="flex items-center justify-between border-t border-[#3e2e6b]/60 pt-6 mt-6">
                      <button 
                        onClick={() => setActiveReasoningId(activeReasoningId === 'kpi' ? null : 'kpi')}
                        className="text-xs font-semibold text-[#c98bff] hover:text-white underline cursor-pointer font-mono"
                      >
                        {activeReasoningId === 'kpi' ? 'Hide Reasoning' : 'View Reasoning'}
                      </button>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleApplyUrgentDecision}
                          disabled={orders.find(o => o.id === "1024")?.status === "Fully Allocated"}
                          className="btn-classic-primary rounded-lg px-6 py-2.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {orders.find(o => o.id === "1024")?.status === "Fully Allocated" ? "Applied" : "Apply Decision"}
                        </button>
                      </div>
                    </div>

                    {activeReasoningId === 'kpi' && (
                      <div className="mt-4 p-4 rounded-xl border border-purple-500/40 bg-[#190f33] text-xs text-white/90 leading-relaxed animate-slide-up">
                        <strong>AI Operational Reasoning:</strong> Reallocating from Order #1028 carries 0% risk of SLA breach because its shipping window is in 24 hours. Order #1024 must ship in 2 hours to meet the express carrier dispatch truck, protecting customer relations value and preventing delay penalties.
                      </div>
                    )}

                  </div>

                  {/* Bottleneck analysis (Level 2 depth) */}
                  <div className="lg:col-span-4 rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] p-8 shadow-[0_0_20px_rgba(0,0,0,0.25)] flex flex-col justify-between">
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] text-red-400 uppercase tracking-widest font-semibold block font-mono">✕ BOTTLENECK DETECTED</span>
                        <h3 className="text-xl font-semibold mt-1 font-instrument-serif tracking-wide text-white">Dispatch Processing Delay</h3>
                        <p className="text-xs text-white/50 mt-1 font-light">Fulfillment pipeline tracking reports queue loading backlogs.</p>
                      </div>

                      {/* Metric boxes */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#110a24] border border-[#3e2e6b]/60 rounded-xl p-4">
                          <span className="text-[9px] text-[#c98bff] uppercase block font-mono">DISPATCH</span>
                          <span className="text-2xl font-bold text-white font-mono block mt-1">14 min</span>
                          <span className="text-[9px] text-white/50 block mt-1 font-mono">Avg. duration</span>
                        </div>
                        <div className="bg-[#110a24] border border-red-500/30 bg-red-950/30 rounded-xl p-4">
                          <span className="text-[9px] text-red-400 uppercase block font-mono">BACKLOG</span>
                          <span className="text-2xl font-bold text-red-400 font-mono block mt-1">+55%</span>
                          <span className="text-[9px] text-red-300/70 block mt-1 font-mono">Above normal</span>
                        </div>
                      </div>

                      <div className="border-t border-[#3e2e6b]/60 pt-4 space-y-2">
                        <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-mono font-semibold block">RECOMMENDED RECOVERY ACTION</span>
                        <p className="text-xs text-white/80 leading-relaxed font-light">Reallocate one packaging team member to Dispatch Queue 02.</p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#3e2e6b]/60">
                      <button 
                        onClick={() => handlePrioritizeShipment("883")}
                        className="btn-classic-secondary w-full rounded-lg px-4 py-2.5 text-xs font-semibold cursor-pointer text-center"
                      >
                        Apply Rebalance
                      </button>
                    </div>

                  </div>
                </div>

                {/* Fulfillment workflow layout */}
                <div className="rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] p-8 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-instrument-serif text-white font-normal">Fulfillment Pipeline Processing Stages</h3>
                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Live Monitoring</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {[
                      { step: "Observe", color: "text-[#c98bff]", val: "128 Orders", label: "Pipeline queue" },
                      { step: "Priority check", color: "text-[#c98bff]", val: "20 Ranked", label: "Prioritized list" },
                      { step: "Inventory", color: "text-purple-400", val: "94% Allocated", label: "Bin checked" },
                      { step: "Picking", color: "text-violet-400", val: "3 Active Pickers", label: "Route optimizer" },
                      { step: "Packing", color: "text-emerald-400", val: "18 Queue", label: "Table workloads" },
                      { step: "Dispatch", color: "text-red-400", val: "4 Risk Alerts", label: "Delayed loading" }
                    ].map((step, idx) => (
                      <div key={idx} className="border border-[#3e2e6b]/50 bg-[#110a24] rounded-xl p-5 text-center transition-all duration-300 hover:border-[#c98bff]/40">
                        <span className={`text-[10px] uppercase font-mono font-semibold block ${step.color}`}>{step.step}</span>
                        <span className="text-xl font-bold text-white block mt-2 font-mono tracking-tight">{step.val}</span>
                        <span className={`text-[9px] font-mono block mt-1 ${step.color}`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ORDERS */}
            {dashboardTab === 'orders' && (
              <div key="tab-orders" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-tab-opening">
                
                {/* Left: Order List Table */}
                <div className="xl:col-span-8 space-y-6">
                  <div className="rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                    <div className="p-6 border-b border-[#3e2e6b]/60 flex justify-between items-center bg-[#110a24]">
                      <div>
                        <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-mono font-semibold block">Order Operations</span>
                        <h3 className="text-xl font-instrument-serif font-normal text-white mt-1">Order Queue</h3>
                        <p className="text-xs text-white/50 mt-0.5 font-light">Real-time priority allocations & dispatch recommended steps</p>
                      </div>
                      <span className="text-xs font-mono text-[#c98bff] bg-purple-950/50 border border-[#c98bff]/40 rounded-full px-4 py-1.5 shadow-[0_0_10px_rgba(201,139,255,0.12)]">
                        Active Queue: {orders.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#3e2e6b]/60 text-white/50 bg-[#110a24] uppercase tracking-widest font-mono text-[10px]">
                            <th className="p-4 font-normal">Order</th>
                            <th className="p-4 font-normal">Customer</th>
                            <th className="p-4 font-normal">Priority</th>
                            <th className="p-4 font-normal">Item (Qty)</th>
                            <th className="p-4 font-normal">SLA</th>
                            <th className="p-4 font-normal">Status</th>
                            <th className="p-4 font-normal text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3e2e6b]/50">
                          {orders.map((o) => (
                            <tr key={o.id} className="hover:bg-[#25184a]/50 transition-colors group">
                              <td className="p-4 font-semibold text-white font-mono">#{o.id}</td>
                              <td className="p-4 text-white/90 font-medium">{o.customer}</td>
                              <td className="p-4">
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                  o.priority === 'Urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                  o.priority === 'High' ? 'bg-purple-500/20 text-[#c98bff] border border-purple-500/30' :
                                  o.priority === 'Medium' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                  'bg-white/5 text-white/60 border border-white/10'
                                }`}>
                                  {o.priority}
                                </span>
                              </td>
                              <td className="p-4 text-white/90">
                                {o.item} <span className="font-mono text-white font-semibold">({o.qty})</span>
                              </td>
                              <td className="p-4 font-mono text-white/50 text-[11px]">{o.sla}</td>
                              <td className="p-4 text-white/90">
                                <span className="flex items-center gap-1.5">
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    o.status === 'Inventory Shortage' || o.status.includes('exception') ? 'bg-red-400' :
                                    o.status === 'Picking' || o.status === 'Packing' ? 'bg-indigo-400' :
                                    o.status === 'Dispatched' ? 'bg-emerald-400' : 'bg-purple-400 animate-pulse'
                                  }`} />
                                  <span className="text-[11px] truncate max-w-[140px]">{o.status}</span>
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {o.id === "1024" && o.status === "Inventory Shortage" ? (
                                  <button 
                                    onClick={handleApplyUrgentDecision}
                                    className="btn-classic-primary rounded px-3.5 py-1.5 text-[10px] font-bold cursor-pointer"
                                  >
                                    Apply
                                  </button>
                                ) : o.id === "1051" && o.status.includes("exception") ? (
                                  <button 
                                    onClick={handleResolveDamagedException}
                                    className="btn-classic-primary rounded px-3.5 py-1.5 text-[10px] font-bold cursor-pointer"
                                  >
                                    Resolve
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => showToast(`Triggered audit lookup for Order #${o.id}. Action: ${o.recommendation}`)}
                                    className="btn-classic-secondary rounded px-3.5 py-1.5 text-[10px] font-semibold cursor-pointer"
                                  >
                                    Audit
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right: Priorities sequencing */}
                <div className="xl:col-span-4 space-y-6">
                  <div className="rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] p-6">
                    <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block mb-1 font-mono">Priority Intelligence</span>
                    <h3 className="text-xl font-instrument-serif font-normal text-white mt-1">Priority Scoring</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed font-light">
                      Orders ranked automatically by SLA urgency, contract value, carrier timing, and stock availability.
                    </p>

                    <div className="mt-6 space-y-2">
                      {orders
                        .filter(o => o.status !== "Dispatched")
                        .sort((a,b) => b.score - a.score)
                        .slice(0, 8)
                        .map((o, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[#3e2e6b]/60 hover:border-[#c98bff]/40 hover:bg-[#25184a]/50 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[10px] text-white/50 w-5">{String(idx+1).padStart(2,'0')}</span>
                              <div>
                                <span className="font-mono text-xs font-semibold text-white">Order #{o.id}</span>
                                <span className="text-[10px] text-white/50 block leading-none mt-0.5">{o.customer}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#c98bff] font-bold bg-[#110a24] border border-[#c98bff]/30 rounded px-2 py-0.5 font-mono">{o.score}</span>
                              <span className={`text-[10px] font-semibold w-12 text-right ${
                                o.priority === "Urgent" ? 'text-red-400' : 
                                o.priority === "High" ? 'text-[#c98bff]' :
                                'text-white/50'
                              }`}>{o.priority}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: INVENTORY */}
            {dashboardTab === 'inventory' && (
              <div key="tab-inventory" className="space-y-8 animate-tab-opening">
                {/* Alert Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  
                  {/* LOW STOCK CARD */}
                  <div className="xl:col-span-2 rounded-xl border border-purple-500/30 bg-gradient-to-b from-[#1b1236] to-[#120b29] p-6 relative overflow-hidden shadow-[0_0_20px_rgba(201,139,255,0.08)]">
                    <span className="text-[10px] text-purple-400 font-semibold font-mono tracking-widest block">⚠ LOW STOCK WARNING</span>
                    <h3 className="text-xl font-instrument-serif font-normal text-white mt-1">Thermal Printer P204</h3>
                    
                    <div className="grid grid-cols-3 gap-4 my-5">
                      <div className="bg-[#110a24] border border-[#3e2e6b]/60 rounded-xl p-4 text-center">
                        <span className="text-[9px] text-white/50 uppercase block font-mono">Available</span>
                        <span className="text-xl font-bold text-[#c98bff] font-mono block mt-1">18</span>
                        <span className="text-[9px] text-white/50 font-mono">units</span>
                      </div>
                      <div className="bg-[#110a24] border border-[#3e2e6b]/60 rounded-xl p-4 text-center">
                        <span className="text-[9px] text-white/50 uppercase block font-mono">Reorder At</span>
                        <span className="text-xl font-bold text-white/90 font-mono block mt-1">25</span>
                        <span className="text-[9px] text-white/50 font-mono">units</span>
                      </div>
                      <div className="bg-[#110a24] border border-red-500/30 bg-red-950/30 rounded-xl p-4 text-center">
                        <span className="text-[9px] text-red-300 uppercase block font-mono">Deficit</span>
                        <span className="text-xl font-bold text-red-400 font-mono block mt-1">−7</span>
                        <span className="text-[9px] text-red-400/70 font-mono">units</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#3e2e6b]/60">
                      <span className="text-xs text-white/70">AI: <strong className="text-white">Reorder 50 units</strong></span>
                      <button 
                        onClick={() => handleCreateReorder("P204")}
                        disabled={inventory.find(p => p.id === "P204")!.total > 25}
                        className="btn-classic-primary rounded-lg text-xs font-semibold px-4 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {inventory.find(p => p.id === "P204")!.total > 25 ? "Reordered" : "Reorder Stock"}
                      </button>
                    </div>
                  </div>

                  {/* OUT OF STOCK CARD */}
                  <div className="xl:col-span-2 rounded-xl border border-red-500/40 bg-[#160f2e] p-6 relative overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.08)]">
                    <span className="text-[10px] text-red-400 font-semibold font-mono tracking-widest block">✕ STOCKOUT FAILURE</span>
                    <h3 className="text-xl font-instrument-serif font-normal text-white mt-1">RFID Scanner S311</h3>
                    
                    <div className="grid grid-cols-3 gap-4 my-5">
                      <div className="bg-[#110a24] border border-red-500/30 rounded-xl p-4 text-center">
                        <span className="text-[9px] text-red-300 uppercase block font-mono">Available</span>
                        <span className="text-xl font-bold text-red-400 font-mono block mt-1">0</span>
                        <span className="text-[9px] text-red-400/70 font-mono">units</span>
                      </div>
                      <div className="bg-[#110a24] border border-[#3e2e6b]/60 rounded-xl p-4 text-center">
                        <span className="text-[9px] text-white/50 uppercase block font-mono">Damaged</span>
                        <span className="text-xl font-bold text-white/90 font-mono block mt-1">2</span>
                        <span className="text-[9px] text-white/50 font-mono">units</span>
                      </div>
                      <div className="bg-[#110a24] border border-red-500/30 rounded-xl p-4 text-center">
                        <span className="text-[9px] text-red-300 uppercase block font-mono">Affected</span>
                        <span className="text-xl font-bold text-red-400 font-mono block mt-1">4</span>
                        <span className="text-[9px] text-red-400/70 font-mono">orders</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#3e2e6b]/60">
                      <span className="text-xs text-white/70">AI: <strong className="text-white">Check Warehouse B auxiliary</strong></span>
                      <button 
                        onClick={handleFindAlternativeStock}
                        disabled={inventory.find(p => p.id === "P311")!.available > 0}
                        className="btn-classic-primary rounded-lg text-xs font-semibold px-4 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {inventory.find(p => p.id === "P311")!.available > 0 ? "Transferred" : "Find Alt Stock"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inventory Stock Grid list */}
                <div className="rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] overflow-hidden shadow-[0_0_20px_rgba(201,139,255,0.05)]">
                  <div className="p-6 border-b border-[#3e2e6b]/60 bg-[#110a24] flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-mono font-semibold block">Stock Directory</span>
                      <h3 className="text-xl font-instrument-serif font-normal text-white mt-1">Active Stock Levels</h3>
                      <p className="text-xs text-white/50 mt-0.5 font-light">Bin levels, allocation ratios, and depletion warnings</p>
                    </div>
                    <span className="text-xs font-mono text-white/50">{inventory.length} SKUs tracked</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#3e2e6b]/60 text-white/50 bg-[#110a24] uppercase tracking-widest font-mono text-[10px]">
                          <th className="p-4 font-normal">SKU</th>
                          <th className="p-4 font-normal">Product</th>
                          <th className="p-4 font-normal">Total</th>
                          <th className="p-4 font-normal">Reserved</th>
                          <th className="p-4 font-normal">Available</th>
                          <th className="p-4 font-normal">Damaged</th>
                          <th className="p-4 font-normal">Threshold</th>
                          <th className="p-4 font-normal">Forecast</th>
                          <th className="p-4 font-normal text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3e2e6b]/40">
                        {inventory.map((p) => (
                          <tr key={p.id} className="hover:bg-[#25184a]/50 transition-colors">
                            <td className="p-4 font-mono font-semibold text-[#c98bff]">{p.id}</td>
                            <td className="p-4 text-white font-semibold">{p.name}</td>
                            <td className="p-4 font-mono text-white/90">{p.total}</td>
                            <td className="p-4 font-mono text-white/70">{p.reserved}</td>
                            <td className="p-4 font-mono font-semibold text-white">{p.available}</td>
                            <td className="p-4 font-mono text-red-300">{p.damaged}</td>
                            <td className="p-4 font-mono text-white/50">{p.reorderLevel}</td>
                            <td className="p-4">
                              {p.status === 'Out of Stock' ? (
                                <span className="text-[10px] text-red-300 font-semibold bg-red-950/50 px-2.5 py-1 rounded border border-red-500/40">Stockout</span>
                              ) : p.status === 'Low Stock' || p.daysRemaining === 1 ? (
                                <span className="text-[10px] text-[#c98bff] font-semibold bg-purple-950/50 px-2.5 py-1 rounded border border-purple-500/40">Low Stock</span>
                              ) : (
                                <span className="text-[10px] text-emerald-400 font-mono">Stable</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              {p.status !== 'Healthy' ? (
                                <button 
                                  onClick={() => handleCreateReorder(p.id)}
                                  className="btn-classic-primary rounded px-3 py-1 text-[10px] font-bold cursor-pointer"
                                >
                                  Procure
                                </button>
                              ) : (
                                <span className="text-white/40 text-[10px] font-mono">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ALLOCATION */}
            {dashboardTab === 'allocation' && (
              <div key="tab-allocation" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-tab-opening">
                
                {/* Allocation Calculator Form panel */}
                <div className="xl:col-span-8 rounded-xl border border-purple-500/40 bg-gradient-to-b from-[#1b1236] to-[#120b29] p-8 space-y-6 shadow-[0_0_35px_rgba(201,139,255,0.08)]">
                  <div>
                    <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block mb-1 font-mono">Smart Allocation</span>
                    <h3 className="text-2xl font-instrument-serif font-normal text-white">Multi-Warehouse Allocation Solver</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed font-light">
                      Calculate and apply optimal source allocations based on stock levels, shipping coordinates, and picker availability.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-[#3e2e6b]/60 bg-[#110a24] space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs pb-3 border-b border-[#3e2e6b]/60">
                      <span className="text-white/70">Allocation Query: <strong className="text-white">Order #1036 (RFID Scanners)</strong></span>
                      <span className="text-[#c98bff] font-semibold font-mono">Required: 10 units</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: "Warehouse A (Local Primary)", units: "3 units available", selected: false },
                        { name: "Warehouse B (Auxiliary Hub)", units: "8 units available", selected: true },
                        { name: "Warehouse C (Regional Center)", units: "15 units available", selected: false },
                      ].map((wh, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
                          wh.selected ? 'border-[#c98bff]/50 bg-purple-950/50' : 'border-[#3e2e6b]/60 bg-[#160f2e]'
                        }`}>
                          <span className="text-xs text-white/90">{wh.name}</span>
                          <span className={`font-mono text-xs font-semibold ${
                            wh.selected ? 'text-[#c98bff]' : 'text-white/50'
                          }`}>{wh.units}{wh.selected ? ' · Selected' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-5">
                    <span className="text-[10px] uppercase tracking-wider text-[#c98bff] font-semibold block font-mono">RECOMMENDED SOURCE PATH</span>
                    <p className="text-sm text-white/90 mt-2 leading-relaxed">
                      <strong>Allocate 8 units</strong> from Warehouse B and <strong>2 units</strong> from Warehouse A. 
                      This minimizes travel delay vectors, fulfills 100% of the SLA, and maintains safety thresholds at regional units.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#3e2e6b]/60">
                    <span className="text-xs text-white/50">Fulfillment speed: <strong className="text-emerald-400">97.8% optimal</strong></span>
                    <button 
                      onClick={() => {
                        handleExecuteStockTransfer()
                        showToast("Applied optimal multi-source allocation: 8 units from Warehouse B and 2 units from Warehouse A.")
                      }}
                      className="btn-classic-primary rounded-lg text-xs font-bold px-6 py-2.5 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    >
                      Apply Allocation
                    </button>
                  </div>
                </div>

                {/* Right allocation factor explanation */}
                <div className="xl:col-span-4 space-y-6">
                  <div className="rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] p-6 space-y-6">
                    <div>
                      <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block mb-1 font-mono">Solver Rationale</span>
                      <h3 className="text-xl font-instrument-serif font-normal text-white">Allocation Variables</h3>
                    </div>

                    <div className="space-y-4">
                      {[
                        { factor: "Proximity Distance", val: "Local zones weighted higher to prevent external carrier surcharge fees." },
                        { factor: "Zonal Workload", val: "Bypasses zones where pickers have >80% queue congestion." },
                        { factor: "Replenish Lead Time", val: "Calculates depletion rate of local zone before drafting safety stocks." }
                      ].map((f, i) => (
                        <div key={i} className="p-4 rounded-xl border border-[#3e2e6b]/60 bg-[#110a24] space-y-1">
                          <h4 className="text-xs font-semibold text-white">{f.factor}</h4>
                          <p className="text-[11px] text-white/50 leading-relaxed font-light">{f.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PICKING */}
            {dashboardTab === 'picking' && (
              <div key="tab-picking" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-tab-opening">
                
                {/* Left Route visualization */}
                <div className="lg:col-span-7 rounded-xl border border-purple-500/30 bg-[#160f2e] p-6 space-y-6 shadow-[0_0_20px_rgba(201,139,255,0.05)]">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block mb-1 font-mono">Picking Intelligence</span>
                      <h3 className="text-lg font-semibold text-white">Route Optimizer Pathing</h3>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-white/50">Travel saved: <strong className="text-emerald-400">38%</strong></span>
                    </div>
                  </div>

                  {/* Route Visual Drawing with boxes and lights */}
                  <div className="relative border border-[#3e2e6b]/60 bg-[#110a24] rounded-xl p-8 overflow-hidden min-h-[300px] flex flex-col justify-between">
                    
                    {/* Background glow lines */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,139,255,0.05)_0%,transparent_70%)] pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                      
                      {/* Step A */}
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-24 rounded border border-purple-500/30 bg-purple-950/40 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#c98bff]">START</span>
                          <span className="text-[8px] text-white/50 font-mono">Depot Entry</span>
                        </div>
                        <div className="h-6 w-[2px] bg-purple-500/30 md:hidden" />
                      </div>

                      {/* arrow */}
                      <span className="hidden md:block text-purple-400/50 font-mono text-sm">→</span>

                      {/* Step B */}
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-24 rounded border border-purple-500/40 bg-purple-950/40 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(201,139,255,0.15)]">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#c98bff]">SHELF A12</span>
                          <span className="text-[8px] text-white/50 font-mono">Qty: 2 // mouse</span>
                        </div>
                        <div className="h-6 w-[2px] bg-purple-500/30 md:hidden" />
                      </div>

                      {/* arrow */}
                      <span className="hidden md:block text-purple-400/50 font-mono text-sm">→</span>

                      {/* Step C */}
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-24 rounded border border-purple-500/40 bg-purple-950/40 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(201,139,255,0.15)]">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#c98bff]">SHELF B02</span>
                          <span className="text-[8px] text-white/50 font-mono">Qty: 5 // scanner</span>
                        </div>
                        <div className="h-6 w-[2px] bg-purple-500/30 md:hidden" />
                      </div>

                      {/* arrow */}
                      <span className="hidden md:block text-purple-400/50 font-mono text-sm">→</span>

                      {/* Step D */}
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-24 rounded border border-emerald-500/30 bg-emerald-950/30 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300">PACK STATION</span>
                          <span className="text-[8px] text-white/50 font-mono">Table 02</span>
                        </div>
                      </div>

                    </div>

                    <div className="border-t border-[#3e2e6b]/60 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-left text-xs space-y-1">
                        <p className="text-white/70">Travel path calculations: <strong className="text-white font-mono">87m</strong> reduced to <strong className="text-emerald-400 font-mono">54m</strong></p>
                        <p className="text-white/50 text-[10px]">Average pick speed optimization saves <strong>3.4 minutes</strong> per pass.</p>
                      </div>

                      {pickingStatus === 'routing' ? (
                        <div className="w-full sm:w-48 bg-[#2d234d] border border-[#3e2e6b]/60 rounded-full h-8 overflow-hidden relative flex items-center justify-center">
                          <div className="absolute top-0 left-0 bg-purple-500/40 h-full transition-all duration-300" style={{ width: `${pickingProgress}%` }} />
                          <span className="relative z-10 text-[10px] font-mono text-[#c98bff] font-semibold">PICKING PATH... {pickingProgress}%</span>
                        </div>
                      ) : pickingStatus === 'completed' ? (
                        <button 
                          onClick={handleStartPicking} 
                          className="rounded-lg border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 text-xs px-4 py-2 font-semibold cursor-pointer hover:bg-emerald-900/70 transition-all"
                        >
                          Pick Complete (Restart)
                        </button>
                      ) : (
                        <button 
                          onClick={handleStartPicking}
                          className="btn-classic-primary rounded-lg text-xs font-semibold px-5.5 py-2 cursor-pointer"
                        >
                          Start Optimized Pick
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Picker Workload List */}
                <div className="lg:col-span-5 rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] p-6 space-y-6">
                  <div>
                    <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block mb-2 font-mono">Picker Resource status</span>
                    <h3 className="text-sm font-semibold text-white">Active Picker Capacity</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed font-light">
                      Real-time pick task queues. Red warning signals indicate workload congestion above safety threshold.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {pickers.map((p, i) => (
                      <div key={i} className="p-4 rounded-lg border border-[#3e2e6b]/60 bg-[#110a24] space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white">{p.name}</span>
                          <span className="font-mono text-white/70">{p.tasks} active tasks</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="grow bg-[#2d234d] rounded-full h-2 overflow-hidden border border-[#3e2e6b]/60">
                            <div className={`h-full rounded-full transition-all duration-500 ${p.workload > 90 ? 'bg-red-500' : p.workload > 70 ? 'bg-[#c98bff]' : 'bg-indigo-400'}`} style={{ width: `${p.workload}%` }} />
                          </div>
                          <span className={`font-mono text-xs font-semibold ${p.workload > 90 ? 'text-red-400' : 'text-white'}`}>{p.workload}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pickers.find(p => p.id === "03")?.workload === 94 && (
                    <div className="rounded-xl border border-purple-500/40 bg-purple-950/40 p-4 space-y-3">
                      <span className="text-[10px] text-[#c98bff] uppercase tracking-widest block font-mono">ZONAL TASK ADJUSTMENT</span>
                      <p className="text-xs text-white/90 leading-relaxed font-light">
                        Picker 03 capacity is overloaded (94%). Shift 3 picking tasks to Picker 02 (48%) to secure order SLAs.
                      </p>
                      <button 
                        onClick={handleRebalanceWorkload}
                        className="btn-classic-secondary rounded-lg text-[10px] font-semibold px-3.5 py-1.5 cursor-pointer"
                      >
                        Apply Rebalance
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXCEPTIONS */}
            {dashboardTab === 'exceptions' && (
              <div key="tab-exceptions" className="space-y-8 animate-tab-opening">
                <div className="border-b border-[#3e2e6b]/60 pb-4">
                  <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block font-mono">Exception Center</span>
                  <h3 className="text-lg font-semibold text-white mt-1">Active Fulfillment Anomalies</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Resolve physical inventory or bin location errors detected during processing.
                  </p>
                </div>

                <div className="space-y-6">
                  {exceptions.map((exc) => (
                    <div 
                      key={exc.id} 
                      className={`rounded-xl border p-6 relative overflow-hidden transition-all ${exc.resolved ? 'border-[#3e2e6b]/60 bg-[#160f2e]/60 opacity-70' : 'border-purple-500/40 bg-[#160f2e] shadow-[0_0_20px_rgba(201,139,255,0.05)]'}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#3e2e6b]/60 pb-3 mb-4 gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-mono text-[#c98bff]">anomaly alert</span>
                          <h4 className="text-base font-semibold text-white mt-0.5">{exc.type}</h4>
                        </div>
                        <span className={`text-[10px] font-mono rounded px-2.5 py-0.5 ${exc.resolved ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40' : 'bg-red-950/50 text-red-300 border border-red-500/40'}`}>
                          {exc.resolved ? 'RESOLVED' : 'UNRESOLVED'}
                        </span>
                      </div>

                      <div className="space-y-3 my-4">
                        <div className="text-xs">
                          <span className="text-white/50 font-mono block">ANOMALY SUMMARY:</span>
                          <p className="text-white/90 font-semibold">{exc.details}</p>
                        </div>
                        <div className="text-xs">
                          <span className="text-[#c98bff] font-mono block">AI ACTION SUGGESTION:</span>
                          <p className="text-white/80 font-light mt-0.5">{exc.recommendation}</p>
                        </div>
                      </div>

                      {!exc.resolved && (
                        <div className="flex items-center justify-end border-t border-[#3e2e6b]/60 pt-4 mt-6">
                          {exc.id === "E1" ? (
                            <button 
                              onClick={handleResolveDamagedException}
                              className="btn-classic-primary rounded-lg text-xs font-semibold px-4 py-2 cursor-pointer"
                            >
                              Substitute Stock
                            </button>
                          ) : (
                            <button 
                              onClick={handleFindAlternativeStock}
                              className="btn-classic-primary rounded-lg text-xs font-semibold px-4 py-2 cursor-pointer"
                            >
                              Verify Alternative
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Dispatch Control section */}
                <div className="mt-12 border-t border-[#3e2e6b]/60 pt-8 space-y-6">
                  <div>
                    <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block font-mono">Dispatch Control</span>
                    <h3 className="text-lg font-semibold text-white mt-1">SLA At Risk Shipments</h3>
                    <p className="text-xs text-white/50 leading-relaxed font-light">
                      Active shipments with pending transport loading or gate bottlenecks.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {shipments.map((s) => (
                      <div 
                        key={s.id} 
                        className={`rounded-xl border p-6 relative overflow-hidden transition-all ${s.status === 'On Time' ? 'border-emerald-500/30 bg-[#160f2e] opacity-80' : 'border-red-500/40 bg-[#160f2e] shadow-[0_0_20px_rgba(239,68,68,0.05)]'}`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#3e2e6b]/60 pb-3 mb-4 gap-2">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-mono text-[#c98bff]">Dispatch Tracker</span>
                            <h4 className="text-sm font-semibold text-white mt-0.5">Shipment #{s.id} (Order #{s.orderId})</h4>
                          </div>
                          <span className={`text-[10px] font-mono rounded px-2.5 py-0.5 ${s.status === 'On Time' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40' : 'bg-red-950/50 text-red-300 border border-red-500/40'}`}>
                            {s.status}
                          </span>
                        </div>

                        <div className="space-y-3 my-4">
                          <div className="text-xs">
                            <span className="text-white/50 font-mono block">DELIVERY RISK EXPLANATION:</span>
                            <p className="text-white font-semibold">{s.reason}</p>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#c98bff] font-mono block">AI RECOMMENDED RECOVERY ACTION:</span>
                            <p className="text-white/80 font-light mt-0.5">{s.recommendation}</p>
                          </div>
                        </div>

                        {s.status === 'At Risk' && (
                          <div className="flex items-center justify-end border-t border-[#3e2e6b]/60 pt-4 mt-6">
                            <button 
                              onClick={() => handlePrioritizeShipment(s.id)}
                              className="btn-classic-primary rounded-lg text-xs font-semibold px-4 py-2 cursor-pointer"
                            >
                              Prioritize Shipment
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ANALYTICS */}
            {dashboardTab === 'analytics' && (
              <div key="tab-analytics" className="space-y-8 animate-tab-opening">
                {/* Visual process delay tracker */}
                <div className="rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] p-6 space-y-6">
                  <div>
                    <span className="text-[10px] text-red-400 uppercase tracking-widest font-semibold block mb-2 font-mono">✕ LIVE BOTTLENECK ANALYSIS</span>
                    <h3 className="text-base font-semibold text-white">Active Dispatch Phase Processing backlog</h3>
                  </div>

                  <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-6 rounded-xl border border-[#3e2e6b]/60 bg-[#110a24]">
                    <div className="space-y-4 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-semibold text-red-300 font-mono">DISPATCH DELAY</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        Shipment packing pipelines report queue backlogs. Express trucks scheduled for 14:00 delivery face risk thresholds.
                      </p>
                      <button 
                        onClick={() => handlePrioritizeShipment("883")}
                        className="btn-classic-secondary rounded-lg text-[10px] font-semibold px-3.5 py-1.5 cursor-pointer"
                      >
                        Rebalance Dispatch Teams
                      </button>
                    </div>

                    <div className="w-full max-w-md space-y-3">
                      {[
                        { stage: "Inventory Alloc", time: "2 min", width: "30%", color: "bg-purple-500/60" },
                        { stage: "Picking Path", time: "4 min", width: "45%", color: "bg-purple-500/60" },
                        { stage: "Packing Table", time: "3 min", width: "35%", color: "bg-purple-500/60" },
                        { stage: "Dispatch Bay", time: "14 min (Hold)", width: "95%", color: "bg-red-500/80 font-bold" }
                      ].map((bar, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-white/60">{bar.stage}</span>
                            <span className="text-white">{bar.time}</span>
                          </div>
                          <div className="bg-[#2d234d] rounded-full h-3 overflow-hidden border border-[#3e2e6b]/60">
                            <div className={`h-full rounded-full transition-all duration-1000 ${bar.color}`} style={{ width: bar.width }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* replenishment intelligence metrics */}
                <div className="rounded-xl border border-[#3e2e6b]/60 bg-[#160f2e] p-6 space-y-6">
                  <div>
                    <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block mb-2 font-mono">Replenishment Intelligence</span>
                    <h3 className="text-base font-semibold font-instrument-serif text-white">Suggested Reorders</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { item: "Wireless Mouse (Enterprise)", current: 42, dailyDemand: 14, daysLeft: 3, suggested: 50, id: "P201" },
                      { item: "Thermal Printer P204", current: 18, dailyDemand: 5, daysLeft: 3, suggested: 30, id: "P204" },
                      { item: "Smart Bluetooth Beacons", current: 20, dailyDemand: 15, daysLeft: 1, suggested: 40, id: "P106" }
                    ].map((rep, i) => (
                      <div key={i} className="rounded-xl border border-purple-500/30 bg-[#110a24] p-5 space-y-4">
                        <div className="flex justify-between items-start border-b border-[#3e2e6b]/60 pb-3">
                          <h4 className="text-xs font-semibold text-white leading-tight">{rep.item}</h4>
                          <span className="text-[9px] text-[#c98bff] bg-purple-950/50 border border-[#c98bff]/40 rounded px-1.5 font-mono">{rep.id}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                          <div>
                            <span className="text-white/50 block">Current stock:</span>
                            <span className="text-white font-bold">{rep.current} units</span>
                          </div>
                          <div>
                            <span className="text-white/50 block">Daily demand:</span>
                            <span className="text-white font-bold">{rep.dailyDemand} units</span>
                          </div>
                          <div>
                            <span className="text-white/50 block">Days remaining:</span>
                            <span className={`font-bold ${rep.daysLeft === 1 ? 'text-red-400 font-semibold' : 'text-[#c98bff]'}`}>{rep.daysLeft} days</span>
                          </div>
                          <div>
                            <span className="text-white/50 block">Suggested Reorder:</span>
                            <span className="text-[#c98bff] font-bold">{rep.suggested} units</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleCreateReorder(rep.id)}
                          className="btn-classic-secondary w-full rounded-lg text-[10px] font-semibold py-1.5 cursor-pointer"
                        >
                          Procure Reorder
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WHAT-IF SIMULATOR */}
            {dashboardTab === 'whatif' && (
              <div key="tab-whatif" className="space-y-8 animate-tab-opening">
                <div className="rounded-xl border border-purple-500/30 bg-[#160f2e] p-6 space-y-6 shadow-[0_0_20px_rgba(201,139,255,0.05)]">
                  <div>
                    <span className="text-[10px] text-[#c98bff] uppercase tracking-widest font-semibold block mb-1 font-mono">Simulation Sandbox</span>
                    <h3 className="text-lg font-semibold text-white">Warehouse Stress-Test What-If Engine</h3>
                    <p className="text-xs text-white/50 leading-relaxed font-light">
                      Simulate capacity shortages, labour deficits, and dispatch shipping delays to forecast order backlogs and discover AI mitigations.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] text-white/50 uppercase block font-mono">SELECT WHAT-IF SCENARIO:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'stock_decrease', label: 'Stock drops by 20 units' },
                        { id: 'labor_deficit', label: 'Labour shortage (-3 pickers)' },
                        { id: 'delay_shipment', label: 'Freight courier is delayed' }
                      ].map(sc => (
                        <button
                          key={sc.id}
                          onClick={() => handleWhatIfRun(sc.id)}
                          className={`rounded-lg border p-4 text-xs font-semibold text-left transition-all cursor-pointer ${
                            selectedWhatIf === sc.id ? 'border-[#c98bff] bg-purple-950/50 text-white shadow-[0_0_15px_rgba(201,139,255,0.2)]' : 'border-[#3e2e6b]/60 bg-[#110a24] text-white/80 hover:border-purple-500/40 hover:text-white'
                          }`}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {whatIfResults && (
                    <div className="mt-8 border border-purple-500/30 bg-[#110a24] rounded-xl p-6 space-y-5 animate-slide-up">
                      <div className="flex justify-between items-center border-b border-[#3e2e6b]/60 pb-3">
                        <span className="text-[10px] uppercase font-mono text-[#c98bff] tracking-wider">Estimated Simulation Forecast</span>
                        <span className="text-xs text-white/50 font-mono">Confidence: <strong className="text-emerald-400">{whatIfResults.confidence}%</strong></span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 text-center">
                        <div className="border-r border-[#3e2e6b]/60 p-3">
                          <span className="text-xs text-white/50 block">Forecasted Affected Orders</span>
                          <span className="text-3xl font-bold font-mono text-[#c98bff] block mt-1">{whatIfResults.affectedOrders}</span>
                        </div>
                        <div className="p-3">
                          <span className="text-xs text-white/50 block">Projected Delayed Shipments</span>
                          <span className="text-3xl font-bold font-mono text-red-400 block mt-1">{whatIfResults.delayedOrders}</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-purple-500/30 bg-purple-950/40 p-4">
                        <span className="text-[10px] text-[#c98bff] font-semibold tracking-wider block font-mono">AI MITIGATION ACTION</span>
                        <p className="text-xs text-white/90 mt-1 leading-relaxed font-light">{whatIfResults.actionText}</p>
                      </div>

                      <div className="flex items-center justify-end pt-3">
                        <button 
                          onClick={() => {
                            showToast(`Simulation Mitigation Applied: Executed dynamically generated workflow rebalancing steps.`)
                            setWhatIfResults(null)
                            setSelectedWhatIf('none')
                          }} 
                          className="btn-classic-primary rounded-lg text-xs font-semibold px-5.5 py-2 cursor-pointer"
                        >
                          Apply Mitigation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* ==========================================
          FLOATING AI ASSISTANT WIDGET
          ========================================== */}
      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Toggle button */}
        <button
          onClick={() => setAiAssistantOpen(prev => !prev)}
          className="h-12 w-12 rounded-full border border-purple-500/40 bg-purple-950/60 shadow-[0_0_25px_rgba(201,139,255,0.3)] backdrop-blur-md flex items-center justify-center text-xl text-purple-200 hover:text-white transition-all cursor-pointer hover:scale-105"
        >
          🤖
        </button>

        {/* Dialog panel */}
        {aiAssistantOpen && (
          <div className="absolute bottom-16 right-0 w-80 md:w-96 rounded-xl border border-purple-500/30 bg-[#160f2e] shadow-[0_0_35px_rgba(201,139,255,0.2)] flex flex-col overflow-hidden animate-slide-up">
            
            <div className="bg-purple-950/20 p-4 border-b border-[#2d234d]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#c98bff]">SmartFulfill AI Assistant</span>
              </div>
              <button onClick={() => setAiAssistantOpen(false)} className="text-white/60 hover:text-white text-sm">&times;</button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 h-72 overflow-y-auto space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-purple-900/30 border border-purple-500/20 text-white' 
                      : 'bg-black/40 border border-[#2d234d]/60 text-white'
                  }`}>
                    {msg.text}
                    {msg.list && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-[#2d234d]/60">
                        {msg.list.map((item, idx) => (
                          <div key={idx} className="text-[11px]">
                            <strong className="text-[#c98bff] block">{item.title}</strong>
                            <span className="text-white/60 mt-0.5 block leading-normal">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="p-3 border-t border-[#2d234d]/60 bg-black/40 flex flex-wrap gap-1.5">
              {[
                "Which orders are at risk?",
                "Why is Order #1024 delayed?",
                "Which products need replenishment?",
                "Where is the biggest bottleneck?"
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleAiAssistantQuery(prompt)}
                  className="text-[10px] text-white/60 hover:text-white bg-black/40 border border-[#2d234d] hover:border-purple-500/20 rounded-full px-2.5 py-1 text-left leading-normal cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Manual query input */}
            <div className="p-3 border-t border-[#2d234d]/60 bg-black/40 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask SmartFulfill AI..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                    handleAiAssistantQuery(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
                className="grow bg-black/40 border border-[#2d234d] text-xs text-white rounded px-3 py-1.5 focus:outline-none focus:border-purple-500/40"
              />
            </div>

          </div>
        )}
      </div>

    </div>
  )
}

export default App
