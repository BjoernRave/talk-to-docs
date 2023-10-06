import {
  useQueryClient,
  useQuery as useReactQuery,
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { createQueryParams } from './utils'

export const useQuery = <S>(
  {
    name,
    route,
    params = {},
    refetchInterval = false,
    returnType = 'json',
  }: {
    name: string | string[]
    route: string
    params?: any
    refetchInterval?: number | false
    returnType?: 'json' | 'blob'
  },
  { enabled }: { enabled?: boolean } = {}
) => {
  const fetcher: ({}: any) => any = async ({ signal }) => {
    const response = await fetch(`/api${route}?${createQueryParams(params)}`, {
      signal,
    })

    if (!response.ok) {
      toast.error('Could not fetch data from server')
    }

    const res = await response.json()

    return res
  }

  const res = useReactQuery<S>(
    params ? [name, params, route] : [name, route],
    fetcher,
    {
      refetchInterval,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled,
    }
  )

  return res
}

export const useMutation = <S = any>({
  route,
  method,
}: {
  route?: string
  method: 'POST' | 'DELETE' | 'PUT'
}) => {
  const queryClient = useQueryClient()

  return async ({
    body,
    route: innerRoute = route,
    onSuccess,
    onError,
    alertError = true,
  }: {
    body?: Record<string, any>
    route?: string
    onSuccess?: (response: S) => any | Promise<any>
    onError?: (response: any) => any
    alertError?: boolean | ((response: any) => boolean)
  }) => {
    try {
      const response = await fetch(`/api${innerRoute}`, {
        method,
        headers: {
          ...(body && { 'Content-Type': 'application/json' }),
        },
        ...(body && { body: JSON.stringify(body) }),
      }).then((res) => res.json())

      if ([1, true].includes(response.success)) {
        if (onSuccess) {
          await onSuccess(response as S)
        }

        await queryClient.invalidateQueries()

        return response as S
      }

      if (
        typeof alertError === 'function' ? alertError(response) : alertError
      ) {
        toast.error(response.error, {
          duration: 4000,
        })
      }

      onError && (await onError(response))

      return response as S
    } catch (error) {
      toast.error('Client side Crash')
    }
  }
}

export const query = async <S = any>({
  route,
  params,
}: {
  route: string
  params?: Record<string, any>
}) => {
  const response = await fetch(
    `/api${route}?${createQueryParams(params)}`,
    {}
  ).then((res) => res.json())

  return response as S
}
