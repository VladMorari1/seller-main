import axios from 'axios'

export const getTransfers = (limit?: number, offset?: number): Promise<any> =>
  axios
    .get('/seller/transfers', { params: { limit, offset } })
    .then(response => response)
    .catch(error => {
      throw error
    })
