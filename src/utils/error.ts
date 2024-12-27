type Result<T> = {data: T; error: undefined} | {data: undefined; error: Error}

export function catchError<T>(promise: Promise<T>): Promise<Result<T>> {
  return promise.then(data => ({data, error: undefined})).catch(error => ({error, data: undefined}))
}

export function labelError(label: string) {
  return (error: Error) => console.error(`${label}: ${error}`)
}

export function throwError(label: string) {
  return (error: Error) => {
    throw new Error(`${label}: ${error}`)
  }
}
