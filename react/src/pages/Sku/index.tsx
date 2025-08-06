import React, { useEffect, useState } from 'react'
import { InputSearch, PageBlock, Totalizer } from 'vtex.styleguide'

import SkuTable from '../../components/SkuTable'
import { useDebounce } from '../../hooks/useDebounce'
import SKUFilters from '../../components/filters/SKUFilters'
import type { SKUFiltersProps } from '../../types/skuTypes'
import { getSKUTotalizerData } from '../../services/sku'

function Sku() {
  const [searchValue, setSearchValue] = useState<string>('')
  const [availableCount, setAvailableCount] = useState(0)
  const [skuFilters, setSkuFilters] = useState<SKUFiltersProps>({
    warehouses: [],
    fulfillment: null,
    isAvailableForPreorder: null,
  })

  useEffect(() => {
    getSKUTotalizerData().then(res => setAvailableCount(res.availableCount))
  }, [])

  const debouncedSearchTerm = useDebounce(searchValue, 500)

  return (
    <div className="bg-muted-5 mt3">
      <PageBlock variation="full">
        <SKUFilters setSkuFilters={setSkuFilters} />
        <Totalizer
          horizontalLayout
          items={[
            {
              label: 'Available for pre-order',
              value: availableCount,
              inverted: true,
            },
          ]}
        />
        <div className="mt3">
          <InputSearch
            placeholder="Search..."
            value={searchValue}
            size="small"
            onChange={(e: { target: { value: string } }) =>
              setSearchValue(e.target.value)
            }
          />
        </div>
        <div>
          <SkuTable searchedVal={debouncedSearchTerm} skuFilters={skuFilters} />
        </div>
      </PageBlock>
    </div>
  )
}

export default Sku
