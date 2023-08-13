export const createQueryParams = (params: any) =>
  Object.keys(params)
    .map((key) => `${key}=${encodeURI(params[key])}`)
    .join('&')
