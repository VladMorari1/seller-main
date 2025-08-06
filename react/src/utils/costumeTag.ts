import PropTypes from 'prop-types'
import styled from 'styled-components'

interface MyStyledDivProps {
  bgColor: string
}

const CostumeTag = styled.div<MyStyledDivProps>`
  background-color: ${props => props.bgColor};
  color: white;
  min-width: 84px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  border-radius: 16px;
  cursor: pointer;
`

CostumeTag.propTypes = {
  bgColor: PropTypes.string.isRequired,
}

export default CostumeTag
