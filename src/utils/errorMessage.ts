/**
 * Converts any thrown error (usually Axios) into a user-friendly Russian string.
 * Never exposes raw HTTP status text or technical details.
 */
export function friendlyError(err: unknown, fallback = 'Произошла ошибка — попробуйте ещё раз'): string {
  const e = err as {
    code?: string
    response?: { status?: number; data?: { message?: string; error?: string } }
    message?: string
    /** Marker set by typed errors whose message is safe to surface verbatim
     *  (e.g. OzonBidUpdateRejectedError carrying an Ozon validation string). */
    isOzonValidation?: boolean
  }

  // Typed validation errors — surface the message Ozon already localised
  // for us. The error class sets isOzonValidation = true and stores the
  // human-readable text in e.message.
  if (e?.isOzonValidation && e.message) return e.message

  // Client-side timeout
  if (e?.code === 'ECONNABORTED') return 'Сервер не ответил вовремя — попробуйте ещё раз'

  // No network at all
  if (e?.code === 'ERR_NETWORK' || e?.message === 'Network Error') return 'Нет соединения с сервером'

  const status = e?.response?.status

  if (status === 400) return 'Некорректный запрос — проверьте введённые данные'
  if (status === 401) return 'Сессия устарела — обновите страницу'
  if (status === 403) return 'Нет доступа к этому ресурсу'
  if (status === 404) return 'Данные не найдены'
  if (status === 409) {
    // 409-тексты бэкенда — намеренно человекочитаемые инструкции («transfer ownership
    // first…», «campaign is busy…»), их полезно показать как есть, а не глотать.
    const serverText = e?.response?.data?.error
    return serverText ? `Конфликт: ${serverText}` : 'Конфликт — операция невозможна в текущем состоянии'
  }
  if (status === 422) return 'Сервер не смог обработать запрос — проверьте данные'
  if (status === 429) return 'Слишком много запросов — подождите немного'
  if (status === 500) return 'Ошибка на сервере (500) — попробуйте ещё раз'
  if (status === 502) return 'Сервер временно недоступен (502) — повторите через несколько секунд'
  if (status === 503) return 'Сервис временно недоступен — повторите через несколько секунд'
  if (status === 504) return 'Сервер не ответил вовремя (504) — попробуйте ещё раз'

  return fallback
}
