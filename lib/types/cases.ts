export type CasesStackParamList = {
  MyCasesList: undefined;
  CaseDetail: { caseId: string };
  CaseDocuments: { caseId: string };
  CaseChat: { caseId: string };
  AISummary: { caseId: string };
  DetailedAnalysis: { caseId: string };
  ScheduleConsult: { caseId: string; analysis?: any };
  NewCase: undefined;
  SubmitReview: { caseId: string, contractId?: string };
  CaseProgress: { caseId: string };
  VideoConsultation: { roomUrl: string; token: string };
}; 

export type Case = {
  // ... existing code ...
}; 