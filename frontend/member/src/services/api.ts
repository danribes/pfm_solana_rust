// API Client Service for Backend Integration
// Task 5.1.1 Sub-task 2: Backend API Integration

import {
  ApiRequestConfig,
  ApiResponse,
  ApiError,
  IntegrationError,
  ErrorRecoveryStrategy,
} from "../types/integration";

export class ApiClient {
  private config: ApiRequestConfig;
  private recoveryStrategy: ErrorRecoveryStrategy;
  private activeRequests: Map<string, AbortController> = new Map();
  private metrics = {
    requestCount: 0,
    successCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
  };

  constructor(config: Partial<ApiRequestConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      ...config,
    };

    this.recoveryStrategy = {
      maxRetries: this.config.retryAttempts,
      backoffMultiplier: 2,
      initialDelay: this.config.retryDelay,
      maxDelay: 30000,
      retryableErrors: ["NETWORK_ERROR", "TIMEOUT", "RATE_LIMIT", "SERVER_ERROR"],
    };
  }

  /**
   * Make API request with error handling and retries
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    requestId?: string
  ): Promise<ApiResponse<T>> {
    const id = requestId || this.generateRequestId();
    const startTime = Date.now();
    
    this.metrics.requestCount++;

    try {
      const response = await this.executeRequest(endpoint, options, id);
      const responseTime = Date.now() - startTime;
      
      this.updateMetrics(responseTime, true);
      
      return {
        success: true,
        data: response,
        timestamp: Date.now(),
        requestId: id,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, false);
      
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        requestId: id,
      };
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseURL);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    return this.request<T>(url.toString(), {
      method: "GET",
      headers: this.config.headers,
    });
  }

  /**
   * POST request
   */
  public async post<T = any>(
    endpoint: string, 
    data?: any, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      headers: this.config.headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    endpoint: string, 
    data?: any, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      headers: this.config.headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers: this.config.headers,
      ...options,
    });
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest(
    endpoint: string,
    options: RequestInit,
    requestId: string,
    attempt: number = 1
  ): Promise<any> {
    const controller = new AbortController();
    this.activeRequests.set(requestId, controller);

    try {
      const url = endpoint.startsWith("http") ? endpoint : `${this.config.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
      });

      this.activeRequests.delete(requestId);

      if (!response.ok) {
        throw await this.createApiError(response, attempt);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      this.activeRequests.delete(requestId);

      // Handle timeout
      if (error.name === "AbortError") {
        throw this.createIntegrationError("TIMEOUT", "Request timeout", true);
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw this.createIntegrationError("NETWORK_ERROR", "Network error", true);
      }

      // Retry logic for recoverable errors
      if (this.shouldRetry(error, attempt)) {
        const delay = this.calculateRetryDelay(attempt);
        await this.sleep(delay);
        return this.executeRequest(endpoint, options, requestId, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Create API error from response
   */
  private async createApiError(response: Response, attempt: number): Promise<ApiError> {
    let errorData: any = {};
    
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }

    const retryable = this.isRetryableStatusCode(response.status);

    return {
      code: `HTTP_${response.status}`,
      message: errorData.message || `Request failed with status ${response.status}`,
      details: {
        status: response.status,
        statusText: response.statusText,
        attempt,
        ...errorData,
      },
      retryable,
    };
  }

  /**
   * Create integration error
   */
  private createIntegrationError(
    code: string, 
    message: string, 
    recoverable: boolean
  ): IntegrationError {
    return {
      type: "api",
      code,
      message,
      recoverable,
      retryAfter: recoverable ? this.config.retryDelay : undefined,
    } as IntegrationError;
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.recoveryStrategy.maxRetries) {
      return false;
    }

    if (error.retryable !== undefined) {
      return error.retryable;
    }

    return this.recoveryStrategy.retryableErrors.some(retryableError =>
      error.code?.includes(retryableError) || error.message?.includes(retryableError)
    );
  }

  /**
   * Check if HTTP status code is retryable
   */
  private isRetryableStatusCode(status: number): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(status);
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const delay = this.recoveryStrategy.initialDelay * 
      Math.pow(this.recoveryStrategy.backoffMultiplier, attempt - 1);
    
    return Math.min(delay, this.recoveryStrategy.maxDelay);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update metrics
   */
  private updateMetrics(responseTime: number, success: boolean): void {
    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    // Calculate rolling average response time
    const totalRequests = this.metrics.successCount + this.metrics.errorCount;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  /**
   * Cancel request
   */
  public cancelRequest(requestId: string): void {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Cancel all active requests
   */
  public cancelAllRequests(): void {
    for (const [requestId, controller] of this.activeRequests) {
      controller.abort();
    }
    this.activeRequests.clear();
  }

  /**
   * Get API metrics
   */
  public getMetrics() {
    return {
      ...this.metrics,
      activeRequests: this.activeRequests.size,
      successRate: this.metrics.requestCount > 0 
        ? this.metrics.successCount / this.metrics.requestCount 
        : 0,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ApiRequestConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): ApiRequestConfig {
    return { ...this.config };
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

export default ApiClient;
