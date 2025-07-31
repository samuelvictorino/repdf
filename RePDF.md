Sumário Executivo: RePDF - Suíte Executiva de PDF
1. Propósito e Proposta de Valor
RePDF é um aplicativo web de alta performance (Single Page Application - SPA) projetado para a manipulação avançada de documentos PDF. Sua principal proposta de valor reside em oferecer um conjunto de ferramentas de nível profissional diretamente no navegador, com uma ênfase fundamental na privacidade e velocidade. Todo o processamento de arquivos ocorre exclusivamente no lado do cliente (client-side); nenhum documento é enviado a um servidor, garantindo que os dados sensíveis do usuário permaneçam em sua máquina.
O aplicativo se destina a usuários que necessitam de mais do que um simples visualizador de PDF, permitindo a fusão de múltiplos arquivos, reordenação, rotação e exclusão de páginas de forma visual e intuitiva. A experiência é enriquecida com funcionalidades de Inteligência Artificial (IA) via API Gemini para automatizar tarefas como extração de texto (OCR) e sugestão de nomes de arquivos, agregando uma camada de eficiência inteligente ao fluxo de trabalho.
2. Interface e Padrões de Interação
A interface do RePDF foi projetada para ser poderosa e intuitiva, emulando a experiência de um software de desktop robusto.
Layout Principal: A estrutura é composta por um cabeçalho fixo, uma barra de ferramentas de controle, uma barra de abas para múltiplos documentos e uma área de conteúdo principal. A estética é moderna, personalizável com temas claro/escuro e uma cor de destaque dinâmica que permeia toda a interface.
Manipulação de Arquivos e Abas:
Os usuários abrem múltiplos arquivos PDF, cada um representado por uma aba na FileTabsBar.
As abas são interativas: podem ser selecionadas, renomeadas com um duplo-clique, reordenadas via arrastar e soltar (drag-and-drop) e fechadas.
O fechamento de uma aba aciona uma confirmação contextual de baixa fricção, que aparece perto do cursor, em vez de um modal que interrompe o fluxo.
As abas também funcionam como alvos de soltar (drop targets) para mover ou copiar páginas entre documentos.
Manipulação de Páginas (Ponto Central da Interação):
A área de conteúdo (ActiveFileContentArea) exibe as páginas do documento ativo como uma grade de miniaturas responsiva.
O sistema de seleção suporta interações padrão: clique único, Ctrl/Cmd + clique para seleção múltipla e Shift + clique para seleção de intervalo.
Arrastar e Soltar (Drag-and-Drop) é a principal mecânica:
Dentro do mesmo arquivo: O usuário arrasta as páginas selecionadas e uma linha de inserção visual indica precisamente onde elas serão realocadas.
Entre arquivos diferentes: O usuário arrasta as páginas e as segura sobre a aba de outro documento. Após um breve instante, o aplicativo automaticamente troca para o documento de destino, permitindo que o usuário solte as páginas na nova grade. Ao soltar, um menu contextual surge, permitindo escolher entre "Mover" ou "Copiar", uma interação sofisticada que evita ambiguidades.
Modalidade e Feedback:
Os modais (Exportação, Configurações, etc.) são projetados como janelas flutuantes, arrastáveis e redimensionáveis, reforçando a sensação de um aplicativo de desktop.
O feedback ao usuário é constante e sutil, utilizando spinners de carregamento em operações demoradas (como OCR), placeholders com efeito de brilho (shimmer) enquanto as miniaturas carregam, e um sistema de notificações não obstrutivo.
3. Arquitetura e Componentes Chave
O aplicativo é construído com tecnologias modernas, focando em manutenibilidade e performance.
Tecnologias Principais:
React 19: Utilizado com Hooks para uma arquitetura baseada em componentes funcionais.
Gerenciamento de Estado (AppContext.tsx): O coração da aplicação. Utiliza a Context API com useReducer e um hook customizado useUndoRedo. O estado é inteligentemente particionado em:
Estado Central Desfazível (CoreUndoableState): Contém os dados críticos da sessão do usuário (arquivos, páginas, seleções), permitindo funcionalidades de desfazer e refazer.
Estado de UI (Não Desfazível): Controla elementos efêmeros como o modal ativo, notificações e estados de arrastar/soltar.
Processamento de PDF:
pdf.js: Usado para carregar, analisar e renderizar páginas PDF para elementos <canvas> (para criar miniaturas e visualizações de alta qualidade).
pdf-lib: Usado para a criação e montagem dos novos arquivos PDF na exportação.
IA: @google/genai para interagir com os modelos Gemini (visão para OCR, texto para sugestão de nomes).
Estilização: Tailwind CSS (via CDN) com um sistema de temas dinâmico baseado em variáveis CSS customizadas, permitindo personalização em tempo real.
Componentes Estruturais:
App.tsx: Orquestrador principal que monta o layout e renderiza modais.
Header.tsx, ViewControlsToolbar.tsx, FileTabsBar.tsx: Componentes de layout fixos.
ActiveFileContentArea.tsx: Gerencia a grade de páginas responsiva e toda a lógica de arrastar e soltar de páginas.
PageThumbnailWrapper.tsx: O componente para cada miniatura de página, encapsulando sua lógica de seleção, hover, ações rápidas (rotação, preview) e indicadores de processamento.
ModalFrame.tsx: Um componente de modal genérico, arrastável e redimensionável, que serve como base para todos os outros modais da aplicação.
4. Entradas e Saídas (Inputs & Outputs)
Entradas (Inputs):
Ações do Usuário: Cliques, duplo-cliques, arrastar e soltar (páginas e abas), submissão de formulários nos modais (e.g., opções de exportação, senha), e atalhos de teclado (e.g., Esc para fechar modais).
Arquivos do Sistema: A entrada primária são um ou mais arquivos .pdf selecionados pelo usuário a partir de seu disco local.
Saídas (Outputs):
Feedback Visual na Interface:
Renderização de miniaturas de páginas.
Atualização de seleções, destaques e bordas.
Indicadores de carregamento e processamento.
Notificações de sucesso, erro e informação.
Menus e modais que aparecem em resposta a ações.
Linha de inserção visual durante operações de arrastar e soltar.
Arquivos PDF Gerados: A saída principal do aplicativo. O usuário pode exportar:
Um único PDF combinado.
Múltiplos PDFs separados.
Arquivos protegidos por senha.
Arquivos automaticamente divididos se excederem um tamanho máximo definido.
Chamadas de API (Gemini):
Envio de imagens de páginas (como string base64) para o modelo de visão para realizar OCR.
Envio de amostras de texto para o modelo de linguagem para obter sugestões de nomes de arquivo.

Application Concept: The Executive PDF Suite
RePDF is a high-performance, client-side web application conceived as a "power-user" tool for PDF manipulation. It operates entirely within the user's browser, ensuring privacy and speed as no files are uploaded to a server. The user experience is modeled after desktop software, featuring a multi-document interface with tabs, draggable/resizable modals, and extensive use of contextual actions and keyboard shortcuts. The core loop involves importing PDFs, manipulating their pages in a highly visual grid, and exporting the results in various formats. This is augmented by AI features to streamline common tasks.

1. Core Functionality & File Management
* File Import and Workspace:
    * Interaction: The user clicks the "Open Files" button. If the workspace is empty, a native file picker opens immediately. If there are existing files, these will be added to the current workspace.
    * Mechanics: The app accepts multiple PDF files simultaneously (capped at 5 to manage browser memory). It uses the pdf.js library to parse these files in the background. For each file, it creates:
        1. A LoadedPdfDocument object in the state, holding the raw PDFDocumentProxy for future high-quality rendering.
        2. An OutputFile object, which is the user-facing representation of the document, displayed as a tab.
    * Feedback: A global loading indicator shows progress during the initial import. Success or error notifications appear for the import process.
* Tab-Based Document Interface:
    * Interaction: Each open OutputFile is represented by a tab in the FileTabsBar. Clicking a tab makes it the active document, displaying its pages in the content area. Users can add a new, empty file by clicking a + icon.
    * Reordering: Users can drag and drop the tabs themselves to change the order of the OutputFile containers.
    * Renaming:
        * Double-clicking a tab makes its name an editable input field. The user can type a new name and press Enter or click away to save.
        * Alternatively, clicking the "Suggest Name (AI)" icon on a tab opens a modal for AI-powered renaming.
    * Closing/Deleting:
        * Clicking the 'X' icon on a tab doesn't immediately delete it. Instead, it triggers a small, contextual confirmation prompt that appears near the cursor (e.g., "Delete 'FileName'?"). This is a low-friction confirmation that avoids a disruptive full-screen modal. Clicking this prompt finalizes the deletion. Clicking anywhere else dismisses it.

2. Page Manipulation & Visual Grid
The ActiveFileContentArea is the primary workspace where all page-level operations occur.
* Visual Representation:
    * Pages of the active file are rendered as a responsive grid of thumbnails. The app calculates the optimal number of columns and thumbnail size to fit the viewport.
    * Thumbnails are generated asynchronously with pdf.js, showing a ShimmerPlaceholder while loading to maintain layout stability and provide immediate feedback.
* Selection Model:
    * Single Click: Selects a single page.
    * Ctrl/Cmd + Click: Toggles the selection state of a page without affecting others.
    * Shift + Click: Selects all pages between the last selected page and the currently clicked page.
    * Deselection: Clicking on the empty background of the content area deselects all pages.
* Page Operations (Context-Sensitive):
    * Toolbar Actions: Buttons in the ViewControlsToolbar (e.g., "Rotate Selected," "Delete Selected") are enabled only when one or more pages are selected.
    * Drag-and-Drop Reordering:
        * Users can drag one or more selected pages. The dragged items become semi-transparent.
        * As they drag over the grid, a glowing vertical "insertion line" appears between thumbnails, precisely indicating the drop location.
    * Move/Copy Between Files:
        * This is a key workflow. The user drags selected pages and hovers over a different file's tab in the FileTabsBar.
        * After a brief delay (700ms), the application automatically switches the activeOutputFileId, displaying the content of the target file while the drag operation remains active.
        * When the user drops the pages onto the target file's tab, a contextual move/copy menu appears at the cursor's location. This allows the user to finalize the action as either "Move" (which removes the pages from the source) or "Copy" (which creates duplicates in the target).
    * Hover Actions on Thumbnails: Hovering over an individual thumbnail reveals a set of small icon buttons for quick actions like single-page rotation or opening the Quick Preview, minimizing the need to select and then use the main toolbar for simple tasks.

3. Advanced Viewing & Exporting
* Quick Preview Modal:
    * Interaction: Accessible from the main toolbar (for selected pages) or a hover icon on a thumbnail. It opens a full-screen overlay modal for an immersive, high-resolution view of the page.
    * Mechanics: It renders the page using pdf.js at a much higher resolution (1200px width).
    * Features:
        * Navigation: Users can navigate between the previewed pages using on-screen arrow buttons or the left/right arrow keys.
        * Magnifier: On mouseover, a circular magnifier glass appears, showing a zoomed-in portion of the image, perfect for inspecting details without zooming the entire view.
        * Fullscreen: A button allows the user to enter true browser fullscreen mode for a distraction-free experience.
* Export Modal:
    * Interaction: A comprehensive modal allows users to configure the final output.
    * File Selection: Users can check/uncheck which of the currently open files they wish to include in the export operation.
    * Export Modes: If more than one file is selected for export, the user can choose to:
        1. Combine: Merge all selected files into a single PDF.
        2. Separate: Export each file as its own PDF.
    * Advanced Options:
        * Password Protection: Users can enable and set a password to encrypt the output PDF(s).
        * File Size Splitting: When combining into a single PDF, users can set a maximum file size (e.g., 10 MB). If the output exceeds this, the application automatically splits it into numbered parts (e.g., MyDocument_part1.pdf, MyDocument_part2.pdf).

4. AI Integration (Gemini)
* OCR (Make Searchable):
    * Interaction: The user selects one or more pages and clicks the "Make Searchable (OCR)" button.
    * Mechanics: For each selected page, the app:
        1. Renders a high-quality JPEG of the page.
        2. Converts it to a base64 string.
        3. Sends the image data to the Gemini vision model with a prompt to extract all text.
        4. Stores the returned text in the page's metadata. This text is embedded invisibly during the export process, making the final PDF searchable.
    * Feedback: An animated loading spinner appears over the thumbnail of any page being processed. A notification reports on the success or failure of the batch operation.
* AI Name Suggestion:
    * Interaction: The user clicks the AI icon on a file tab.
    * Mechanics: A modal appears. The app takes the text content from the first few pages of that file, sends it to the Gemini text model, and asks for a concise filename. The sanitized suggestion appears in the modal, ready for the user to save.

5. UI/UX Patterns & Theming
* Stateful UI: The entire interface is reactive. Buttons are disabled when their action is not possible. Selections are clearly marked with a colored border and overlay. The UI provides constant, non-intrusive feedback.
* Undo/Redo: A history of core state changes is maintained. Users can step backward and forward through actions like page deletion, reordering, rotation, and file renaming using the Undo and Redo buttons.
* Customizable Aesthetics:
    * Theme: A toggle in the Settings modal switches between light and dark mode by adding/removing a dark class on the <html> element.
    * Accent Color: A color picker allows the user to select any accent color. The app uses HSL color manipulation to programmatically generate a full palette of 10 shades (from light to dark) based on the user's choice. These shades are injected as CSS variables (--accent-color-50, --accent-color-100, etc.) and used throughout the application. The app also calculates whether white or black text provides better contrast against the chosen accent color and applies it automatically.
* Draggable & Resizable Modals: Modals for settings, export options, and AI suggestions behave like floating windows. Users can drag them by their header and resize them from any edge or corner, reinforcing the "desktop-like" power-user experience.
* Notifications System: A non-blocking notification system is accessed via a bell icon. It displays a list of recent actions (success, error, info) in a dropdown/modal, which can be filtered or cleared. A badge on the bell icon indicates the number of unread notifications.