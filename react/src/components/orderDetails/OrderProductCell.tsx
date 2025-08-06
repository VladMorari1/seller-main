import React from 'react'
import styled from 'styled-components'

type Props = {
  name: string,
  imageUrl: string | null,
  skuId: string,
  refId: string,
  warehouse: string
}

const DivFlex = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px 0;
`

const Img = styled.img`
  max-width: 48px;
  margin-right: 10px;
`

const OrderProductCell = ({ name, imageUrl, skuId, refId, warehouse }: Props) => {
  return (
    <DivFlex>
      <div>
        <Img src={imageUrl ?? undefined} />
      </div>
      <div>
        <div className='fw5 heavy-blue mb3'>{name}</div>
        <div className='fw4 f6'>{skuId} (Ref.: {refId})</div>
        <div hidden={!warehouse} className='fw4 f6'>Warehouse: {warehouse}</div>
      </div>
    </DivFlex>
  )
}

export default OrderProductCell
