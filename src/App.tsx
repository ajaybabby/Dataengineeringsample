import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, 
  CloudDownload, 
  Settings, 
  Server, 
  BarChart3, 
  Play, 
  RotateCcw, 
  Terminal, 
  Code2, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { PipelineStage, DataRecord } from "./types";
import { cn } from "./lib/utils";

const STAGES: { id: PipelineStage; label: string; icon: any; color: string }[] = [
  { id: "SOURCE", label: "Source", icon: Database, color: "text-blue-500" },
  { id: "INGESTION", label: "Ingestion", icon: CloudDownload, color: "text-amber-500" },
  { id: "PROCESSING", label: "Processing", icon: Settings, color: "text-purple-500" },
  { id: "STORAGE", label: "Storage", icon: Server, color: "text-emerald-500" },
  { id: "VISUALIZATION", label: "Insights", icon: BarChart3, color: "text-pink-500" },
];

const CODE_SNIPPETS = {
  SOURCE: `# Mock External API Source\nimport requests\n\ndef fetch_raw_data():\n    response = requests.get("https://api.example.com/events")\n    return response.json()`,
  INGESTION: `# Spark Ingestion Pipeline\nfrom pyspark.sql import SparkSession\n\nspark = SparkSession.builder.appName("Ingest").getOrCreate()\ndf = spark.read.json("s3://landing-zone/events/*.json")\ndf.write.mode("overwrite").parquet("s3://raw-zone/events/")`,
  PROCESSING: `# Data Cleaning and Transformation\nfrom pyspark.sql import functions as F\n\ndf_clean = df.filter(F.col("amount") > 0) \\\n    .withColumn("date", F.to_date("timestamp")) \\\n    .groupBy("category", "date") \\\n    .agg(F.sum("amount").alias("total_sales"))`,
  STORAGE: `-- SQL Storage in Data Warehouse\nINSERT INTO dw.sales_summary\nSELECT category, date, total_sales\nFROM processed_stream\nON CONFLICT (category, date) \nDO UPDATE SET total_sales = EXCLUDED.total_sales;`,
  VISUALIZATION: `// React + Recharts Serving\nconst fetchInsights = async () => {\n  const res = await fetch("/api/serving");\n  return await res.json();\n};`
};

export default function App() {
  const [activeStage, setActiveStage] = useState<PipelineStage>("SOURCE");
  const [progressStage, setProgressStage] = useState<PipelineStage | null>(null);
  const [data, setData] = useState<DataRecord[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Pipeline initialized and ready."]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    
    // 1. Source
    setProgressStage("SOURCE");
    addLog("Connecting to external source...");
    const rawRes = await fetch("/api/source");
    const rawData = await rawRes.json();
    setData(rawData);
    addLog(`Fetched ${rawData.length} raw records from source.`);
    await new Promise(r => setTimeout(r, 1000));

    // 2. Ingestion
    setProgressStage("INGESTION");
    addLog("Ingesting data into landing zone...");
    addLog("Converting JSON to Parquet format for optimized storage...");
    await new Promise(r => setTimeout(r, 1200));

    // 3. Processing
    setProgressStage("PROCESSING");
    addLog("Initializing PySpark session...");
    addLog("Filtering invalid amounts and aggregating by category...");
    const processed = rawData.map((item: any) => ({
      ...item,
      amount: parseFloat(item.amount),
      is_processed: true
    }));
    await new Promise(r => setTimeout(r, 1500));

    // 4. Storage
    setProgressStage("STORAGE");
    addLog("Writing to Data Warehouse (PostgreSQL)...");
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(processed)
    });
    addLog("Storage complete. Indexing tables.");
    await new Promise(r => setTimeout(r, 1000));

    // 5. Serving/Viz
    setProgressStage("VISUALIZATION");
    addLog("Refreshing serving layer...");
    const servingRes = await fetch("/api/serving");
    const finalized = await servingRes.json();
    setProcessedData(finalized);
    addLog("Pipeline run completed successfully. Visualization updated.");
    
    setIsRunning(false);
    setProgressStage(null);
    setActiveStage("VISUALIZATION");
  };

  const getAggregatedData = () => {
    const map: any = {};
    processedData.forEach(item => {
      map[item.category] = (map[item.category] || 0) + item.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Server size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-800">DataFlow</h1>
            <p className="text-xs text-slate-500 font-medium">DE Learning Playground</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setData([]);
              setProcessedData([]);
              setActiveStage("SOURCE");
              addLog("Sandbox reset.");
            }}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
          <button 
            onClick={runPipeline}
            disabled={isRunning}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all",
              isRunning ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-lg active:scale-95"
            )}
          >
            {isRunning ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent animate-spin rounded-full" /> : <Play size={16} />}
            {isRunning ? "Running Pipeline..." : "Execute Pipeline"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Pipeline & Logs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Pipeline Visualizer */}
          <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings size={18} className="text-indigo-500" />
                Pipeline Orchestrator
              </h2>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <span>Direct Acyclic Graph (DAG)</span>
              </div>
            </div>
            
            <div className="relative flex justify-between items-center px-4">
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isActive = activeStage === stage.id;
                const isProgress = progressStage === stage.id;
                
                return (
                  <React.Fragment key={stage.id}>
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <button
                        onClick={() => setActiveStage(stage.id)}
                        className={cn(
                          "w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300",
                          isActive ? "border-indigo-500 bg-indigo-50 text-indigo-600 shadow-xl shadow-indigo-100" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200",
                          isProgress && "animate-pulse border-amber-500 bg-amber-50"
                        )}
                      >
                        <Icon size={28} />
                        {isProgress && (
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center animate-bounce">
                              <AlertCircle size={10} className="text-white" />
                           </div>
                        )}
                      </button>
                      <span className={cn("text-xs font-bold", isActive ? "text-slate-800" : "text-slate-400")}>{stage.label}</span>
                    </div>
                    {idx < STAGES.length - 1 && (
                      <div className="flex-1 h-0.5 bg-slate-100 relative overflow-hidden">
                        {(isRunning || processedData.length > 0) && (
                          <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute inset-0 bg-indigo-200"
                          />
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Dynamic Content Area */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col min-h-[400px]">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", STAGES.find(s => s.id === activeStage)?.color.replace('text', 'bg'))} />
                <h3 className="font-bold text-slate-700">{activeStage} VIEW</h3>
              </div>
              <div className="flex gap-2">
                <button className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-md text-slate-600">Sample Data</button>
                <button 
                  onClick={() => setActiveStage(activeStage)} // Just refresh
                  className="text-xs font-bold px-3 py-1 bg-indigo-600 text-white rounded-md"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="p-6 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  {activeStage === "VISUALIZATION" ? (
                    processedData.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <div className="bg-slate-50 p-4 rounded-xl">
                          <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Revenue by Category</h4>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getAggregatedData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl">
                           <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Distribution</h4>
                           <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getAggregatedData()}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {getAggregatedData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#fbbf24', '#a855f7', '#ec4899'][index % 4]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                        <BarChart3 size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">No data in serving layer yet.</p>
                        <p className="text-sm">Run the pipeline to see insights.</p>
                      </div>
                    )
                  ) : (
                    <div className="overflow-auto border border-slate-100 rounded-xl max-h-[350px]">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">ID</th>
                            <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Timestamp</th>
                            <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Category</th>
                            <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Amount</th>
                            <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(activeStage === "SOURCE" || activeStage === "INGESTION" ? data : processedData).slice(0, 10).map((row, i) => (
                            <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 font-mono text-slate-400">#{(row as any).id}</td>
                              <td className="p-3 text-slate-600">{new Date((row as any).timestamp).toLocaleDateString()}</td>
                              <td className="p-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                                  (row as any).category === 'Electronics' ? 'bg-blue-100 text-blue-700' :
                                  (row as any).category === 'Clothing' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-700'
                                )}>
                                  {(row as any).category}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-slate-800">${(row as any).amount}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                  <CheckCircle2 size={12} />
                                  Synced
                                </div>
                              </td>
                            </tr>
                          ))}
                          {data.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-10 text-center text-slate-400 italic">No data records present. Execute pipeline to fetch.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Logs Terminal */}
          <section className="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <Terminal size={14} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Orchestration Logs</h3>
            </div>
            <div className="font-mono text-[11px] space-y-1 h-32 overflow-y-auto custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="text-slate-300">
                  <span className="text-slate-600">[{i}]</span> {log}
                </div>
              ))}
              {logs.length === 0 && <div className="text-slate-700">Waiting for execution...</div>}
            </div>
          </section>
        </div>

        {/* Right Col: Knowledge Base */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Code2 size={18} className="text-indigo-500" />
                Code Implementation
              </h3>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
                PYTHON / SQL
              </div>
            </div>
            <div className="p-0">
               <div className="bg-[#1e1e1e] p-5 font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto">
                 <pre>{CODE_SNIPPETS[activeStage]}</pre>
               </div>
               <div className="p-5 space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">What's happening here?</h4>
                 <div className="space-y-3">
                   {activeStage === "SOURCE" && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Connecting to <strong>External APIs</strong> or <strong>Databases</strong>. In a real environment, you'd use libraries like <code className="bg-slate-100 px-1 rounded">requests</code> or database connectors.
                    </p>
                   )}
                   {activeStage === "INGESTION" && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Raw data is landed in an <strong>Unstructured Storage</strong> (like S3). We often convert it to columnar formats like <strong>Parquet</strong> for 10x faster query speeds.
                    </p>
                   )}
                   {activeStage === "PROCESSING" && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Using <strong>Apache Spark</strong> (a distributed computing engine) to handle massive datasets. We clean, filter, and aggregate the "dirty" landing data.
                    </p>
                   )}
                   {activeStage === "STORAGE" && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      The "Gold" data is written to a <strong>Data Warehouse</strong> (Postgres, Snowflake, BigQuery) where analysts can query it using standard <strong>SQL</strong>.
                    </p>
                   )}
                   {activeStage === "VISUALIZATION" && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      The finalized data is served via an <strong>API</strong> to frontend dashboards. Data Engineering ensures this data is reliable, fresh, and consistent.
                    </p>
                   )}
                 </div>
               </div>
            </div>
          </section>

          <section className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Career Tip
            </h3>
            <p className="text-sm text-indigo-100 leading-relaxed mb-4">
              Data Engineering is about <strong>Reliability</strong>. It's not just moving data, it's building "plumbing" that never leaks.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold bg-indigo-500/50 p-2 rounded-lg border border-white/10">
                <ChevronRight size={14} /> Focus on SQL & Python
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold bg-indigo-500/50 p-2 rounded-lg border border-white/10">
                <ChevronRight size={14} /> Learn Cloud Architectures
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold bg-indigo-500/50 p-2 rounded-lg border border-white/10">
                <ChevronRight size={14} /> Mastering DAGs (Airflow)
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
