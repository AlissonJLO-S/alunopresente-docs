---
title: Padrões Frontend (Angular 19)
description: Diretrizes de UX, TailwindCSS e ciclo de vida de componentes
---

## 🎨 Regras de Ouro do Frontend

1. **Hierarquia Global vs Local (Unidade Escolar):** Se houver uma escola global selecionada no menu superior, o dropdown local do dashboard deve respeitá-la e ocultar o botão de limpar para evitar o *ghost filter*.
2. **Sincronia de Filtros Dependentes:** Ao mudar a escola, invoque `aoMudarUnidade()` para resetar turmas e períodos antes de chamar a API.
3. **Proibições:**
   - Proibido CSS inline (`style="..."`).
   - Proibido alterar `styles.scss` global para telas específicas (use Tailwind classes).
   - Proibido instanciar SDKs de câmera diretamente nos componentes (use `CameraStreamSessionService`).
