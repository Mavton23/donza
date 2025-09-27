export function getErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error?.message) return err.response.data.error.message;
  if (err.data?.error?.message) return err.data.error.message;
  if (typeof err.message === 'string') return err.message;
  return 'Ocorreu um erro inesperado';
}