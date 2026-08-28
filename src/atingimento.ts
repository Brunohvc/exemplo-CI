export type Meta = {
  realizado: number
  objetivo: number
}

/**
 * Percentual de atingimento da meta, arredondado em 2 casas.
 * Objetivo zerado nao tem atingimento possivel.
 */
export function percentualAtingimento({ realizado, objetivo }: Meta): number {
  if (objetivo <= 0) {
    throw new Error('objetivo da meta deve ser maior que zero')
  }

  return Math.round((realizado / objetivo) * 10000) / 100
}

export function metaAtingida(meta: Meta): boolean {
  return percentualAtingimento(meta) >= 100
}

export type Faixa = 'critico' | 'atencao' | 'no alvo' | 'superado'

/**
 * Classifica a meta em faixas, para o painel do franqueado.
 */
export function faixaAtingimento(meta: Meta): Faixa {
  const percentual = percentualAtingimento(meta)

  if (percentual >= 110) return 'superado'
  if (percentual >= 100) return 'no alvo'
  if (percentual >= 80) return 'atencao'

  return 'critico'
}
