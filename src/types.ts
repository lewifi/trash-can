export interface DeadProject {
  id: string;
  name: string;
  description: string;
  category: "saas" | "web3" | "mobile" | "ai" | "hardware" | "game" | "dev_tool" | "other";
  causeOfDeath: string;
  emotionalTragedy: number; // 1 to 10
  techStack: string;
  artifactIcon: string;
  likes: number;
  flowers: number;
  creator: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  aiAppraisal?: string;
  diagnosticScore?: number;
  isPrivate?: boolean;
  roomName?: string;
  imageUrl?: string;
}

export interface AppraisalResult {
  score: number;
  appraisal: string;
  postMortem: string;
  recyclingPlan: string;
}
