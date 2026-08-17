# Mundo Quimera — versões instaláveis

O aplicativo desktop é empacotado com Electron a partir do mesmo build React usado na versão web. A interface e o storyfile são mantidos no pacote local do aplicativo.

## Artefatos

| Plataforma | Formatos gerados | Método |
|---|---|---|
| Windows | Instalador NSIS `.exe` e versão portátil | GitHub Actions em `windows-latest` |
| macOS | `.dmg` e `.zip` | GitHub Actions em `macos-latest` |
| Linux | `.AppImage` e `.deb` | GitHub Actions em `ubuntu-latest` |

O workflow `.github/workflows/desktop-build.yml` pode ser executado manualmente ou acionado por uma tag no formato `v1.0.0`. Cada sistema gera seus próprios artefatos em um runner nativo e os publica como artefatos da execução.

## Build local

A preparação comum é feita por `pnpm run desktop:prepare`. Para validar o diretório empacotado no sistema atual, use `pnpm run desktop:dir`. Para tentar gerar todos os alvos no ambiente local, use `pnpm run desktop:build`; porém, a geração do `.dmg` deve ocorrer em um macOS real, por isso a automação multiplataforma é o caminho recomendado.

## Assinatura

Os instaladores funcionam sem assinatura, mas o Windows e o macOS podem exibir avisos de segurança. Para distribuição pública, a etapa seguinte é configurar um certificado de assinatura para Windows e uma identidade Apple Developer com notarização para macOS. Isso exige credenciais externas e não deve ser colocado diretamente no repositório.

## Download dentro do jogo

Um botão de download pode ser adicionado ao Menu Principal depois que os artefatos forem publicados em uma página de releases. Ele deve apontar para os arquivos correspondentes ao sistema detectado, com uma alternativa para exibir todos os formatos.

## Assinatura digital

Os artefatos atuais são funcionais, mas ainda não estão assinados digitalmente. Para Windows, o workflow deve receber um certificado de assinatura de código e a senha por secrets do GitHub Actions, usando uma ferramenta como `signtool` ou a configuração de certificado do `electron-builder`. Para macOS, é necessário um certificado Developer ID Application, a identidade de assinatura, a notarização e os secrets correspondentes. Sem esses certificados, Windows Defender e Gatekeeper podem exibir avisos mesmo quando o aplicativo estiver correto.

A tela de carregamento é local ao aplicativo e não depende da rede; depois dela, a interface do jogo é aberta a partir do build empacotado.
