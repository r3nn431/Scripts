// ==UserScript==
// @name        Nexus Mods - Hide Translations
// @namespace   Violentmonkey Scripts
// @icon        https://www.google.com/s2/favicons?sz=64&domain=nexusmods.com
// @match       https://www.nexusmods.com/*/mods/*
// @grant       none
// @version     1.1
// @author      r3nn431
// @description Hides mods that appear in the "Mods using this mod" tab if they are already listed as translations.
// @run-at      document-idle
// @downloadURL https://raw.githubusercontent.com/r3nn431/Scripts/main/nexus-hide-translations.user.js
// @updateURL   https://raw.githubusercontent.com/r3nn431/Scripts/main/nexus-hide-translations.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const translationKeywords = [
        'tradução', 'traducao', 'translation', 'traduzione', 'traducion', 'traducción', 'übersetzung', 'перевод', '翻译', '번역', 'ترجمة', 'pt-br'
    ];

    const keywordRegex = new RegExp(`\\b(${translationKeywords.join('|')})\\b`, 'i');

    function hideTranslations() {
        // Captura os IDs das traduções listadas na aba oficial de traduções
        const translationLinks = document.querySelectorAll('.table-translation-name a[href*="/mods/"]');
        const translationIds = new Set();

        translationLinks.forEach(link => {
            const match = link.href.match(/mods\/(\d+)/);
            if (match) translationIds.add(match[1]);
        });

        // Alvos antigos (.table-require-name) + novos containers de "Mods using this mod"
        // Geralmente o Nexus renderiza tabelas com classes como '.table-required-by-name' ou links dentro do bloco de lazy load
        const requirementLinks = document.querySelectorAll('.table-require-name a[href*="/mods/"], .table-required-by-name a[href*="/mods/"], [data-lazy-url*="required-by"] a[href*="/mods/"]');

        requirementLinks.forEach(link => {
            const modIdMatch = link.href.match(/mods\/(\d+)/);
            const modName = link.innerText.trim();
            const modId = modIdMatch ? modIdMatch[1] : null;

            // Evita processar elementos vazios ou o próprio container de carregamento
            if (!modName) return;

            const isListedTranslation = modId && translationIds.has(modId);
            const hasTranslationKeyword = keywordRegex.test(modName);

            if (isListedTranslation || hasTranslationKeyword) {
                // Tenta esconder a linha da tabela (tr) ou o item de lista (li) mais próximo
                const row = link.closest('tr') || link.closest('li');
                if (row && row.style.display !== 'none') {
                    row.style.display = 'none';
                    console.log(`[Nexus - Hide Translations] Hidden: "${modName}" (ID: ${modId}) ${link.href}`);
                }
            }
        });
    }

    // Monitora mudanças na DOM (essencial para conteúdos carregados por Lazy Load / AJAX)
    const observer = new MutationObserver(() => hideTranslations());
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
        console.log(`[Nexus - Hide Translations] MutationObserver active`);
    }
    hideTranslations();
})();