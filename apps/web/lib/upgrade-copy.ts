import { additionalLocales } from "./additional-locales";
import type { Locale } from "@hxsl/tool-registry";

export type UpgradeCopy = {
  navigation: { search: string; menu: string; more: string; close: string };
  search: { placeholder: string; command: string; noResults: string; noResultsBody: string; clear: string; browse: string; hint: string; inputLabel: string };
  shortcuts: { title: string; description: string; recent: string; favorites: string; clear: string; empty: string; remove: string };
  category: { filterLabel: string; allFormats: string; clear: string; showing: string; noMatches: string; noMatchesBody: string; browseAll: string; favorite: string; unfavorite: string };
  tool: { home: string; favorite: string; unfavorite: string; local: string; server: string; consent: string; files: string; options: string; presets: string; presetName: string; savePreset: string; apply: string; deletePreset: string; reset: string; stale: string; retry: string; results: string; downloadAll: string; continue: string; choose: string; review: string; process: string; download: string };
};

const en: UpgradeCopy = {
  navigation: { search: "Search tools", menu: "Open menu", more: "More", close: "Close" },
  search: { placeholder: "Search by task, format or alias", command: "Search tools", noResults: "No tools match that search", noResultsBody: "Try a format such as PDF or JPG, or browse a category.", clear: "Clear search", browse: "Browse categories", hint: "Search by task, format or alias", inputLabel: "Search tools" },
  shortcuts: { title: "Your shortcuts", description: "Recent work and saved tools stay on this device.", recent: "Recent", favorites: "Favorites", clear: "Clear recent", empty: "Process a file or save a tool to see it here.", remove: "Remove from favorites" },
  category: { filterLabel: "Filter by format", allFormats: "All formats", clear: "Clear filter", showing: "Showing", noMatches: "No tools match this filter", noMatchesBody: "Clear the format filter or browse another category.", browseAll: "View all tools", favorite: "Add to favorites", unfavorite: "Remove from favorites" },
  tool: { home: "Home", favorite: "Add to favorites", unfavorite: "Remove from favorites", local: "Runs in your browser", server: "Runs on the server", consent: "Upload requires your consent", files: "Files", options: "Options", presets: "Saved presets", presetName: "Preset name", savePreset: "Save preset", apply: "Apply", deletePreset: "Delete", reset: "Reset defaults", stale: "These settings changed. Process again to update the result.", retry: "Retry", results: "Results", downloadAll: "Download successful files", continue: "Continue with this result", choose: "Choose files", review: "Review", process: "Process", download: "Download" },
};

const localized: Record<Locale, UpgradeCopy> = {
  ...packMap(c => c.upgrade),
  ko: additionalLocales.ko.upgrade, it: additionalLocales.it.upgrade,

  en,
  "zh-CN": {
    navigation: { search: "搜索工具", menu: "打开菜单", more: "更多", close: "关闭" },
    search: { placeholder: "按任务、格式或别名搜索", command: "搜索工具", noResults: "没有匹配的工具", noResultsBody: "可以尝试搜索 PDF、JPG 等格式，或浏览分类。", clear: "清除搜索", browse: "浏览分类", hint: "按任务、格式或别名搜索", inputLabel: "搜索工具" },
    shortcuts: { title: "你的快捷入口", description: "最近使用和收藏的工具只保存在此设备上。", recent: "最近使用", favorites: "收藏", clear: "清除最近使用", empty: "处理文件或收藏工具后，这里会显示快捷入口。", remove: "取消收藏" },
    category: { filterLabel: "按格式筛选", allFormats: "全部格式", clear: "清除筛选", showing: "显示", noMatches: "没有符合筛选条件的工具", noMatchesBody: "清除格式筛选，或浏览其他分类。", browseAll: "查看全部工具", favorite: "加入收藏", unfavorite: "取消收藏" },
    tool: { home: "首页", favorite: "加入收藏", unfavorite: "取消收藏", local: "在浏览器中处理", server: "在服务端处理", consent: "上传前需要你的同意", files: "文件", options: "参数", presets: "已保存预设", presetName: "预设名称", savePreset: "保存预设", apply: "应用", deletePreset: "删除", reset: "恢复默认", stale: "参数已改变。请重新处理以更新结果。", retry: "重试", results: "结果", downloadAll: "下载成功文件", continue: "继续处理此结果", choose: "选择文件", review: "检查", process: "处理", download: "下载" },
  },
  "zh-TW": {
    navigation: { search: "搜尋工具", menu: "開啟選單", more: "更多", close: "關閉" },
    search: { placeholder: "依工作、格式或別名搜尋", command: "搜尋工具", noResults: "沒有符合的工具", noResultsBody: "可以嘗試搜尋 PDF、JPG 等格式，或瀏覽分類。", clear: "清除搜尋", browse: "瀏覽分類", hint: "依工作、格式或別名搜尋", inputLabel: "搜尋工具" },
    shortcuts: { title: "你的快捷入口", description: "最近使用和收藏的工具只保存在此裝置上。", recent: "最近使用", favorites: "收藏", clear: "清除最近使用", empty: "處理檔案或收藏工具後，這裡會顯示快捷入口。", remove: "取消收藏" },
    category: { filterLabel: "依格式篩選", allFormats: "全部格式", clear: "清除篩選", showing: "顯示", noMatches: "沒有符合篩選條件的工具", noMatchesBody: "清除格式篩選，或瀏覽其他分類。", browseAll: "查看全部工具", favorite: "加入收藏", unfavorite: "取消收藏" },
    tool: { home: "首頁", favorite: "加入收藏", unfavorite: "取消收藏", local: "在瀏覽器中處理", server: "在伺服器中處理", consent: "上傳前需要你的同意", files: "檔案", options: "參數", presets: "已儲存預設", presetName: "預設名稱", savePreset: "儲存預設", apply: "套用", deletePreset: "刪除", reset: "恢復預設", stale: "參數已變更。請重新處理以更新結果。", retry: "重試", results: "結果", downloadAll: "下載成功檔案", continue: "繼續處理此結果", choose: "選擇檔案", review: "檢查", process: "處理", download: "下載" },
  },
  es: {
    navigation: { search: "Buscar herramientas", menu: "Abrir menú", more: "Más", close: "Cerrar" },
    search: { placeholder: "Busca por tarea, formato o alias", command: "Buscar herramientas", noResults: "No hay herramientas para esa búsqueda", noResultsBody: "Prueba con un formato como PDF o JPG, o explora una categoría.", clear: "Borrar búsqueda", browse: "Explorar categorías", hint: "Busca por tarea, formato o alias", inputLabel: "Buscar herramientas" },
    shortcuts: { title: "Tus accesos", description: "Los trabajos recientes y las herramientas guardadas permanecen en este dispositivo.", recent: "Recientes", favorites: "Favoritos", clear: "Borrar recientes", empty: "Procesa un archivo o guarda una herramienta para verla aquí.", remove: "Quitar de favoritos" },
    category: { filterLabel: "Filtrar por formato", allFormats: "Todos los formatos", clear: "Borrar filtro", showing: "Mostrando", noMatches: "No hay herramientas con este filtro", noMatchesBody: "Borra el filtro o explora otra categoría.", browseAll: "Ver todas las herramientas", favorite: "Añadir a favoritos", unfavorite: "Quitar de favoritos" },
    tool: { home: "Inicio", favorite: "Añadir a favoritos", unfavorite: "Quitar de favoritos", local: "Se ejecuta en tu navegador", server: "Se ejecuta en el servidor", consent: "La subida requiere tu permiso", files: "Archivos", options: "Opciones", presets: "Ajustes guardados", presetName: "Nombre del ajuste", savePreset: "Guardar ajuste", apply: "Aplicar", deletePreset: "Eliminar", reset: "Restablecer", stale: "Los ajustes cambiaron. Procesa de nuevo para actualizar el resultado.", retry: "Reintentar", results: "Resultados", downloadAll: "Descargar archivos correctos", continue: "Continuar con este resultado", choose: "Elegir archivos", review: "Revisar", process: "Procesar", download: "Descargar" },
  },
  "pt-BR": {
    navigation: { search: "Buscar ferramentas", menu: "Abrir menu", more: "Mais", close: "Fechar" },
    search: { placeholder: "Busque por tarefa, formato ou alias", command: "Buscar ferramentas", noResults: "Nenhuma ferramenta corresponde à busca", noResultsBody: "Tente um formato como PDF ou JPG, ou navegue por uma categoria.", clear: "Limpar busca", browse: "Ver categorias", hint: "Busque por tarefa, formato ou alias", inputLabel: "Buscar ferramentas" },
    shortcuts: { title: "Seus atalhos", description: "Trabalhos recentes e ferramentas salvas ficam neste dispositivo.", recent: "Recentes", favorites: "Favoritos", clear: "Limpar recentes", empty: "Processe um arquivo ou salve uma ferramenta para vê-la aqui.", remove: "Remover dos favoritos" },
    category: { filterLabel: "Filtrar por formato", allFormats: "Todos os formatos", clear: "Limpar filtro", showing: "Mostrando", noMatches: "Nenhuma ferramenta corresponde ao filtro", noMatchesBody: "Limpe o filtro ou veja outra categoria.", browseAll: "Ver todas as ferramentas", favorite: "Adicionar aos favoritos", unfavorite: "Remover dos favoritos" },
    tool: { home: "Início", favorite: "Adicionar aos favoritos", unfavorite: "Remover dos favoritos", local: "Executa no navegador", server: "Executa no servidor", consent: "O upload precisa do seu consentimento", files: "Arquivos", options: "Opções", presets: "Predefinições salvas", presetName: "Nome da predefinição", savePreset: "Salvar predefinição", apply: "Aplicar", deletePreset: "Excluir", reset: "Restaurar padrão", stale: "As opções mudaram. Processe novamente para atualizar o resultado.", retry: "Tentar novamente", results: "Resultados", downloadAll: "Baixar arquivos bem-sucedidos", continue: "Continuar com este resultado", choose: "Escolher arquivos", review: "Revisar", process: "Processar", download: "Baixar" },
  },
  de: {
    navigation: { search: "Werkzeuge suchen", menu: "Menü öffnen", more: "Mehr", close: "Schließen" },
    search: { placeholder: "Nach Aufgabe, Format oder Alias suchen", command: "Werkzeuge suchen", noResults: "Keine passenden Werkzeuge", noResultsBody: "Versuche ein Format wie PDF oder JPG oder öffne eine Kategorie.", clear: "Suche löschen", browse: "Kategorien öffnen", hint: "Nach Aufgabe, Format oder Alias suchen", inputLabel: "Werkzeuge suchen" },
    shortcuts: { title: "Deine Verknüpfungen", description: "Letzte Aufgaben und gespeicherte Werkzeuge bleiben auf diesem Gerät.", recent: "Zuletzt verwendet", favorites: "Favoriten", clear: "Letzte löschen", empty: "Verarbeite eine Datei oder speichere ein Werkzeug, damit es hier erscheint.", remove: "Aus Favoriten entfernen" },
    category: { filterLabel: "Nach Format filtern", allFormats: "Alle Formate", clear: "Filter löschen", showing: "Angezeigt", noMatches: "Keine Werkzeuge für diesen Filter", noMatchesBody: "Lösche den Formatfilter oder öffne eine andere Kategorie.", browseAll: "Alle Werkzeuge ansehen", favorite: "Zu Favoriten hinzufügen", unfavorite: "Aus Favoriten entfernen" },
    tool: { home: "Startseite", favorite: "Zu Favoriten hinzufügen", unfavorite: "Aus Favoriten entfernen", local: "Läuft im Browser", server: "Läuft auf dem Server", consent: "Upload nur mit deiner Zustimmung", files: "Dateien", options: "Optionen", presets: "Gespeicherte Vorgaben", presetName: "Name der Vorgabe", savePreset: "Vorgabe speichern", apply: "Anwenden", deletePreset: "Löschen", reset: "Standardwerte", stale: "Die Optionen wurden geändert. Verarbeite erneut, um das Ergebnis zu aktualisieren.", retry: "Erneut versuchen", results: "Ergebnisse", downloadAll: "Erfolgreiche Dateien laden", continue: "Mit diesem Ergebnis fortfahren", choose: "Dateien wählen", review: "Prüfen", process: "Verarbeiten", download: "Download" },
  },
  fr: {
    navigation: { search: "Rechercher un outil", menu: "Ouvrir le menu", more: "Plus", close: "Fermer" },
    search: { placeholder: "Rechercher par tâche, format ou alias", command: "Rechercher un outil", noResults: "Aucun outil ne correspond", noResultsBody: "Essayez un format comme PDF ou JPG, ou parcourez une catégorie.", clear: "Effacer la recherche", browse: "Parcourir les catégories", hint: "Rechercher par tâche, format ou alias", inputLabel: "Rechercher un outil" },
    shortcuts: { title: "Vos raccourcis", description: "Les tâches récentes et les outils enregistrés restent sur cet appareil.", recent: "Récents", favorites: "Favoris", clear: "Effacer les récents", empty: "Traitez un fichier ou enregistrez un outil pour le voir ici.", remove: "Retirer des favoris" },
    category: { filterLabel: "Filtrer par format", allFormats: "Tous les formats", clear: "Effacer le filtre", showing: "Affichage", noMatches: "Aucun outil pour ce filtre", noMatchesBody: "Effacez le filtre ou ouvrez une autre catégorie.", browseAll: "Voir tous les outils", favorite: "Ajouter aux favoris", unfavorite: "Retirer des favoris" },
    tool: { home: "Accueil", favorite: "Ajouter aux favoris", unfavorite: "Retirer des favoris", local: "S’exécute dans le navigateur", server: "S’exécute sur le serveur", consent: "L’envoi nécessite votre accord", files: "Fichiers", options: "Options", presets: "Préréglages enregistrés", presetName: "Nom du préréglage", savePreset: "Enregistrer", apply: "Appliquer", deletePreset: "Supprimer", reset: "Réinitialiser", stale: "Les options ont changé. Relancez le traitement pour mettre à jour le résultat.", retry: "Réessayer", results: "Résultats", downloadAll: "Télécharger les fichiers réussis", continue: "Continuer avec ce résultat", choose: "Choisir des fichiers", review: "Vérifier", process: "Traiter", download: "Télécharger" },
  },
  ja: {
    navigation: { search: "ツールを検索", menu: "メニューを開く", more: "その他", close: "閉じる" },
    search: { placeholder: "作業、形式、別名で検索", command: "ツールを検索", noResults: "一致するツールがありません", noResultsBody: "PDF や JPG などの形式を試すか、カテゴリを開いてください。", clear: "検索をクリア", browse: "カテゴリを見る", hint: "作業、形式、別名で検索", inputLabel: "ツールを検索" },
    shortcuts: { title: "ショートカット", description: "最近使ったツールと保存したツールはこのデバイスに残ります。", recent: "最近使ったツール", favorites: "お気に入り", clear: "最近の履歴を消去", empty: "ファイルを処理するか、ツールを保存するとここに表示されます。", remove: "お気に入りから削除" },
    category: { filterLabel: "形式で絞り込む", allFormats: "すべての形式", clear: "絞り込みを解除", showing: "表示", noMatches: "条件に一致するツールがありません", noMatchesBody: "形式の絞り込みを解除するか、別のカテゴリを開いてください。", browseAll: "すべてのツールを見る", favorite: "お気に入りに追加", unfavorite: "お気に入りから削除" },
    tool: { home: "ホーム", favorite: "お気に入りに追加", unfavorite: "お気に入りから削除", local: "ブラウザで処理", server: "サーバーで処理", consent: "アップロードには同意が必要です", files: "ファイル", options: "オプション", presets: "保存したプリセット", presetName: "プリセット名", savePreset: "プリセットを保存", apply: "適用", deletePreset: "削除", reset: "初期値に戻す", stale: "オプションが変更されました。結果を更新するには再処理してください。", retry: "再試行", results: "結果", downloadAll: "成功したファイルをダウンロード", continue: "この結果から続ける", choose: "ファイルを選択", review: "確認", process: "処理", download: "ダウンロード" },
  },
};

export function getUpgradeCopy(locale: Locale): UpgradeCopy { return localized[locale]; }

export function getThemeLabels(locale: Locale): { light: string; dark: string } {
  return ({
    ...expandedMap(c => ({ light: c.accessibility.light, dark: c.accessibility.dark })),
    ko: { light: "밝은 테마 사용", dark: "어두운 테마 사용" },
    it: { light: "Usa tema chiaro", dark: "Usa tema scuro" },
    en: { light: "Use light theme", dark: "Use dark theme" },
    "zh-CN": { light: "使用浅色主题", dark: "使用深色主题" },
    "zh-TW": { light: "使用淺色主題", dark: "使用深色主題" },
    es: { light: "Usar tema claro", dark: "Usar tema oscuro" },
    "pt-BR": { light: "Usar tema claro", dark: "Usar tema escuro" },
    de: { light: "Helles Design verwenden", dark: "Dunkles Design verwenden" },
    fr: { light: "Utiliser le thème clair", dark: "Utiliser le thème sombre" },
    ja: { light: "ライトテーマを使う", dark: "ダークテーマを使う" },
  } as Record<Locale, { light: string; dark: string }>)[locale];
}
import { expandedMap, packMap } from "./expanded-locales";
