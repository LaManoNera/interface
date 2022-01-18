import { Token } from '@uniswap/sdk-core'
import useDebounce from 'hooks/useDebounce'
import useActiveWeb3React from 'lib/hooks/useActiveWeb3React'
import { useTokenBalances } from 'lib/hooks/useCurrencyBalance'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useMemo } from 'react'

import { getTokenFilter } from './filtering'
import { tokenComparator, useSortTokensByQuery } from './sorting'

export function useQueryTokens(query: string, tokens: Token[]) {
  const { account } = useActiveWeb3React()
  const balances = useTokenBalances(account, tokens)
  const sortedTokens = useMemo(
    () => [
      // spread to create a new memo, because sort is in-place and returns referentially equivalent
      ...tokens.sort(tokenComparator.bind(null, balances)),
    ],
    [balances, tokens]
  )

  const debouncedQuery = useDebounce(query, 200)
  const filter = useMemo(() => getTokenFilter(debouncedQuery), [debouncedQuery])
  const filteredTokens = useMemo(() => sortedTokens.filter(filter), [filter, sortedTokens])

  const queriedTokens = useSortTokensByQuery(debouncedQuery, filteredTokens)

  const native = useNativeCurrency()
  return useMemo(() => {
    if (native && filter(native)) {
      return [native, ...queriedTokens]
    }
    return queriedTokens
  }, [filter, native, queriedTokens])
}