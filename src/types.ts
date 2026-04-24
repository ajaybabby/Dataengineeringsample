export type PipelineStage = "SOURCE" | "INGESTION" | "PROCESSING" | "STORAGE" | "VISUALIZATION";

export interface DataRecord {
  id: number;
  user_id: number;
  amount: string | number;
  timestamp: string;
  category: string;
  status?: string;
}

export interface PipelineState {
  currentStage: PipelineStage;
  data: DataRecord[];
  isProcessing: boolean;
  logs: string[];
}
