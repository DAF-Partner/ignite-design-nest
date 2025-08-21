// Placeholder implementations for DotNet API adapters
import { 
  type ICaseIntakesApi, 
  type IAdminConfigApi, 
  ApiError 
} from '../interfaces';
import type {
  CaseIntake,
  CreateCaseIntakeRequest,
  AcceptanceReview,
  ServiceLevel,
  DebtStatus,
  LawfulBasis,
  PaginatedResponse,
  ApiResponse
} from '@/types';

export class DotNetCaseIntakesApi implements ICaseIntakesApi {
  constructor(private http: any) {}

  async getCaseIntakes(): Promise<PaginatedResponse<CaseIntake>> {
    throw new ApiError(501, 'Not implemented');
  }

  async getCaseIntake(): Promise<ApiResponse<CaseIntake>> {
    throw new ApiError(501, 'Not implemented');
  }

  async createCaseIntake(): Promise<ApiResponse<CaseIntake>> {
    throw new ApiError(501, 'Not implemented');
  }

  async updateCaseIntake(): Promise<ApiResponse<CaseIntake>> {
    throw new ApiError(501, 'Not implemented');
  }

  async deleteCaseIntake(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }

  async submitForReview(): Promise<ApiResponse<CaseIntake>> {
    throw new ApiError(501, 'Not implemented');
  }

  async reviewCaseIntake(): Promise<ApiResponse<CaseIntake>> {
    throw new ApiError(501, 'Not implemented');
  }

  async getCaseIntakeMessages(): Promise<ApiResponse<any[]>> {
    throw new ApiError(501, 'Not implemented');
  }

  async addCaseIntakeMessage(): Promise<ApiResponse<any>> {
    throw new ApiError(501, 'Not implemented');
  }
}

export class DotNetAdminConfigApi implements IAdminConfigApi {
  constructor(private http: any) {}

  // Service Levels
  async getServiceLevels(): Promise<ApiResponse<ServiceLevel[]>> {
    throw new ApiError(501, 'Not implemented');
  }

  async createServiceLevel(): Promise<ApiResponse<ServiceLevel>> {
    throw new ApiError(501, 'Not implemented');
  }

  async updateServiceLevel(): Promise<ApiResponse<ServiceLevel>> {
    throw new ApiError(501, 'Not implemented');
  }

  async deleteServiceLevel(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }

  // Debt Statuses
  async getDebtStatuses(): Promise<ApiResponse<DebtStatus[]>> {
    throw new ApiError(501, 'Not implemented');
  }

  async createDebtStatus(): Promise<ApiResponse<DebtStatus>> {
    throw new ApiError(501, 'Not implemented');
  }

  async updateDebtStatus(): Promise<ApiResponse<DebtStatus>> {
    throw new ApiError(501, 'Not implemented');
  }

  async deleteDebtStatus(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }

  // Lawful Bases
  async getLawfulBases(): Promise<ApiResponse<LawfulBasis[]>> {
    throw new ApiError(501, 'Not implemented');
  }

  async createLawfulBasis(): Promise<ApiResponse<LawfulBasis>> {
    throw new ApiError(501, 'Not implemented');
  }

  async updateLawfulBasis(): Promise<ApiResponse<LawfulBasis>> {
    throw new ApiError(501, 'Not implemented');
  }

  async deleteLawfulBasis(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
}