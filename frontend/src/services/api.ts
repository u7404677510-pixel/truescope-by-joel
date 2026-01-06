import type { Metier, Demande, Intervention, AnalyseResponse, Solution } from '../types';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  details?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.details || 'Erreur API');
  }

  return data as T;
}

// Helper pour convertir un fichier en base64
async function fileToBase64(file: File): Promise<{ data: string; mimeType: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Demandes
export async function createDemandeWithFiles(
  metier: Metier,
  description: string,
  files: File[] = []
): Promise<AnalyseResponse> {
  const mediaFiles = await Promise.all(
    files.map(file => fileToBase64(file))
  );

  const response = await fetchApi<ApiResponse<AnalyseResponse>>('/demandes', {
    method: 'POST',
    body: JSON.stringify({ metier, description, mediaFiles }),
  });
  return response.data;
}

export async function getDemandes(params?: {
  status?: Demande['status'];
  metier?: Metier;
  limit?: number;
}): Promise<Demande[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.metier) searchParams.set('metier', params.metier);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const query = searchParams.toString();
  const response = await fetchApi<ApiResponse<Demande[]>>(
    `/demandes${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function getDemandeById(id: string): Promise<Demande> {
  const response = await fetchApi<ApiResponse<Demande>>(`/demandes/${id}`);
  return response.data;
}

export async function validateDemande(
  id: string,
  solutionFinale: Solution,
  problemType: string,
  keywords?: string[]
): Promise<Intervention> {
  const response = await fetchApi<ApiResponse<Intervention>>(`/demandes/${id}/validate`, {
    method: 'POST',
    body: JSON.stringify({ solutionFinale, problemType, keywords }),
  });
  return response.data;
}

export async function reanalyzeDemande(id: string): Promise<AnalyseResponse> {
  const response = await fetchApi<ApiResponse<AnalyseResponse>>(`/demandes/${id}/reanalyze`, {
    method: 'POST',
  });
  return response.data;
}

export async function getProblemType(id: string): Promise<string> {
  const response = await fetchApi<ApiResponse<{ problemType: string }>>(`/demandes/${id}/problem-type`);
  return response.data.problemType;
}

// Interventions
export async function getInterventions(metier?: Metier): Promise<Intervention[]> {
  const query = metier ? `?metier=${metier}` : '';
  const response = await fetchApi<ApiResponse<Intervention[]>>(`/interventions${query}`);
  return response.data;
}
