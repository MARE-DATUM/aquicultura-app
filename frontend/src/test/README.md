# Testes do Frontend

Este diretório contém os testes unitários e de integração para o frontend da aplicação de aquicultura.

## Estrutura

```
src/test/
├── setup.ts              # Configuração global dos testes
├── test-utils.tsx        # Utilitários de teste personalizados
├── components/           # Testes dos componentes UI
│   ├── Button.test.tsx
│   └── Card.test.tsx
├── hooks/               # Testes dos hooks customizados
│   └── useDebounce.test.ts
├── pages/               # Testes das páginas
│   └── Login.test.tsx
└── README.md            # Este arquivo
```

## Como executar os testes

### Todos os testes
```bash
npm run test
```

### Testes com interface visual
```bash
npm run test:ui
```

### Testes com cobertura
```bash
npm run test:coverage
```

### Testes específicos
```bash
npm run test Button.test.tsx
```

## Configuração

Os testes são configurados usando:
- **Vitest**: Framework de testes principal
- **React Testing Library**: Para testes de componentes React
- **jsdom**: Ambiente DOM simulado
- **@testing-library/jest-dom**: Matchers adicionais para DOM

## Convenções

1. **Nomenclatura**: Arquivos de teste devem terminar com `.test.tsx` ou `.test.ts`
2. **Estrutura**: Usar `describe` para agrupar testes relacionados
3. **Mocks**: Usar `vi.mock()` para mockar dependências externas
4. **Cleanup**: Limpar mocks entre testes usando `beforeEach` e `afterEach`

## Exemplos

### Teste de componente
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '../components/ui/Button'

describe('Button', () => {
  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Teste de hook
```tsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useDebounce } from '../hooks/useDebounce'

describe('useDebounce', () => {
  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')
  })
})
```

## Cobertura de Código

O objetivo é manter uma cobertura de código de pelo menos 80% para:
- Branches (ramificações)
- Functions (funções)
- Lines (linhas)
- Statements (declarações)

## Troubleshooting

### Problemas comuns

1. **Mocks não funcionam**: Verifique se está usando `vi.mock()` antes dos imports
2. **Timers não funcionam**: Use `vi.useFakeTimers()` e `vi.useRealTimers()`
3. **Async operations**: Use `waitFor()` para aguardar operações assíncronas
4. **Router context**: Use o `AllTheProviders` wrapper para componentes que usam React Router
