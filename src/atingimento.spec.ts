import { metaAtingida, percentualAtingimento } from './atingimento'

describe('percentualAtingimento', () => {
  it('calcula o percentual de atingimento', () => {
    expect(percentualAtingimento({ realizado: 50, objetivo: 200 })).toBe(25)
  })

  it('arredonda em duas casas decimais', () => {
    expect(percentualAtingimento({ realizado: 1, objetivo: 3 })).toBe(33.33)
  })

  it('falha quando o objetivo nao e positivo', () => {
    expect(() => percentualAtingimento({ realizado: 10, objetivo: 0 })).toThrow(
      'objetivo da meta deve ser maior que zero',
    )
  })
})

describe('metaAtingida', () => {
  it.each([
    [{ realizado: 100, objetivo: 100 }, true],
    [{ realizado: 120, objetivo: 100 }, true],
    [{ realizado: 99, objetivo: 100 }, false],
  ])('avalia %o como %s', (meta, esperado) => {
    expect(metaAtingida(meta)).toBe(esperado)
  })
})
