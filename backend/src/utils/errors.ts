export class AppError extends Error {
  statusCode: number
  details?: Record<string, unknown>

  constructor(message: string, statusCode = 400, details?: Record<string, unknown>) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
}

export const mapError = (error: unknown) => {
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode, details: error.details }
  }

  if (error instanceof Error) {
    return { message: 'Something went wrong. Please try again.', statusCode: 500, details: { original: error.message } }
  }

  return { message: 'Something went wrong. Please try again.', statusCode: 500 }
}
