import type { AxiosError } from 'axios'

export const getErrorMessage = (error: AxiosError) => {
  if (error.response?.data.message) {
    const { statusCode, message } = error.response.data

    switch (statusCode) {
      case 401:
        return 'Unauthorized, please add seller key in settings'

      default:
        return message
    }
  } else if (typeof error.response?.data === 'string') {
    return error.response?.data
  }

  return 'Unknown error, check the console'
}
