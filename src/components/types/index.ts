// types/index.ts - All interface definitions

export interface District { 
  DistrictId: number; 
  DistrictName: string;
}

export interface Block { 
  BlockId: number; 
  BlockName: string; 
  Id: number; 
  DistrictId: number;
}

export interface GramPanchayat { 
  Id: number; 
  GramPanchayatName: string; 
  BlockId: number;
}

export interface Village { 
  Id: number; 
  GramPanchayatId: number; 
  VillageName: string; 
  VillageId?: number;
}

export interface BeneficiaryData { 
  BeneficiaryId: number; 
  BeneficiaryName: string; 
  VillageId: number; 
  VillageName: string; 
  Status: string | number; 
  FamilyMembers?: any; 
  FamilyCount?: any; 
  familyCount?: any; 
  DistrictName?: string; 
  BlockName?: string; 
  GrampanchayatName?: string;
  FatherHusbandName?: string;
}

export interface OHTData { 
  OhtId: number; 
  Districtname: string; 
  BlockName: string; 
  GramPanchayatName: string; 
  VillageName: string; 
  OHTCapacity: number; 
  NoOfPumps: number;
  Status?: number;
}

export interface PumpHouseData { 
  PumpId: number; 
  OhtId: number; 
  OperatorName: string; 
  Contact: string; 
  HorsePower: string; 
  PowerSource: string; 
  Status: number; 
  SolarOutput: number;
}

export interface WaterQualityData {
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  Year: number;
  Month: number;
  TotalSamplesCollected: number;
  TotalSamplesContaminated: number;
  VillagesTestedNames: string;
  VillagesTestedCount: number;
  ContaminatedVillagesNames: string;
  ContaminatedVillagesCount: number;
}

export interface ComplaintData {
  ComplaintID: number;
  District: string;
  DistrictId: number;
  Block: string;
  BlockId: number;
  GramPanchayat: string;
  GramPanchayatId: number;
  Village: string;
  VillageId: number;
  BeneficiaryName: string;
  Contact: string;
  Landmark: string;
  Category: string;
  CategoryId: number;
  OtherCategory: string;
  Status: number; // 0 = Pending, 1 = Resolved, 2 = Closed
  ComplaintDetails: string;
}

export interface WaterFeeSummaryData {
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  Year: number;
  Month: number;
  BaseFee: number;
  PreviousBalance: number;
  OutstandingAmount: number;
  PaidAmount: number;
}

export interface LocationStats { 
  totalBeneficiaries: number; 
  activeBeneficiaries: number; 
  totalFamilyMembers: number; 
  totalOHTs: number; 
  totalOHTCapacity: number; 
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  totalPumps: number; 
  activePumps: number; 
  solarPumps: number;
  totalBaseFee: number;
  totalPreviousBalance: number;
  totalOutstanding: number;
  totalPaidAmount: number;
  collectionEfficiency: number;
}

// Tab type definition
export type TabType = 'overview' | 'beneficiaries' | 'infrastructure' | 'finance' | 'quality' | 'complaints';

// Chart data types
export interface BeneficiaryTrendData {
  month: string;
  total: number;
  active: number;
}

export interface PumpStatusData {
  name: string;
  value: number;
  color: string;
}

export interface FeeCollectionTrendData {
  month: string;
  baseFee: number;
  outstanding: number;
  collected: number;
}