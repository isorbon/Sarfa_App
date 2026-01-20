import re

# Export translations for all 26 languages
EXPORT_TRANSLATIONS = {
    'en-US': ('Export to CSV', 'Export to PDF'),
    'en-GB': ('Export to CSV', 'Export to PDF'),
    'de': ('Als CSV exportieren', 'Als PDF exportieren'),
    'es': ('Exportar a CSV', 'Exportar a PDF'),
    'fr': ('Exporter en CSV', 'Exporter en PDF'),
    'ru': ('Экспорт в CSV', 'Экспорт в PDF'),
    'it': ('Esporta in CSV', 'Esporta in PDF'),
    'pt-BR': ('Exportar para CSV', 'Exportar para PDF'),
    'ja': ('CSVにエクスポート', 'PDFにエクスポート'),
    'zh-CN': ('导出为CSV', '导出为PDF'),
    'zh-TW': ('匯出為CSV', '匯出為PDF'),
    'nl': ('Exporteren naar CSV', 'Exporteren naar PDF'),
    'pl': ('Eksportuj do CSV', 'Eksportuj do PDF'),
    'tr': ('CSV olarak dışa akt

ar', 'PDF olarak dışa aktar'),
    'uk': ('Експортувати в CSV', 'Експортувати в PDF'),
    'cs': ('Exportovat do CSV', 'Exportovat do PDF'),
    'ro': ('Exportă în CSV', 'Exportă în PDF'),
    'hu': ('Exportálás CSV-be', 'Exportálás PDF-be'),
    'th': ('ส่งออกเป็น CSV', 'ส่งออกเป็น PDF'),
    'id': ('Ekspor ke CSV', 'Ekspor ke PDF'),
    'az': ('CSV-yə ixrac edin', 'PDF-ə ixrac edin'),
    'hy': ('Արտահանել CSV', 'Արտահանել PDF'),
    'kg': ('CSV форматына экспорттоо', 'PDF форматына экспорттоо'),
    'kz': ('CSV форматына экспорттау', 'PDF форматына экспорттау'),
    'tj': ('Содирот ба CSV', 'Содирот ба PDF'),
    'uz': ('CSV ga eksport qilish', 'PDF ga eksport qilish'),
}

# Read the translations file
file_path = r'c:\Users\sorbon.imomnazarov\OneDrive - Accenture\Desktop\antigravity\expenses\src\locales\translations.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For each language, find the filters section and add export translations
for lang_code, (csv_text, pdf_text) in EXPORT_TRANSLATIONS.items():
    # Find the filters section for this language
    # Pattern: filters: {\n ... recent: 'xxx',\n    },
    pattern = r"(filters:\s*\{[^\}]*recent:\s*'[^']*',)\n(\s*\}\,)"
    
    replacement = rf"\1\n        exportCSV: '{csv_text}',\n        exportPDF: '{pdf_text}',\n\2"
    
    # Apply the replacement (only once per language)
    content = re.sub(pattern, replacement, content, count=1)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added export translations to all 26 languages!")
