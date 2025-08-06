import axios from 'axios'

export const getStripe = (orderId: string): Promise<any> =>
  axios.get(`/poa/stripe?orderId=${orderId}`, {}).then(response => {
    return response.data
  })
