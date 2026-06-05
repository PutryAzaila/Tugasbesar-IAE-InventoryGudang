<?php

declare(strict_types=1);

namespace App\Support;

use ZipArchive;

final class XlsxWriter
{
    public function write(ZipArchive $zip, array $sheets): void
    {
        $zip->addFromString('[Content_Types].xml', $this->contentTypes(count($sheets)));
        $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
        $zip->addFromString('xl/workbook.xml', $this->workbookXml(array_keys($sheets)));
        $zip->addFromString('xl/_rels/workbook.xml.rels', $this->workbookRels(count($sheets)));
        $index = 1;
        foreach ($sheets as $rows) {
            $zip->addFromString("xl/worksheets/sheet{$index}.xml", $this->sheetXml($rows));
            $index++;
        }
    }

    private function contentTypes(int $sheetCount): string
    {
        $sheetTypes = '';
        for ($i = 1; $i <= $sheetCount; $i++) {
            $sheetTypes .= "<Override PartName=\"/xl/worksheets/sheet{$i}.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>";
        }
        return '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' . $sheetTypes . '</Types>';
    }

    private function workbookXml(array $names): string
    {
        $sheets = '';
        foreach ($names as $idx => $name) {
            $sheetId = $idx + 1;
            $safeName = htmlspecialchars(substr((string) $name, 0, 31), ENT_XML1);
            $sheets .= "<sheet name=\"{$safeName}\" sheetId=\"{$sheetId}\" r:id=\"rId{$sheetId}\"/>";
        }
        return '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' . $sheets . '</sheets></workbook>';
    }

    private function workbookRels(int $sheetCount): string
    {
        $relationships = '';
        for ($i = 1; $i <= $sheetCount; $i++) {
            $relationships .= "<Relationship Id=\"rId{$i}\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet{$i}.xml\"/>";
        }
        return '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . $relationships . '</Relationships>';
    }

    private function sheetXml(array $rows): string
    {
        $xmlRows = '';
        foreach (array_values($rows) as $rowIdx => $row) {
            $cells = '';
            foreach (array_values($row) as $colIdx => $value) {
                $cellRef = $this->columnName($colIdx + 1) . ($rowIdx + 1);
                if (is_int($value) || is_float($value)) {
                    $cells .= "<c r=\"{$cellRef}\"><v>{$value}</v></c>";
                } else {
                    $safeValue = htmlspecialchars((string) $value, ENT_XML1);
                    $cells .= "<c r=\"{$cellRef}\" t=\"inlineStr\"><is><t>{$safeValue}</t></is></c>";
                }
            }
            $rowNumber = $rowIdx + 1;
            $xmlRows .= "<row r=\"{$rowNumber}\">{$cells}</row>";
        }
        return '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' . $xmlRows . '</sheetData></worksheet>';
    }

    private function columnName(int $number): string
    {
        $name = '';
        while ($number > 0) {
            $number--;
            $name = chr(65 + ($number % 26)) . $name;
            $number = intdiv($number, 26);
        }
        return $name;
    }
}
