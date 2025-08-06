import styled from 'styled-components'

const CostumeInput = styled.input`
  width: 74%;
  border-radius: 4px;
  border: 1px solid #d0d0d0;
  margin-bottom: 2px;
  text-align: center;
  outline: none;
  color: #232323;

  &:focus {
    border-color: #666;
    outline: none;
  }
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }
`

export default CostumeInput
