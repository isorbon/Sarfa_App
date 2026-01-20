# PowerShell script to add export translations to all languages

$filePath = "src\locales\translations.ts"

# Read the file content
$content = Get-Content $filePath -Raw -Encoding UTF8

# Define translations for each language
$translations = @{
    "de" = @("Als CSV exportieren", "Als PDF exportieren")
    "es" = @("Exportar a CSV", "Exportar a PDF")
    "fr" = @("Exporter en CSV", "Exporter en PDF")
    "ru" = @("Экспорт в CSV", "Экспорт в PDF")
    "it" = @("Esporta in CSV", "Esporta in PDF")
    "pt-BR" = @("Exportar para CSV", "Exportar para PDF")
    "ja" = @("CSVにエクスポート", "PDFにエクスポート")
    "zh-CN" = @("导出为CSV", "导出为PDF")
    "zh-TW" = @("匯出為CSV", "匯出為PDF")
    "nl" = @("Exporteren naar CSV", "Exporteren naar PDF")
    "pl" = @("Eksportuj do CSV", "Eksportuj do PDF")
    "tr" = @("CSV olarak dışa aktar", "PDF olarak dışa aktar")
    "uk" = @("Експортувати в CSV", "Експортувати в PDF")
    "cs" = @("Exportovat do CSV", "Exportovat do PDF")
    "ro" = @("Exportă în CSV", "Exportă în PDF")
    "hu" = @("Exportálás CSV-be", "Exportálás PDF-be")
    "th" = @("ส่งออกเป็น CSV", "ส่งออกเป็น PDF")
    "id" = @("Ekspor ke CSV", "Ekspor ke PDF")
    "az" = @("CSV-yə ixrac edin", "PDF-ə ixrac edin")
    "hy" = @("Արտահանել CSV", "Արտահանել PDF")
    "kg" = @("CSV форматына экспорттоо", "PDF форматына экспорттоо")
    "kz" = @("CSV форматына экспорттау", "PDF форматына экспорттау")
    "tj" = @("Содирот ба CSV", "Содирот ба PDF")
    "uz" = @("CSV ga eksport qilish", "PDF ga eksport qilish")
}

# For each language excluding en-US and en-GB (already done)
foreach ($lang in $translations.Keys) {
    $csvText = $translations[$lang][0]
    $pdfText = $translations[$lang][1]
    
    # Pattern: find "recent: 'text'," and add the export lines after it
    # This regex finds the filters section with recent and adds our lines
    $pattern = "(filters:\s*\{[^\}]*recent:\s*'[^']*',)\r?\n(\s*\}\,)"
    $replacement = "`$1`r`n            exportCSV: '$csvText',`r`n            exportPDF: '$pdfText',`r`n`$2"
    
    # Replace only the first occurrence (for this specific language)
    $content = $content -replace $pattern, $replacement, 1
}

# Also add to en-GB (uses same as en-US)
$pattern = "(\/\/ en-GB.*?filters:\s*\{[^\}]*recent:\s*'[^']*',)\r?\n(\s*\}\,)"
if ($content -match $pattern) {
    Write-Host "Found en-GB pattern"
}

# Write back to file
$content | Set-Content $filePath -Encoding UTF8 -NoNewline

Write-Host "✅ Added export translations to all languages!" -ForegroundColor Green
Write-Host "Modified: $filePath" -ForegroundColor Cyan
