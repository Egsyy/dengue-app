export interface ProblemDetails {
  type?: string; // A URI reference that identifies the problem type.
  title?: string; // A short, human-readable summary of the problem type.
  status?: number; // The HTTP status code (e.g., 400, 404, 500) for this occurrence.
  detail?: string; // A human-readable explanation specific to this occurrence.
  instance?: string; // A URI reference that identifies the specific occurrence of the problem.
  extensions?: Record<string, any>; // Additional custom properties.
}

export class ProblemDetailsError extends Error {
  constructor(public problem: ProblemDetails) {
    super(problem.title ?? "Server Error");
  }
}
