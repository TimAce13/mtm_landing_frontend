import { useEffect, useRef } from 'react'

/**
 * Плавное появление блоков при попадании в вьюпорт.
 *
 * Помечает элементы с классом lpReveal атрибутом data-revealed (CSS-правило —
 * в styles/landing.css). Именно АТРИБУТ, а не класс: React переписывает class
 * целиком при каждой перерисовке элемента, поэтому добавленный извне класс
 * стирался бы при любом взаимодействии (раскрытие вопроса в FAQ, смена фильтра,
 * переключение периода в тарифах) — и блок пропадал бы до следующей прокрутки.
 * Атрибута, которого нет в JSX, React не касается.
 *
 * Проверка позиции идёт по кадрам прокрутки, а не через IntersectionObserver:
 * последний пропускает элементы при быстром скролле, и они остаются невидимыми.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const reveal = (el: HTMLElement) => el.setAttribute('data-revealed', '')
    const revealAll = () => root.querySelectorAll<HTMLElement>('.lpReveal').forEach(reveal)

    if (reduceMotion) {
      revealAll()
      return
    }

    let frame = 0
    let stopped = false

    const check = () => {
      frame = 0
      if (stopped) return

      const pending = root.querySelectorAll<HTMLElement>('.lpReveal:not([data-revealed])')
      if (pending.length === 0) return

      const trigger = window.innerHeight * 0.94
      pending.forEach(el => {
        if (el.getBoundingClientRect().top < trigger) {
          const delay = Number(el.dataset.revealDelay ?? 0)
          if (delay > 0) window.setTimeout(() => reveal(el), delay)
          else reveal(el)
        }
      })
    }

    const schedule = () => {
      if (frame || stopped) return
      frame = window.requestAnimationFrame(check)
    }

    // Первый проход после первой отрисовки — контент над сгибом появляется сразу.
    schedule()

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    // Данные секций приезжают асинхронно и добавляют новые .lpReveal —
    // следим за появлением узлов, иначе они останутся скрытыми.
    const mo = new MutationObserver(schedule)
    mo.observe(root, { childList: true, subtree: true })

    // Страховка: если что-то пошло не так (нестандартный контейнер прокрутки,
    // ошибка расчёта), через 3 секунды контент всё равно становится виден.
    const failsafe = window.setTimeout(revealAll, 3000)

    return () => {
      stopped = true
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(failsafe)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mo.disconnect()
    }
  }, [])

  return ref
}
